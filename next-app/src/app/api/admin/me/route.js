import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (request) => {
  return NextResponse.json({
    admin: {
      id: request.admin._id,
      email: request.admin.email,
      role: request.admin.role,
      totpEnabled: request.admin.totpEnabled,
    },
  });
});
