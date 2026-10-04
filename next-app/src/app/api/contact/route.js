import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Contact from "@/models/Contact";
import sendMail from "@/lib/mailer";
import { confirmationEmail, notificationEmail } from "@/utils/emailTemplates";
import rateLimiter from "@/utils/rateLimiter";

function parseBrowser(ua = "") {
  if (ua.includes("Edg/")) return `Edge ${(ua.match(/Edg\/([\d.]+)/) || [])[1] || ""}`;
  if (ua.includes("Chrome/")) return `Chrome ${(ua.match(/Chrome\/([\d.]+)/) || [])[1] || ""}`;
  if (ua.includes("Firefox/")) return `Firefox ${(ua.match(/Firefox\/([\d.]+)/) || [])[1] || ""}`;
  if (ua.includes("Safari/") && !ua.includes("Chrome")) return `Safari ${(ua.match(/Version\/([\d.]+)/) || [])[1] || ""}`;
  if (ua.includes("OPR/")) return `Opera ${(ua.match(/OPR\/([\d.]+)/) || [])[1] || ""}`;
  return "Unknown";
}

function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || request.ip || "unknown";
}

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export async function POST(request) {
  try {
    const ip = getClientIp(request);

    // 1. Rate Limiting: Max 5 submissions per 10 minutes per IP
    const rateCheck = rateLimiter.check(`contact:${ip}`, 5, 10 * 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { message: `Too many submissions. Please wait ${rateCheck.retryAfter} seconds before trying again.` },
        { 
          status: 429,
          headers: { "Retry-After": String(rateCheck.retryAfter) }
        }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }

    const { name, email, message } = body || {};

    // 2. Strict Input Validation
    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }
    const cleanName = name.trim().replace(/[\r\n]/g, " ").slice(0, 100);
    if (cleanName.length < 2) {
      return NextResponse.json({ message: "Name must be at least 2 characters" }, { status: 400 });
    }

    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ message: "Valid email is required" }, { status: 400 });
    }
    const cleanEmail = email.trim().toLowerCase().slice(0, 120);
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json({ message: "Please provide a valid email address" }, { status: 400 });
    }

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ message: "Message is required" }, { status: 400 });
    }
    const cleanMessage = message.trim().slice(0, 2000);
    if (cleanMessage.length < 10) {
      return NextResponse.json({ message: "Message must be at least 10 characters" }, { status: 400 });
    }

    await connectDB();

    const userAgent = (request.headers.get("user-agent") || "").slice(0, 500);
    const browser = parseBrowser(userAgent);
    const device = /mobile|android|iphone|ipad/i.test(userAgent) ? "Mobile" : "Desktop";

    await Contact.create({
      name: cleanName,
      email: cleanEmail,
      message: cleanMessage,
      ip,
      userAgent,
      browser,
      device,
    });

    const dateStr = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "medium",
    });

    const confTpl = confirmationEmail(cleanName);
    const notifTpl = notificationEmail({
      name: cleanName,
      email: cleanEmail,
      message: cleanMessage,
      ip,
      userAgent,
      browser,
      device,
      dateStr,
    });

    // IMPORTANT: Must await emails on Vercel — serverless kills the process after response
    await Promise.allSettled([
      sendMail({
        to: cleanEmail,
        subject: "Message Received — Lokesh Sain",
        html: confTpl.html,
        text: confTpl.text,
      }).catch((e) => console.error("[Contact] Confirmation email failed:", e.message)),

      sendMail({
        to: process.env.OWNER_EMAIL || "iamlokeshsain@gmail.com",
        subject: `New Portfolio Contact — ${cleanName}`,
        html: notifTpl.html,
        text: notifTpl.text,
      }).catch((e) => console.error("[Contact] Admin notification failed:", e.message)),
    ]);

    return NextResponse.json({ message: "Message sent successfully" }, { status: 201 });
  } catch (err) {
    console.error("[Contact]", err.message);
    return NextResponse.json(
      { message: "Failed to send message - please try again" },
      { status: 500 }
    );
  }
}
