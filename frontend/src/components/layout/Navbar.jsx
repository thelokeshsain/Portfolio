/**
 * Navbar — Glassmorphic, scroll-reactive navigation
 *
 * Features:
 * - Backdrop blur with scroll-reactive opacity
 * - Active section tracking via IntersectionObserver
 * - Smooth scroll navigation
 * - Mobile menu with blur overlay
 * - Theme toggle, PWA install button preserved
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { Sun, Moon, Menu, X } from 'lucide-react'
import { InstallButton } from '../ui/InstallPWA'
import { useTheme } from '../../context/ThemeContext'
import { useData } from '../../context/DataContext'
import MagneticElement from '../ui/MagneticElement'

const NAV = [
  { label: 'About',    id: 'about'      },
  { label: 'Work',     id: 'experience' },
  { label: 'Projects', id: 'projects'   },
  { label: 'Skills',   id: 'skills'     },
  { label: 'Contact',  id: 'contact'    },
]

const scroll = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

export default function Navbar({ isInstallable, onInstall }) {
  const { dark, toggle } = useTheme()
  const { data } = useData()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeId, setActiveId] = useState('')
  const observerRef = useRef(null)

  // Scroll-reactive background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Active section tracking
  useEffect(() => {
    const sections = NAV.map(n => document.getElementById(n.id)).filter(Boolean)
    if (!sections.length) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    )

    sections.forEach(s => observerRef.current.observe(s))
    return () => observerRef.current?.disconnect()
  }, [])

  // Close mobile menu on resize
  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 769) setOpen(false) }
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const go = useCallback((id) => { scroll(id); setOpen(false) }, [])
  const h = data.hero || {}

  return (
    <>
      <nav className={`nav${scrolled ? ' scrolled' : ''}`} role="navigation" aria-label="Main navigation">
        {/* Logo */}
        <MagneticElement strength={0.15}>
          <div className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
            Lokesh<span className="logo-accent">Sain</span>
          </div>
        </MagneticElement>

        {/* Desktop links */}
        <div className="hide-mobile" style={{ display: 'flex', gap: 4 }}>
          {NAV.map(n => (
            <MagneticElement key={n.id} strength={0.2}>
              <button
                className={`nav-link${activeId === n.id ? ' active' : ''}`}
                onClick={() => scroll(n.id)}
              >
                {n.label}
              </button>
            </MagneticElement>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MagneticElement strength={0.25}>
            <button
              className="icon-btn"
              onClick={toggle}
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </MagneticElement>
          <InstallButton isInstallable={isInstallable} onInstall={onInstall} />
          <MagneticElement strength={0.2}>
            <a href={`mailto:${h.email}`} className="nav-cta hide-mobile">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,12 2,6"/>
              </svg>
              Hire Me
            </a>
          </MagneticElement>
          <button
            className="icon-btn hamburger"
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mob-menu${open ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="Navigation menu">
        {NAV.map(n => (
          <button key={n.id} onClick={() => go(n.id)}>{n.label}</button>
        ))}
        <a
          href={`mailto:${h.email}`}
          className="btn btn-primary"
          style={{ marginTop: 12, justifyContent: 'center', width: '100%', textAlign: 'center' }}
          onClick={() => setOpen(false)}
        >
          ✉️ Hire Me
        </a>
      </div>
    </>
  )
}
