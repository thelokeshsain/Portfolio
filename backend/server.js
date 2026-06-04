require("dotenv").config();

// DNS override for environments where local DNS cannot resolve MongoDB Atlas SRV records.
// Set DNS_OVERRIDE=false in .env to disable (e.g. corporate networks with internal DNS).
if (process.env.DNS_OVERRIDE !== "false") {
  const dns = require("dns");
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

let server; // Track server instance for graceful shutdown
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

const compression = require("compression");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoSanitize = require("./middleware/sanitize");
const crypto = require("crypto");
const connectDB = require("./config/db");
const { generalLimiter } = require("./middleware/rateLimit");

const REQUIRED_ENV = [
  "NODE_ENV",
  "MONGODB_URI",
  "JWT_SECRET",
  "ADMIN_EMAIL",
  "CLIENT_URL",
];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`\n❌  Missing env var: ${key}\n`);
    process.exit(1);
  }
}
if (process.env.JWT_SECRET.length < 32) {
  console.error("\n❌  JWT_SECRET must be ≥32 chars\n");
  process.exit(1);
}
if (process.env.JWT_SECRET === "REPLACE_WITH_64_CHAR_RANDOM_HEX_STRING") {
  console.error("\n❌  Change JWT_SECRET!\n");
  process.exit(1);
}

const cache = require("./utils/responseCache");
const toPublicPortfolio = require("./utils/publicPortfolio");

const app = express();

const trustProxy = process.env.TRUST_PROXY === "true";
if (trustProxy) {
  app.set("trust proxy", 1);
}

// Compression first — compresses all downstream responses
app.use(compression());

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    permittedCrossDomainPolicies: { permittedPolicies: "none" },
  }),
);

// SEC-03: Permissions-Policy — restrict browser features
app.use((_req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
  );
  next();
});

// Assign unique request ID for tracing
app.use((req, _res, next) => {
  req.id = crypto.randomBytes(8).toString("hex");
  req.startTime = Date.now();
  next();
});

// SEC-01: Restore process.env.CLIENT_URL for CORS origin whitelist
const ALLOWED_ORIGINS = (process.env.CLIENT_URL || "http://localhost:5174")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      console.warn(`[SECURITY] CORS rejected origin: ${origin}`);
      cb(new Error(`CORS: origin not allowed — ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
    credentials: true,
    maxAge: 86400,
  }),
);
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined", { skip: (req) => req.url === "/api/health" }));
}

// 3mb for admin portfolio (profile image base64 ~400kb from 300kb file)
app.use("/api/admin/portfolio", express.json({ limit: "3mb" }));
app.use(
  "/api/admin/portfolio",
  express.urlencoded({ extended: true, limit: "3mb" }),
);
// 100kb for all other routes
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.use(mongoSanitize);

app.get("/api/health", (_req, res) =>
  res
    .set("Cache-Control", "no-store")
    .json({ status: "ok", ts: new Date().toISOString() }),
);

app.use("/api/", generalLimiter);

app.use("/api/portfolio", require("./routes/portfolioRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use((_req, res) => res.status(404).json({ message: "Not found" }));

// Centralized error handler with duration logging and safe production messages
app.use((err, req, res, _next) => {
  const isDev = process.env.NODE_ENV === "development";
  const duration = req.startTime ? `${Date.now() - req.startTime}ms` : "?";
  const status = err.status || 500;

  // Log with request context for tracing
  console.error(
    `[${req.id}] ${req.method} ${req.path} → ${status} (${duration}) ${err.message}`,
  );

  // Never leak stack traces or internal error messages in production
  res.status(status).json({
    message: isDev ? err.message : "Internal server error",
    ...(isDev && { requestId: req.id, stack: err.stack }),
  });
});

const PORT = parseInt(process.env.PORT) || 5000;

async function startServer() {
  await connectDB();

  try {
    const Portfolio = require("./models/Portfolio");
    const portfolioDoc = await Portfolio.findOne({})
      .select("-__v")
      .maxTimeMS(3000)
      .lean();
    if (portfolioDoc) {
      cache.set("portfolio", toPublicPortfolio(portfolioDoc), 300);
    }
  } catch (err) {
    console.warn("⚠️  Portfolio warm cache failed:", err.message);
  }

  server = app.listen(PORT, () => {
    console.log(
      `\n🚀  Server on :${PORT}  [${process.env.NODE_ENV || "development"}]`,
    );
    console.log(`    Proxy trust: ${trustProxy}`);
    console.log(`    CORS origins: ${ALLOWED_ORIGINS.join(", ")}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
module.exports = app;
