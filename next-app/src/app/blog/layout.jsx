import "./perspectives.css";
import BlogMasthead from "@/components/blog/BlogMasthead";
import Link from "next/link";
import { Suspense } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://lokeshsain.vercel.app";

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Perspectives — Lokesh Sain | Software Engineering & System Architecture",
    template: "%s | Lokesh Sain — Perspectives",
  },
  description:
    "Technical perspectives, architectural postmortems, and engineering analyses on software architecture, Next.js performance, and modern web systems by Lokesh Sain.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/blog",
    siteName: "Lokesh Sain — Perspectives",
    title: "Lokesh Sain — Perspectives | Software Engineering & System Architecture",
    description:
      "Technical perspectives, architectural postmortems, and engineering analyses on software architecture, Next.js performance, and web systems.",
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
      "Technical perspectives on software engineering, Next.js architecture, web performance, and systems design.",
    images: ["/images/social_preview.webp"],
  },
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogLayout({ children }) {
  return (
    <div className="perspectives-theme">
      <BlogMasthead />
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
            Software engineering analyses, Next.js architecture postmortems, and web performance insights by Lokesh Sain.
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
