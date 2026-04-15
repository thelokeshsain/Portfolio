import { useState, useEffect } from 'react'
import { Sun, Moon, Menu, X } from 'lucide-react'
import { InstallButton } from '../ui/InstallPWA'
import { useTheme } from '../../context/ThemeContext'
import { useData } from '../../context/DataContext'

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

  // close mobile menu on resize
  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 769) setOpen(false) }
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  const go = id => { scroll(id); setOpen(false) }
  const h = data.hero || {}

  return (
    <>
      <nav className="nav">
        {/* Logo */}
        <div className="nav-logo">
          Lokesh<mark>Sain</mark>
        </div>

        {/* Desktop links */}
        <div className="hide-mobile" style={{ display: 'flex', gap: 2 }}>
          {NAV.map(n => (
            <button key={n.id} className="nav-link" onClick={() => scroll(n.id)}>{n.label}</button>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="icon-btn" onClick={toggle} title="Toggle theme" style={{ fontSize: 16 }}>
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <InstallButton isInstallable={isInstallable} onInstall={onInstall} />
          <a href={`mailto:${h.email}`} className="nav-cta hide-mobile">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,12 2,6"/>
            </svg>
            Hire Me
          </a>
          <button
            className="icon-btn hamburger"
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mob-menu${open ? ' open' : ''}`}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => go(n.id)}>{n.label}</button>
        ))}
        <a
          href={`mailto:${h.email}`}
          className="btn btn-yellow"
          style={{ marginTop: 8, justifyContent: 'center' }}
          onClick={() => setOpen(false)}
        >
          ✉ Hire Me
        </a>
      </div>
    </>
  )
}
