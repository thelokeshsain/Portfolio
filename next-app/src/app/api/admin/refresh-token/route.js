import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import Admin from "@/models/Admin";
import RefreshSession from "@/models/RefreshSession";
import blocklist from "@/utils/tokenBlocklist";
import jwt from "jsonwebtoken";

const REFRESH_TOKEN_MS = 7 * 24 * 60 * 60 * 1000;

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
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

function validateCsrf(request, session) {
  const headerToken = request.headers.get("x-csrf-token");
  const cookieToken = request.cookies.get("csrfToken")?.value;
  if (!headerToken || !cookieToken || headerToken !== cookieToken) return false;
  return hashToken(headerToken) === session?.csrfTokenHash;
}

export async function POST(request) {
  const token = request.cookies.get("refreshToken")?.value;
  if (!token) return NextResponse.json({ message: "Session expired" }, { status: 401 });

  try {
    await connectDB();
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "lokesh-portfolio-admin",
      audience: "lokesh-portfolio-admin",
    });

    if (!decoded.sid) {
      return NextResponse.json({ message: "Invalid refresh session" }, { status: 401 });
    }

    const now = new Date();
    const session = await RefreshSession.findOne({
      sessionId: decoded.sid,
      admin: decoded.id,
      revokedAt: null,
      expiresAt: { $gt: now },
    });

    if (!session) {
      const res = NextResponse.json({ message: "Session expired" }, { status: 401 });
      res.cookies.delete("refreshToken");
      res.cookies.delete("csrfToken");
      return res;
    }

    if (!validateCsrf(request, session)) {
      return NextResponse.json({ message: "Invalid CSRF token" }, { status: 403 });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return NextResponse.json({ message: "Admin account not found" }, { status: 401 });
    }

    const csrfToken = crypto.randomBytes(32).toString("hex");
    const newRefreshToken = signRefreshToken(admin._id, session.sessionId);
    
    const updatedSession = await RefreshSession.findOneAndUpdate(
      {
        _id: session._id,
        refreshTokenHash: hashToken(token),
        revokedAt: null,
        expiresAt: { $gt: now },
      },
      {
        $set: {
          refreshTokenHash: hashToken(newRefreshToken),
          csrfTokenHash: hashToken(csrfToken),
          lastUsedAt: now,
          expiresAt: new Date(Date.now() + REFRESH_TOKEN_MS),
        },
      },
      { new: true }
    );

    if (!updatedSession) {
      session.revokedAt = new Date();
      session.revokedReason = "refresh_reuse_detected";
      await session.save();
      const res = NextResponse.json({ message: "Security breach detected — please login again" }, { status: 401 });
      res.cookies.delete("refreshToken");
      res.cookies.delete("csrfToken");
      return res;
    }

    const newAccessToken = signAccessToken(admin._id, admin.tokenVersion, session.sessionId);

    const response = NextResponse.json({ token: newAccessToken, csrfToken });
    const isSecure = process.env.NODE_ENV === "production";

    response.cookies.set("refreshToken", newRefreshToken, {
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
    const res = NextResponse.json({ message: "Invalid refresh session" }, { status: 401 });
    res.cookies.delete("refreshToken");
    res.cookies.delete("csrfToken");
    return res;
  }
}
