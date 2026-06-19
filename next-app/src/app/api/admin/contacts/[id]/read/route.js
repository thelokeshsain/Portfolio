import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Contact from "@/models/Contact";
import { requireAdmin } from "@/lib/auth";

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }
    const adminId = authResult.admin._id;

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid contact ID" }, { status: 400 });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    ).lean();

    if (!contact) {
      return NextResponse.json({ message: "Contact not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Marked as read", contact });
  } catch (err) {
    console.error("[Contact Read PUT]", err.message);
    return NextResponse.json({ message: "Failed to mark as read" }, { status: 500 });
  }
}
