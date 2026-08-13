import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Admin from "@/models/Admin";
import RefreshSession from "@/models/RefreshSession";
import otpStore from "@/utils/otpStore";

export async function POST(request) {
  try {
    await connectDB();
    const { email, otp, newPassword } = await request.json().catch(() => ({}));

    if (!otp || !newPassword) {
      return NextResponse.json({ message: "OTP code and new password are required" }, { status: 400 });
    }

    if (newPassword.length < 12) {
      return NextResponse.json({ message: "Password must be at least 12 characters" }, { status: 400 });
    }

    const targetEmail = email || process.env.OWNER_EMAIL || "iamlokeshsain@gmail.com";
    const admin = await Admin.findOne({ email: targetEmail.toLowerCase().trim() });

    if (!admin) {
      return NextResponse.json({ message: "Invalid request or expired OTP" }, { status: 400 });
    }

    const storedOtpData = await otpStore.get(`reset_${admin._id}`);

    if (!storedOtpData || storedOtpData.code !== String(otp).trim()) {
      return NextResponse.json({ message: "Invalid or expired OTP code" }, { status: 400 });
    }

    // Clear OTP
    await otpStore.delete(`reset_${admin._id}`);

    // Update password
    admin.password = newPassword;
    admin.tokenVersion = (admin.tokenVersion || 0) + 1;
    await admin.save();

    // Revoke old sessions
    await RefreshSession.updateMany(
      { admin: admin._id, revokedAt: null },
      { $set: { revokedAt: new Date(), revokedReason: "password_reset" } }
    );

    return NextResponse.json({ message: "Password reset successful! You can now log in." });
  } catch (err) {
    console.error("[Reset Password API]", err.message);
    return NextResponse.json({ message: "Failed to reset password" }, { status: 500 });
  }
}
