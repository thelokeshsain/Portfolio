require('dotenv').config()

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

const compression   = require('compression')
const express       = require('express')
const cors          = require('cors')
const cookieParser  = require('cookie-parser')
const helmet        = require('helmet')
const morgan        = require('morgan')
const mongoSanitize = require('./middleware/sanitize')
const crypto        = require('crypto')
const connectDB     = require('./config/db')
const { generalLimiter } = require('./middleware/rateLimit')

const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET', 'ADMIN_EMAIL']
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) { console.error(`\n❌  Missing env var: ${key}\n`); process.exit(1) }
}
if (process.env.JWT_SECRET.length < 32) { console.error('\n❌  JWT_SECRET must be ≥32 chars\n'); process.exit(1) }
if (process.env.JWT_SECRET === 'REPLACE_WITH_64_CHAR_RANDOM_HEX_STRING') { console.error('\n❌  Change JWT_SECRET!\n'); process.exit(1) }

connectDB()
const app = express()

const trustProxy = process.env.TRUST_PROXY === 'true'
if (trustProxy) { app.set('trust proxy', 1) }

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"], scriptSrc: ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc:    ["'self'", 'https://fonts.gstatic.com'],
      imgSrc:     ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"], objectSrc: ["'none'"],
      frameSrc:   ["'none'"], frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts:                       { maxAge: 63072000, includeSubDomains: true, preload: true },
  referrerPolicy:             { policy: 'strict-origin-when-cross-origin' },
  crossOriginEmbedderPolicy:  false,
  crossOriginOpenerPolicy:    { policy: 'same-origin-allow-popups' },
  crossOriginResourcePolicy:  { policy: 'cross-origin' },
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
}))

app.use((req, _res, next) => { req.id = crypto.randomBytes(8).toString('hex'); next() })

const ALLOWED_ORIGINS = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',').map(o => o.trim()).filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true)
    cb(new Error(`CORS: origin not allowed — ${origin}`))
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','x-csrf-token'],
  credentials: true, maxAge: 86400,
}))
app.use(cookieParser())

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined', { skip: (req) => req.url === '/api/health' }))
}

app.use(compression())

// 3mb for admin portfolio (profile image base64 ~400kb from 300kb file)
app.use('/api/admin/portfolio', express.json({ limit: '3mb' }))
app.use('/api/admin/portfolio', express.urlencoded({ extended: true, limit: '3mb' }))
// 100kb for all other routes
app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: true, limit: '100kb' }))

app.use(mongoSanitize)
app.use('/api/', generalLimiter)

app.use('/api/portfolio', require('./routes/portfolioRoutes'))
app.use('/api/contact',   require('./routes/contactRoutes'))
app.use('/api/admin',     require('./routes/adminRoutes'))

app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))
app.use((_req, res) => res.status(404).json({ message: 'Not found' }))

app.use((err, req, res, _next) => {
  const isDev = process.env.NODE_ENV === 'development'
  console.error(`[${req.id}] ${req.method} ${req.path} → ${err.message}`)
  res.status(err.status || 500).json({
    message: isDev ? err.message : 'Internal server error',
    ...(isDev && { requestId: req.id, stack: err.stack }),
  })
})

const PORT = parseInt(process.env.PORT) || 5000
app.listen(PORT, () => {
  console.log(`\n🚀  Server on :${PORT}  [${process.env.NODE_ENV || 'development'}]`)
  console.log(`    Proxy trust: ${trustProxy}`)
  console.log(`    CORS origins: ${ALLOWED_ORIGINS.join(', ')}\n`)
})
module.exports = app
