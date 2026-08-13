import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Admin from "@/models/Admin";
import RefreshSession from "@/models/RefreshSession";
import { withAuth } from "@/lib/auth";

export const PUT = withAuth(async (request) => {
  try {
    await connectDB();
    const { currentPassword, newPassword } = await request.json().catch(() => ({}));

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "Current password and new password are required" }, { status: 400 });
    }

    if (newPassword.length < 12) {
      return NextResponse.json({ message: "New password must be at least 12 characters" }, { status: 400 });
    }

    const admin = await Admin.findById(request.admin._id).select("+password");
    if (!admin) {
      return NextResponse.json({ message: "Admin user not found" }, { status: 404 });
    }

    const isValid = await admin.comparePassword(currentPassword);
    if (!isValid) {
      return NextResponse.json({ message: "Incorrect current password" }, { status: 401 });
    }

    admin.password = newPassword;
    admin.tokenVersion = (admin.tokenVersion || 0) + 1;
    await admin.save();

    // Revoke all refresh sessions
    await RefreshSession.updateMany(
      { admin: admin._id, revokedAt: null },
      { $set: { revokedAt: new Date(), revokedReason: "password_changed" } }
    );

    const response = NextResponse.json({ message: "Password updated successfully! Please log in again." });
    response.cookies.delete("refreshToken");
    response.cookies.delete("csrfToken");
    return response;
  } catch (err) {
    console.error("[Change Password PUT]", err.message);
    return NextResponse.json({ message: "Failed to update password" }, { status: 500 });
  }
});
