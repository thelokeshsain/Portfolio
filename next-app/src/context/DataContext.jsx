"use client";

/**
 * DataContext — Performance-optimized
 * - Uses native fetch instead of axios for public requests
 * - updateSection lazily imports apiClient only when called (admin only)
 */
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { PORTFOLIO } from "../lib/data";

const Ctx = createContext();
const API = process.env.NEXT_PUBLIC_API_URL || "/api";
const CACHE_KEY = "portfolio-cache-v1";
const CACHE_TS_KEY = "portfolio-cache-v1-ts";
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

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

function readCachedPortfolio() {
  if (typeof window === "undefined") return null;
  try {
    const cached = window.localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const cachedAt = Number(window.localStorage.getItem(CACHE_TS_KEY) || 0);
    if (cachedAt && Date.now() - cachedAt > CACHE_MAX_AGE_MS) {
      window.localStorage.removeItem(CACHE_KEY);
      window.localStorage.removeItem(CACHE_TS_KEY);
      return null;
    }

    return normalize(JSON.parse(cached));
  } catch {
    window.localStorage.removeItem(CACHE_KEY);
    window.localStorage.removeItem(CACHE_TS_KEY);
    return null;
  }
}

function writeCachedPortfolio(data) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    window.localStorage.setItem(CACHE_TS_KEY, String(Date.now()));
  } catch {
    // Storage can fail in private mode or when quota exceeded
  }
}

export function DataProvider({ children, serverData }) {
  const initialData = useMemo(() => {
    if (serverData) return normalize(serverData);
    return readCachedPortfolio() || PORTFOLIO;
  }, [serverData]);
  
  const [data, setData] = useState(initialData);
  const [loading] = useState(false);

  useEffect(() => {
    if (serverData) return; // Server data available — skip client fetch

    const controller = new AbortController();

    fetch(`${API}/portfolio`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        const normalized = normalize(json);
        setData(normalized);
        writeCachedPortfolio(normalized);
      })
      .catch(() => {
        /* API unavailable — static fallback used */
      });

    return () => controller.abort();
  }, [serverData]);

  // Lazy-load apiClient only when admin calls updateSection
  const updateSection = useCallback(async (section, payload) => {
    const { apiClient } = await import("../context/AuthContext");
    const r = await apiClient.put(`/admin/portfolio/${section}`, payload);
    setData((prev) => {
      const next = normalize({ ...prev, [section]: r.data[section] });
      writeCachedPortfolio(next);
      return next;
    });
  }, []);

  return (
    <Ctx.Provider value={{ data, loading, updateSection }}>
      {children}
    </Ctx.Provider>
  );
}

export const useData = () => useContext(Ctx);
