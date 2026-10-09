"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export default function BlogSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get("q") || "";
  const [searchVal, setSearchVal] = useState(initialSearch);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    if (searchVal.trim()) {
      params.set("q", searchVal.trim());
    } else {
      params.delete("q");
    }
    router.push(`/blog?${params.toString()}`);
  };

  const handleClearSearch = () => {
    setSearchVal("");
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    params.delete("q");
    router.push(`/blog?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearchSubmit} className="p-search-wrapper" role="search">
      <Search size={14} className="p-search-icon" aria-hidden="true" />
      <input
        type="search"
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
  );
}
