import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Contact from "@/models/Contact";
import sendMail from "@/lib/mailer";
import { confirmationEmail, notificationEmail } from "@/utils/emailTemplates";

function parseBrowser(ua = "") {
  if (ua.includes("Edg/")) return `Edge ${(ua.match(/Edg\/([\d.]+)/) || [])[1] || ""}`;
  if (ua.includes("Chrome/")) return `Chrome ${(ua.match(/Chrome\/([\d.]+)/) || [])[1] || ""}`;
  if (ua.includes("Firefox/")) return `Firefox ${(ua.match(/Firefox\/([\d.]+)/) || [])[1] || ""}`;
  if (ua.includes("Safari/") && !ua.includes("Chrome")) return `Safari ${(ua.match(/Version\/([\d.]+)/) || [])[1] || ""}`;
  if (ua.includes("OPR/")) return `Opera ${(ua.match(/OPR\/([\d.]+)/) || [])[1] || ""}`;
  return "Unknown";
}

function getClientIp(request) {
  return request.headers.get("x-forwarded-for") || request.ip || "unknown";
}

export async function POST(request) {
  try {
    await connectDB();
    const { name, email, message } = await request.json();

    const ip = getClientIp(request);
    const userAgent = (request.headers.get("user-agent") || "").slice(0, 500);
    const browser = parseBrowser(userAgent);
    const device = /mobile|android|iphone|ipad/i.test(userAgent) ? "Mobile" : "Desktop";

    await Contact.create({ name, email, message, ip, userAgent, browser, device });

    const dateStr = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "medium",
    });

    // IMPORTANT: Must await emails on Vercel — serverless kills the process after response
    await Promise.allSettled([
      sendMail({
        to: email,
        subject: "Got your message - Lokesh Sain",
        html: confirmationEmail(name),
      }).catch((e) => console.error("[Contact] Confirmation email failed:", e.message)),

      sendMail({
        to: process.env.OWNER_EMAIL,
        subject: `New message from ${name}`,
        html: notificationEmail({ name, email, message, ip, userAgent, browser, device, dateStr }),
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
