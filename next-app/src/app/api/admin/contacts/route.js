import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Contact from "@/models/Contact";
import { requireAdmin } from "@/lib/auth";

export async function GET(request) {
  try {
    await connectDB();
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }
    const adminId = authResult.admin._id;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page")) || 1);
    const limit = Math.min(50, parseInt(searchParams.get("limit")) || 20);
    const skip = (page - 1) * limit;

    const [contacts, total] = await Promise.all([
      Contact.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Contact.countDocuments(),
    ]);

    return NextResponse.json({
      contacts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[Contacts GET]", err.message);
    return NextResponse.json(
      { message: "Failed to retrieve contacts" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }
    const adminId = authResult.admin._id;

    const result = await Contact.deleteMany({ read: true });
    return NextResponse.json({ message: `Deleted ${result.deletedCount} read message(s)` });
  } catch (err) {
    console.error("[Contacts DELETE Bulk]", err.message);
    return NextResponse.json(
      { message: "Bulk delete failed" },
      { status: 500 }
    );
  }
}
