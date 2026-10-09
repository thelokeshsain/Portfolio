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
          <div className="p-masthead-top-left">
            <Link
              href="/"
              className="p-masthead-return-link"
              aria-label="Return to portfolio homepage"
            >
              <ArrowLeft size={13} /> Return to Portfolio
            </Link>
            <span className="p-masthead-divider" aria-hidden="true">|</span>
            <span className="p-masthead-edition">
              Editorial Edition &middot; Updated Daily
            </span>
          </div>

          <div className="p-masthead-top-right">
            <Link href="/#about">
              About Author
            </Link>
            <Link href="/#contact">
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
