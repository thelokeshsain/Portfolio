import React, { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import BlogSearchBar from "./BlogSearchBar";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "Geopolitics", label: "Geopolitics" },
  { id: "Technology", label: "Technology" },
  { id: "Business", label: "Business" },
  { id: "Sports", label: "Sports" },
  { id: "Immigration & Careers", label: "Immigration & Careers" },
  { id: "Opinion", label: "Opinion" },
];

export default function BlogMasthead() {
  return (
    <header className="p-masthead" role="banner">
      {/* Top Utility Bar */}
      <div className="p-masthead-top">
        <div className="p-masthead-top-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontWeight: 600,
                color: "var(--p-text-secondary)",
              }}
            >
              <ArrowLeft size={13} /> Return to Portfolio
            </Link>
            <span style={{ color: "var(--p-border)" }}>|</span>
            <span style={{ color: "var(--p-text-muted)" }}>
              Editorial Edition &middot; Updated Daily
            </span>
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <Link href="/#about" style={{ color: "var(--p-text-secondary)" }}>
              About Author
            </Link>
            <Link href="/#contact" style={{ color: "var(--p-text-secondary)" }}>
              Contact
            </Link>
          </div>
        </div>
      </div>

      {/* Main Masthead Branding */}
      <div className="p-masthead-main">
        <div className="p-brand-row">
          <div>
            <Link href="/blog" className="p-wordmark">
              Lokesh Sain <span>— Perspectives</span>
            </Link>
            <p className="p-descriptor">
              Independent perspectives on technology, world affairs, business and sport.
            </p>
          </div>

          {/* Search Bar with Isolated Suspense */}
          <Suspense
            fallback={
              <div className="p-search-wrapper" style={{ opacity: 0.6 }}>
                <Search size={14} className="p-search-icon" />
                <input
                  type="search"
                  placeholder="Search perspectives..."
                  className="p-search-input"
                  disabled
                  aria-label="Loading search"
                />
              </div>
            }
          >
            <BlogSearchBar />
          </Suspense>
        </div>

        {/* Crawlable Categories Navigation Bar */}
        <nav className="p-nav-bar" aria-label="Blog categories">
          <div className="p-categories">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={cat.id === "all" ? "/blog" : `/blog?category=${encodeURIComponent(cat.id)}`}
                className="p-category-tab"
                prefetch={false}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
