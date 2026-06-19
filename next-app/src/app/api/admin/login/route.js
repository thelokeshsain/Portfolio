import { NextResponse } from "next/server";
import crypto from "crypto";
import bcryptjs from "bcryptjs";
import connectDB from "@/lib/db";
import Admin from "@/models/Admin";
import RefreshSession from "@/models/RefreshSession";
import otpStore from "@/utils/otpStore";
import sendMail from "@/lib/mailer";
import { twoFactorEmail, loginAlertEmail } from "@/utils/emailTemplates";
import jwt from "jsonwebtoken";

const REFRESH_TOKEN_MS = 7 * 24 * 60 * 60 * 1000;

function signAccessToken(adminId, tokenVersion = 0, sessionId) {
  return jwt.sign(
    {
      id: String(adminId),
      role: "admin",
      v: tokenVersion,
      sid: sessionId,
      jti: crypto.randomBytes(16).toString("hex"),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
      algorithm: "HS256",
      issuer: "lokesh-portfolio-admin",
      audience: "lokesh-portfolio-admin",
    }
  );
}

function signRefreshToken(adminId, sessionId) {
  const jti = crypto.randomBytes(16).toString("hex");
  return jwt.sign(
    { id: String(adminId), sid: sessionId, jti },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
      algorithm: "HS256",
      issuer: "lokesh-portfolio-admin",
      audience: "lokesh-portfolio-admin",
    }
  );
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getClientIp(request) {
  return request.headers.get("x-forwarded-for") || request.ip || "unknown";
}

function parseBrowser(ua = "") {
  if (ua.includes("Edg/")) return `Edge ${(ua.match(/Edg\/([\d.]+)/) || [])[1] || ""}`;
  if (ua.includes("Chrome/")) return `Chrome ${(ua.match(/Chrome\/([\d.]+)/) || [])[1] || ""}`;
  if (ua.includes("Firefox/")) return `Firefox ${(ua.match(/Firefox\/([\d.]+)/) || [])[1] || ""}`;
  if (ua.includes("Safari/") && !ua.includes("Chrome")) return `Safari ${(ua.match(/Version\/([\d.]+)/) || [])[1] || ""}`;
  if (ua.includes("OPR/")) return `Opera ${(ua.match(/OPR\/([\d.]+)/) || [])[1] || ""}`;
  return ua.slice(0, 60) || "Unknown";
}

function getDevice(ua = "") {
  if (/mobile/i.test(ua)) return "Mobile";
  if (/tablet|ipad/i.test(ua)) return "Tablet";
  if (/android/i.test(ua)) return "Android";
  return "Desktop";
}

function buildRequestMeta(request) {
  const ua = request.headers.get("user-agent") || "";
  return {
    ip: getClientIp(request),
    browser: parseBrowser(ua),
    device: getDevice(ua),
    dateStr: new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "medium",
    }),
    userAgent: ua,
  };
}

async function issueSession(request, admin) {
  const meta = buildRequestMeta(request);
  const sessionId = crypto.randomBytes(16).toString("hex");
  const csrfToken = crypto.randomBytes(32).toString("hex");
  const refreshToken = signRefreshToken(admin._id, sessionId);

  await RefreshSession.create({
    admin: admin._id,
    sessionId,
    refreshTokenHash: hashToken(refreshToken),
    csrfTokenHash: hashToken(csrfToken),
    ip: meta.ip,
    userAgent: meta.userAgent.slice(0, 500),
    browser: meta.browser,
    device: meta.device,
    lastUsedAt: new Date(),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_MS),
  });

  return {
    accessToken: signAccessToken(admin._id, admin.tokenVersion, sessionId),
    refreshToken,
    csrfToken,
  };
}

export async function POST(request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    const admin = await Admin.findOne({ email }).select("+password +totpSecret");
    const DUMMY_HASH = "$2a$12$rBFqLJNTvLuIy0z3RkMCce3wfRSLq7X3YMp5HHvV.6Z/bDmSNu1uO";
    const passwordValid = admin
      ? await admin.comparePassword(password)
      : await bcryptjs.compare(password, DUMMY_HASH);

    if (!admin || !passwordValid) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    if (admin.twoFactorEnabled) {
      const tempToken = crypto.randomBytes(32).toString("hex");
      if (admin.totpEnabled && admin.totpSecret) {
        await otpStore.set(tempToken, {
          adminId: String(admin._id),
          type: "totp",
        });
        return NextResponse.json({ requiresTwoFactor: true, method: "totp", tempToken });
      }
      const otpCode = crypto.randomInt(100000, 999999).toString();
      await otpStore.set(tempToken, {
        codeHash: hashToken(otpCode),
        adminId: String(admin._id),
        type: "email",
      });
      try {
        await sendMail({
          to: admin.email,
          subject: "🔐 Admin Login — Verification Code",
          html: twoFactorEmail(otpCode),
        });
      } catch (e) {
        console.error("[2FA email]", e.message);
      }
      return NextResponse.json({ requiresTwoFactor: true, method: "email", tempToken });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const { accessToken, refreshToken, csrfToken } = await issueSession(request, admin);

    const meta = buildRequestMeta(request);
    sendMail({
      to: admin.email,
      subject: "🔐 Admin Login Detected — Lokesh Portfolio",
      html: loginAlertEmail(meta),
    }).catch((e) => console.error("[Login alert]", e.message));

    const response = NextResponse.json({
      token: accessToken,
      csrfToken,
      admin: { id: admin._id, email: admin.email, role: admin.role },
    });

    const isSecure = process.env.NODE_ENV === "production";
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/api/admin",
      maxAge: REFRESH_TOKEN_MS / 1000,
    });
    response.cookies.set("csrfToken", csrfToken, {
      httpOnly: false,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_TOKEN_MS / 1000,
    });

    return response;
  } catch (err) {
    console.error("[Login]", err.message);
    return NextResponse.json(
      { message: "Login failed — please try again" },
      { status: 500 }
    );
  }
}
