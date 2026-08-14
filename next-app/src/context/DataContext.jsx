"use client";

/**
 * DataContext — Real-time Realized State
 * Guarantees that updates made in Admin Dashboard instantly reflect across the entire app
 */
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { PORTFOLIO } from "../lib/data";

const Ctx = createContext();
const API = process.env.NEXT_PUBLIC_API_URL || "/api";

function normalize(raw) {
  if (!raw) return PORTFOLIO;
  return {
    hero: raw.hero || PORTFOLIO.hero,
    stats: Array.isArray(raw.stats) ? raw.stats : PORTFOLIO.stats,
    about: Array.isArray(raw.about) ? raw.about : PORTFOLIO.about,
    education: Array.isArray(raw.education)
      ? raw.education
      : PORTFOLIO.education,
    achievements: Array.isArray(raw.achievements)
      ? raw.achievements
      : PORTFOLIO.achievements,
    experience: Array.isArray(raw.experience)
      ? raw.experience
      : PORTFOLIO.experience,
    projects: Array.isArray(raw.projects)
      ? raw.projects.map((p) => ({
          ...p,
          tags: Array.isArray(p.tags)
            ? p.tags.map((t) => (typeof t === "string" ? t : t?.label || ""))
            : [],
        }))
      : PORTFOLIO.projects,
    skills: raw.skills || PORTFOLIO.skills,
    coreStack: Array.isArray(raw.coreStack)
      ? raw.coreStack
      : PORTFOLIO.coreStack,
    sections: raw.sections || PORTFOLIO.sections,
  };
}

export function DataProvider({ children, serverData }) {
  const initialData = useMemo(() => normalize(serverData), [serverData]);
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  // Sync serverData updates
  useEffect(() => {
    if (serverData) {
      setData(normalize(serverData));
    }
  }, [serverData]);

  // Clean up legacy stale localStorage cache from user browsers once
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem("portfolio-cache-v1");
        window.localStorage.removeItem("portfolio-cache-v1-ts");
      } catch {
        /* Ignore */
      }
    }
  }, []);

  // Fetch real-time portfolio updates on mount
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/portfolio`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setData(normalize(json));
      }
    } catch {
      /* Fallback to serverData */
    } finally {
      setLoading(false);
    }
  }, []);

  // Update section from Admin Dashboard — instantly updates state & notifies listeners
  const updateSection = useCallback(async (section, payload) => {
    const { apiClient } = await import("../context/AuthContext");
    const r = await apiClient.put(`/admin/portfolio/${section}`, payload);
    
    const updatedSectionData = r.data[section];
    const fullUpdatedPortfolio = r.data.portfolio;

    setData((prev) => {
      if (fullUpdatedPortfolio) {
        return normalize(fullUpdatedPortfolio);
      }
      return normalize({ ...prev, [section]: updatedSectionData });
    });

    // Notify any open tabs / components of real-time update
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("portfolio-data-updated", { detail: { section } }));
    }
  }, []);

  // Listen for real-time portfolio updates across tabs/components
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleUpdate = () => refreshData();
    window.addEventListener("portfolio-data-updated", handleUpdate);
    return () => window.removeEventListener("portfolio-data-updated", handleUpdate);
  }, [refreshData]);

  return (
    <Ctx.Provider value={{ data, loading, updateSection, refreshData }}>
      {children}
    </Ctx.Provider>
  );
}

export const useData = () => useContext(Ctx);
