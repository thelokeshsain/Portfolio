"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, ArrowLeft, Menu } from "lucide-react";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("q") || "";

  const [searchVal, setSearchVal] = useState(initialSearch);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchVal.trim()) {
      params.set("q", searchVal.trim());
    } else {
      params.delete("q");
    }
    router.push(`/blog?${params.toString()}`);
  };

  const handleClearSearch = () => {
    setSearchVal("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    router.push(`/blog?${params.toString()}`);
  };

  const handleCategorySelect = (catId) => {
    const params = new URLSearchParams(searchParams.toString());
    if (catId === "all") {
      params.delete("category");
    } else {
      params.set("category", catId);
    }
    router.push(`/blog?${params.toString()}`);
    setMobileMenuOpen(false);
  };

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

          {/* Search Bar on Desktop */}
          <form onSubmit={handleSearchSubmit} className="p-search-wrapper">
            <Search size={14} className="p-search-icon" />
            <input
              type="text"
              placeholder="Search perspectives..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="p-search-input"
              aria-label="Search articles"
            />
            {searchVal && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="p-search-clear"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </form>
        </div>

        {/* Categories Bar */}
        <nav className="p-nav-bar" aria-label="Blog categories">
          <div className="p-categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.id)}
                className={`p-category-tab${activeCategory === cat.id ? " active" : ""}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
