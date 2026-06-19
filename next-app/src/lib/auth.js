import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Admin from "@/models/Admin";
import RefreshSession from "@/models/RefreshSession";
import blocklist from "@/utils/tokenBlocklist";

export async function requireAdmin(request) {
  try {
    await connectDB();
    const authHeader = request.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return { error: "Authorization header missing or malformed", status: 401 };
    }

    const token = authHeader.slice(7);
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ["HS256"],
        issuer: "lokesh-portfolio-admin",
        audience: "lokesh-portfolio-admin",
      });
    } catch (err) {
      const msg =
        err.name === "TokenExpiredError"
          ? "Session expired — please login again"
          : "Invalid token";
      return { error: msg, status: 401 };
    }

    if (decoded.jti && (await blocklist.isRevoked(decoded.jti))) {
      return { error: "Token has been revoked — please login again", status: 401 };
    }

    const session = await RefreshSession.findOne({
      sessionId: decoded.sid,
      admin: decoded.id,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    }).populate("admin");

    if (!session || !session.admin) {
      return { error: "Session expired — please login again", status: 401 };
    }

    const admin = session.admin;

    if (decoded.v !== admin.tokenVersion) {
      return { error: "Session invalidated — please login again", status: 401 };
    }

    return {
      admin,
      tokenDecoded: decoded,
      authSession: session,
    };
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return { error: "Authentication error", status: 500 };
  }
}

export function withAuth(handler) {
  return async (request, context) => {
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json(
        { message: authResult.error },
        { status: authResult.status }
      );
    }

    request.admin = authResult.admin;
    request.tokenDecoded = authResult.tokenDecoded;
    request.authSession = authResult.authSession;

    return handler(request, context);
  };
}
