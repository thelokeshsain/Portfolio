"use client";

import { usePathname } from "next/navigation";
import { ADS_CONFIG } from "@/config/ads";

export default function AdSenseScript() {
  const pathname = usePathname();
  const adClientId = ADS_CONFIG.getClientId();

  if (!adClientId) return null;

  // Google Publisher Policy Compliance:
  // Strictly avoid loading AdSense on administrative screens,
  // authentication dashboards, private draft previews, or internal APIs.
  const isExcluded =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/blog/preview") ||
    pathname?.startsWith("/api");

  if (isExcluded) {
    return null;
  }

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClientId}`}
      crossOrigin="anonymous"
    />
  );
}
