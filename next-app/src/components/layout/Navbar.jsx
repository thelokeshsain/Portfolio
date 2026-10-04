/**
 * Navbar — Premium Apple-style navigation matching the reference design
 *
 * Left: Monogram/Avatar + Name + blue dot
 * Center: Home, About, Projects, Experience, Skills, Contact
 * Right: White pill "Download Resume" button
 * Permanently dark (Midnight Blueprint) — No theme toggle
 */
import { useState, useEffect, useCallback } from 'react'
import { Menu, X, Download } from 'lucide-react'
import { InstallButton } from '../ui/InstallPWA'
import { useData } from '../../context/DataContext'
import { NAV_SECTIONS } from '../../config/navigation'
import { useActiveSection } from '../../hooks/useActiveSection'

export default function Navbar({ isInstallable, onInstall }) {
  const { data } = useData()
  const { activeSection, scrollToSection } = useActiveSection()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Scroll-reactive background blur
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
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

  const go = useCallback((id) => {
    scrollToSection(id)
    setOpen(false)
  }, [scrollToSection])

  const h = data.hero || {}

  return (
    <>
      <nav className={`nav${scrolled ? ' scrolled' : ''}`} role="navigation" aria-label="Main navigation">
        {/* Logo */}
        <div
          className="nav-logo"
          onClick={() => scrollToSection('home')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && scrollToSection('home')}
        >
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1E293B, #0F172A)',
            border: '1.5px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 12,
              fontWeight: 700,
              color: '#F8FAFC',
              letterSpacing: '0.05em'
            }}>
              LS
            </span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Lokesh Sain
          </span>
          <span style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: '#38BDF8',
            display: 'inline-block',
            marginLeft: -2
          }} />
        </div>

        {/* Desktop links */}
        <div className="hide-mobile" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 9999,
          padding: '4px 6px',
        }}>
          {NAV_SECTIONS.map(n => {
            const isActive = activeSection === n.id
            return (
              <button
                key={n.id}
                onClick={() => scrollToSection(n.id)}
                style={{
                  background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  border: 'none',
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  padding: '6px 14px',
                  borderRadius: 9999,
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.color = '#FFFFFF'
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)'
                }}
              >
                {n.label}
              </button>
            )
          })}
        </div>

        {/* Right actions: White pill Download Resume only */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <a
            href={h.resumeUrl || '/resume.pdf'}
            download="Lokesh_Sain_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              background: '#FFFFFF',
              color: '#090D16',
              fontSize: 13,
              fontWeight: 600,
              padding: '8px 18px',
              borderRadius: 9999,
              textDecoration: 'none',
              transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.background = '#F1F5F9'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.background = '#FFFFFF'
            }}
          >
            <Download size={14} strokeWidth={2.5} />
            <span className="hide-mobile">Download Resume</span>
            <span className="show-mobile-inline" style={{ display: 'none' }}>Resume</span>
          </a>

          {/* PWA Install Button */}
          {isInstallable && (
            <InstallButton isInstallable={isInstallable} onInstall={onInstall} />
          )}

          {/* Mobile hamburger */}
          <button
            className="hamburger"
            onClick={() => setOpen(p => !p)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`mob-menu${open ? ' open' : ''}`}>
        {NAV_SECTIONS.map(n => {
          const isActive = activeSection === n.id
          return (
            <button
              key={n.id}
              onClick={() => go(n.id)}
              style={{
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
              }}
            >
              {n.label}
            </button>
          )
        })}

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <a
            href={h.resumeUrl || '/resume.pdf'}
            download="Lokesh_Sain_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: '#FFFFFF',
              color: '#090D16',
              fontSize: 14,
              fontWeight: 600,
              padding: '12px 20px',
              borderRadius: 9999,
              textDecoration: 'none',
            }}
          >
            <Download size={16} />
            Download Resume
          </a>
        </div>
      </div>
    </>
  )
}
