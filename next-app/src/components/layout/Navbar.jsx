"use client";

/**
 * Navbar — Premium Apple-style navigation matching the Midnight Blueprint reference design
 *
 * Left: Monogram/Avatar + Name + blue dot (semantic <a href="#home">)
 * Center: Home, About, Projects, Experience, Skills, Contact (semantic <a href="#id">)
 * Right: White pill "Download Resume" button
 * Mobile: Fully accessible drawer with responsive hamburger toggle
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

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 769) setOpen(false) }
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Handle escape key to close mobile menu
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && open) setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  const handleNavClick = useCallback((e, id) => {
    e.preventDefault()
    scrollToSection(id)
    setOpen(false)
  }, [scrollToSection])

  const h = data.hero || {}

  return (
    <>
      <header className={`nav${scrolled ? ' scrolled' : ''}`} role="banner">
        <nav aria-label="Main navigation" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          {/* Logo */}
          <a
            href="#home"
            className="nav-logo"
            onClick={(e) => handleNavClick(e, 'home')}
            aria-label="Lokesh Sain"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          >
            <div
              aria-hidden="true"
              style={{
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
              }}
            >
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
          </a>

          {/* Desktop links */}
          <div className="nav-desktop-links" style={{
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
                <a
                  key={n.id}
                  href={`#${n.id}`}
                  onClick={(e) => handleNavClick(e, n.id)}
                  aria-current={isActive ? 'page' : undefined}
                  style={{
                    background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 500,
                    padding: '6px 14px',
                    borderRadius: 9999,
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                    display: 'inline-block',
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
                </a>
              )
            })}
          </div>

          {/* Right actions: White pill Download Resume + Mobile Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a
              href={h.resumeUrl || '/resume.pdf'}
              download="Lokesh_Sain_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download Resume"
              className="resume-btn"
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
              <span className="show-mobile-inline">Resume</span>
            </a>

            {/* PWA Install Button */}
            {isInstallable && (
              <InstallButton isInstallable={isInstallable} onInstall={onInstall} />
            )}

            {/* Mobile hamburger */}
            <button
              className="hamburger"
              type="button"
              onClick={() => setOpen(p => !p)}
              aria-label={open ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={open}
              aria-controls="mobile-nav-drawer"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 998,
          }}
        />
      )}

      {/* Mobile Navigation Drawer */}
      <div
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
        className={`mob-menu${open ? ' open' : ''}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
          {NAV_SECTIONS.map(n => {
            const isActive = activeSection === n.id
            return (
              <a
                key={n.id}
                href={`#${n.id}`}
                onClick={(e) => handleNavClick(e, n.id)}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  display: 'block',
                  padding: '12px 18px',
                  borderRadius: 12,
                  background: isActive ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                  color: isActive ? '#38BDF8' : '#CBD5E1',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 16,
                  textDecoration: 'none',
                  border: isActive ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid transparent',
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                {n.label}
              </a>
            )
          })}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid rgba(255, 255, 255, 0.08)', width: '100%' }}>
          <a
            href={h.resumeUrl || '/resume.pdf'}
            download="Lokesh_Sain_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download Resume"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: '#FFFFFF',
              color: '#090D16',
              fontSize: 14,
              fontWeight: 600,
              padding: '13px 20px',
              borderRadius: 9999,
              textDecoration: 'none',
              width: '100%',
              boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
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
