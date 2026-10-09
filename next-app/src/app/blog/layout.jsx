import "./perspectives.css";
import BlogMasthead from "@/components/blog/BlogMasthead";
import Link from "next/link";
import { Suspense } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://lokeshsain.vercel.app";

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Perspectives — Lokesh Sain | Independent Analysis on Tech, Business & Policy",
    template: "%s | Lokesh Sain — Perspectives",
  },
  description:
    "Independent perspectives, technical essays, and long-form commentary on software engineering, technology policy, global affairs, and business by Lokesh Sain.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/blog",
    siteName: "Lokesh Sain — Perspectives",
    title: "Lokesh Sain — Perspectives | Independent Technical & Industry Analysis",
    description:
      "Independent perspectives, technical essays, and long-form commentary on software engineering, technology policy, global affairs, and business.",
    images: [
      {
        url: "/images/social_preview.webp",
        width: 1734,
        height: 907,
        alt: "Lokesh Sain — Perspectives",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lokesh Sain — Perspectives",
    description:
      "Independent perspectives on technology, world affairs, business and modern software engineering.",
    images: ["/images/social_preview.webp"],
  },
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogLayout({ children }) {
  return (
    <div className="perspectives-theme">
      <Suspense fallback={<div style={{ height: 120 }} />}>
        <BlogMasthead />
      </Suspense>
      <main id="main-content">{children}</main>
      <footer className="p-footer">
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <p
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: "var(--p-text-primary)",
              marginBottom: 6,
            }}
          >
            Lokesh Sain — Perspectives
          </p>
          <p style={{ marginBottom: 12, maxWidth: 600, margin: "0 auto 16px" }}>
            Independent perspectives on technology, world affairs, business and sport. Written by software engineer Lokesh Sain.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 20,
              fontSize: 13,
              flexWrap: "wrap",
            }}
          >
            <Link href="/">Portfolio Home</Link>
            <Link href="/blog">All Perspectives</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/#about">About the Author</Link>
            <Link href="/#contact">Editorial Inquiries</Link>
          </div>
          <p
            style={{
              marginTop: 18,
              fontSize: 12,
              color: "var(--p-text-muted)",
            }}
          >
            &copy; {new Date().getFullYear()} Lokesh Sain. Published independently from Jaipur, India.
          </p>
        </div>
      </footer>
    </div>
  );
}
