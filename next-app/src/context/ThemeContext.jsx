"use client";

import { createContext, useContext, useState, useEffect } from 'react'

const Ctx = createContext()

export function ThemeProvider({ children }) {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const s = localStorage.getItem('theme');
    setDark(s ? s === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.body.classList.toggle('dark', dark);
    document.body.classList.toggle('light', !dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark, mounted]);

  return <Ctx.Provider value={{ dark, toggle: () => setDark(d => !d), mounted }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx)
