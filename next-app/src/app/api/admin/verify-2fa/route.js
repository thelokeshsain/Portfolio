import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import Admin from "@/models/Admin";
import RefreshSession from "@/models/RefreshSession";
import otpStore from "@/utils/otpStore";
import sendMail from "@/lib/mailer";
import { loginAlertEmail } from "@/utils/emailTemplates";
import jwt from "jsonwebtoken";
import * as OTPLib from "otpauth";

const REFRESH_TOKEN_MS = 7 * 24 * 60 * 60 * 1000;

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function codesMatch(expectedHash, code) {
  if (!expectedHash || !code) return false;
  const a = Buffer.from(expectedHash);
  const b = Buffer.from(hashToken(String(code).trim()));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
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
    const { token, code } = await request.json();

    if (!token || !code) {
      return NextResponse.json({ message: "Token and code required" }, { status: 400 });
    }

    const entry = await otpStore.get(token);
    if (!entry) {
      return NextResponse.json({ message: "Session expired — please login again" }, { status: 400 });
    }

    const admin = await Admin.findById(entry.adminId).select("+totpSecret");
    if (!admin) return NextResponse.json({ message: "Admin not found" }, { status: 401 });

    if (entry.type === "totp") {
      const totp = new OTPLib.TOTP({
        secret: OTPLib.Secret.fromBase32(admin.totpSecret),
        digits: 6,
        period: 30,
        algorithm: "SHA1",
      });
      const cleanCode = code.replace(/\s/g, "");
      if (totp.validate({ token: cleanCode, window: 1 }) === null) {
        return NextResponse.json({ message: "Invalid authenticator code. Check your device clock." }, { status: 400 });
      }
      
      const windowKey = `${entry.adminId}_${Math.floor(Date.now() / 30000)}_${cleanCode}`;
      const reserved = await otpStore.reserve(`totp-replay:${windowKey}`, { adminId: entry.adminId, type: "totp-replay" }, 2 * 60 * 1000);
      if (!reserved) {
        return NextResponse.json({ message: "Code already used — wait for the next code" }, { status: 400 });
      }
    } else {
      if (!codesMatch(entry.codeHash, code)) {
        return NextResponse.json({ message: "Invalid verification code" }, { status: 400 });
      }
    }

    await otpStore.delete(token);
    admin.lastLogin = new Date();
    await admin.save();

    const { accessToken, refreshToken, csrfToken } = await issueSession(request, admin);

    const meta = buildRequestMeta(request);
    sendMail({
      to: admin.email,
      subject: "🔐 Admin Login Detected — Lokesh Portfolio",
      html: loginAlertEmail(meta),
    }).catch((e) => console.error("[Login alert 2FA]", e.message));

    const response = NextResponse.json({
      token: accessToken,
      csrfToken,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        totpEnabled: admin.totpEnabled,
      },
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
    console.error("[Verify2FA]", err.message);
    return NextResponse.json({ message: "Verification failed — please try again" }, { status: 500 });
  }
}
