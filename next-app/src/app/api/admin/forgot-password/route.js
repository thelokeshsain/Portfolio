import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Admin from "@/models/Admin";
import otpStore from "@/utils/otpStore";
import sendMail from "@/lib/mailer";
import { resetPasswordEmail } from "@/utils/emailTemplates";

export async function POST(request) {
  try {
    await connectDB();
    const { email } = await request.json().catch(() => ({}));

    const targetEmail = email || process.env.OWNER_EMAIL || "iamlokeshsain@gmail.com";
    const admin = await Admin.findOne({ email: targetEmail.toLowerCase().trim() });

    if (!admin) {
      // Return success to prevent email enumeration
      return NextResponse.json({ message: "If account exists, OTP sent to email" });
    }

    // Generate 6-digit OTP code
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    await otpStore.set(`reset_${admin._id}`, { code: otpCode, adminId: admin._id }, 10 * 60 * 1000);

    // Send reset password OTP email
    await sendMail({
      to: admin.email || process.env.OWNER_EMAIL || "iamlokeshsain@gmail.com",
      subject: "🔑 Reset Your Password — Lokesh Portfolio",
      html: resetPasswordEmail(otpCode),
    });

    return NextResponse.json({ message: "OTP sent successfully to your email", email: admin.email });
  } catch (err) {
    console.error("[Forgot Password API]", err.message);
    return NextResponse.json({ message: "Failed to process request" }, { status: 500 });
  }
}
