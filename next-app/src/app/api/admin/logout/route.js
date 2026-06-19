import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import crypto from "crypto";
import sendMail from "@/lib/mailer";
import { logoutAlertEmail } from "@/utils/emailTemplates";

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

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function validateCsrf(request, session) {
  const headerToken = request.headers.get("x-csrf-token");
  const cookieToken = request.cookies.get("csrfToken")?.value;
  if (!headerToken || !cookieToken || headerToken !== cookieToken) return false;
  return hashToken(headerToken) === session?.csrfTokenHash;
}

export const POST = withAuth(async (request) => {
  const response = NextResponse.json({ message: "Logged out successfully" });
  response.cookies.delete("refreshToken");
  response.cookies.delete("csrfToken");

  if (!request.authSession || !validateCsrf(request, request.authSession)) {
    return NextResponse.json({ message: "Invalid CSRF token" }, { status: 403 });
  }

  request.authSession.revokedAt = new Date();
  request.authSession.revokedReason = "logout";
  await request.authSession.save();

  const meta = buildRequestMeta(request);
  sendMail({
    to: request.admin.email,
    subject: "Admin Logout — Lokesh Portfolio",
    html: logoutAlertEmail(meta),
  }).catch((e) => console.error("[Logout alert]", e.message));

  return response;
});
