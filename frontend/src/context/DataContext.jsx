/**
 * DataContext — Production-hardened
 * Fix M-01: updateSection uses scoped apiClient, not raw axios
 * Fix QA-01 separation: public data uses publicClient (no auth header)
 */
import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { apiClient } from './AuthContext'
import { PORTFOLIO } from '../lib/data'

const Ctx = createContext()
const API = import.meta.env.VITE_API_URL || '/api'

// Public client — no auth header, separate from admin apiClient
const publicClient = axios.create({ baseURL: API })

function normalize(raw) {
  if (!raw) return PORTFOLIO
  return {
    hero:         raw.hero         || PORTFOLIO.hero,
    stats:        Array.isArray(raw.stats)         ? raw.stats         : PORTFOLIO.stats,
    about:        Array.isArray(raw.about)         ? raw.about         : PORTFOLIO.about,
    education:    Array.isArray(raw.education)     ? raw.education     : PORTFOLIO.education,
    achievements: Array.isArray(raw.achievements)  ? raw.achievements  : PORTFOLIO.achievements,
    experience:   Array.isArray(raw.experience)    ? raw.experience    : PORTFOLIO.experience,
    projects:     Array.isArray(raw.projects)
      ? raw.projects.map(p => ({
          ...p,
          tags: Array.isArray(p.tags)
            ? p.tags.map(t => (typeof t === 'string' ? t : t?.label || ''))
            : [],
        }))
      : PORTFOLIO.projects,
    skills:    raw.skills    || PORTFOLIO.skills,
    coreStack: Array.isArray(raw.coreStack) ? raw.coreStack : PORTFOLIO.coreStack,
    sections:  raw.sections  || PORTFOLIO.sections,
  }
}

export function DataProvider({ children }) {
  const [data, setData]       = useState(PORTFOLIO)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    publicClient.get('/portfolio')
      .then(r => setData(normalize(r.data)))
      .catch(() => { /* API unavailable — static fallback used */ })
      .finally(() => setLoading(false))
  }, [])

  // Fix M-01: use scoped apiClient (has auth token) — not raw axios
  const updateSection = async (section, payload) => {
    const r = await apiClient.put(`/admin/portfolio/${section}`, payload)
    setData(prev => normalize({ ...prev, [section]: r.data[section] }))
  }

  return (
    <Ctx.Provider value={{ data, loading, updateSection, publicClient }}>
      {children}
    </Ctx.Provider>
  )
}

export const useData = () => useContext(Ctx)
export { publicClient }
