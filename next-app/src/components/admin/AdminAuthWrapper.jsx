"use client";

import { AuthProvider } from "@/context/AuthContext";

export default function AdminAuthWrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
