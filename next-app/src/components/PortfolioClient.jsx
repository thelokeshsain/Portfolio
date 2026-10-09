"use client";

/**
 * PortfolioClient.jsx — Main client layout matching reference design
 *
 * Sequence:
 * 1. Navbar
 * 2. Hero
 * 3. TechStrip (Tech I Work With)
 * 4. 02 / Featured Projects
 * 5. 03 / Experience & 04 / Skills (side by side in 2-column grid)
 * 6. 05 / About & Approach
 * 7. 06 / Contact Banner
 * 8. Footer
 */
import { Toaster } from 'react-hot-toast'
import Link from 'next/link'
import Navbar from '../components/layout/Navbar'
import ScrollProgress from '../components/ui/ScrollProgress'
import Hero from '../components/sections/Hero'
import Loader from '../components/ui/Loader'
import { InstallBanner } from '../components/ui/InstallPWA'
import About from '../components/sections/About'
import Experience from '../components/sections/Experience'
import Projects from '../components/sections/Projects'
import Skills from '../components/sections/Skills'
import Contact from '../components/sections/Contact'
import usePWA from '../hooks/usePWA'
import { useData } from '../context/DataContext'
import { openConsentManager } from './ads/consent'

import { BrandIcon } from '../config/brandAssets'

/* ── Tech Strip Logos matching reference & Brand Registry ── */
const TECH_STRIP_NAMES = [
  'React.js',
  'JavaScript',
  'Node.js',
  'Python',
  'MySQL',
  'MongoDB',
  'OpenAI',
  'Gemini',
]

function TechStrip() {
  return (
    <div style={{
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '20px 0',
      background: 'rgba(5, 7, 10, 0.6)',
    }}>
      <div className="inner" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 24,
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#94A3B8',
          whiteSpace: 'nowrap',
        }}>
          TECH I WORK WITH
        </span>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(20px, 3.2vw, 36px)',
          flexWrap: 'wrap',
        }}>
          {TECH_STRIP_NAMES.map(name => (
            <div
              key={name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13.5,
                fontWeight: 500,
                color: '#CBD5E1',
                whiteSpace: 'nowrap',
              }}
            >
              <BrandIcon name={name} size={19} />
              <span>{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Footer() {
  const { data } = useData()
  const h = data?.hero || {}

  const socialLinks = [
    {
      name: 'GitHub',
      label: 'GitHub profile',
      url: 'https://github.com/thelokeshsain',
      icon: 'GitHub',
    },
    {
      name: 'LinkedIn',
      label: 'LinkedIn profile',
      url: 'https://www.linkedin.com/in/thelokeshsain/',
      icon: 'LinkedIn',
    },
    {
      name: 'X',
      label: 'X profile',
      url: 'https://x.com/thelokeshsain',
      icon: 'X',
    },
    {
      name: 'Instagram',
      label: 'Instagram profile',
      url: 'https://www.instagram.com/thelokeshsain/',
      icon: 'Instagram',
    },
  ]

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Featured Projects', href: '#projects' },
    { label: 'Experience', href: '#experience' },
    { label: 'Skills & Tech', href: '#skills' },
    { label: 'Contact', href: '#contact' },
    { label: 'Perspectives (Blog)', href: '/blog', isRoute: true },
  ]

  return (
    <footer style={{
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      background: '#040609',
      paddingTop: 'clamp(40px, 6vw, 64px)',
      paddingBottom: 'clamp(32px, 5vw, 48px)',
      position: 'relative',
    }}>
      <div className="inner">
        {/* Main Footer Content Columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: 'clamp(28px, 4vw, 48px)',
          paddingBottom: 'clamp(32px, 5vw, 48px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
          {/* Column 1: Brand & Bio */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <a
              href="#home"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 18,
                color: '#F8FAFC',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                textDecoration: 'none',
                width: 'fit-content',
              }}
            >
              <span>Lokesh Sain</span>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#38BDF8' }} />
            </a>

            <p style={{
              fontSize: 13.5,
              lineHeight: 1.6,
              color: '#94A3B8',
              margin: 0,
              maxWidth: 320,
            }}>
              Software engineer crafting responsive web applications, high-performance systems, and intelligent product interfaces.
            </p>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              fontSize: 12.5,
              color: '#64748B',
            }}>
              <span>Jaipur, Rajasthan, India</span>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#CBD5E1',
            }}>
              Navigation
            </span>

            <nav aria-label="Footer Navigation" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {navLinks.map((item) => (
                item.isRoute ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    style={{
                      color: '#94A3B8',
                      fontSize: 13.5,
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                      width: 'fit-content',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#38BDF8' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8' }}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    style={{
                      color: '#94A3B8',
                      fontSize: 13.5,
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                      width: 'fit-content',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8' }}
                  >
                    {item.label}
                  </a>
                )
              ))}
            </nav>
          </div>

          {/* Column 3: Connect & Official Social Profiles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#CBD5E1',
            }}>
              Connect
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {socialLinks.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    color: '#94A3B8',
                    fontSize: 13.5,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    width: 'fit-content',
                    padding: '4px 0',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#FFFFFF'
                    e.currentTarget.style.transform = 'translateX(2px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = '#94A3B8'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }}
                >
                  <BrandIcon name={s.icon} size={16} />
                  <span>{s.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Sub-Footer Bar */}
        <div style={{
          paddingTop: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          fontSize: 12.5,
          color: '#94A3B8',
        }}>
          <div>
            © {new Date().getFullYear()} Lokesh Sain. Built with React.js & Next.js.
          </div>

          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/privacy-policy"
              style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8' }}
            >
              Privacy Policy
            </Link>
            <span>•</span>
            <button
              type="button"
              onClick={openConsentManager}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: '#94A3B8',
                fontSize: '12.5px',
                cursor: 'pointer',
                textDecoration: 'none',
                fontFamily: 'inherit',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8' }}
              aria-label="Manage Privacy and Cookie Choices"
            >
              Privacy Settings
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function Portfolio() {
  const { data, loading } = useData()
  const { isInstallable, triggerInstall } = usePWA()
  const s = data.sections || {}

  if (loading) return <Loader />

  const toastStyle = {
    background: '#0B0F17',
    color: '#F8FAFC',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
    fontSize: 14,
  }

  return (
    <div style={{ background: '#05070A', minHeight: '100vh', color: '#F8FAFC' }}>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: toastStyle }} />
      <ScrollProgress />
      <Navbar isInstallable={isInstallable} onInstall={triggerInstall} />

      <main id="main-content" style={{ paddingTop: 64 }}>
        {/* 1. Hero (#home) */}
        {s.hero !== false && <Hero />}

        {/* Tech Strip below hero */}
        {s.hero !== false && <TechStrip />}

        {/* 2. About (#about) */}
        {s.about !== false && <About />}

        {/* 3. Featured Projects (#projects) */}
        {s.projects !== false && <Projects />}

        {/* 4. Experience (#experience) */}
        {s.experience !== false && <Experience />}

        {/* 5. Skills (#skills) */}
        {s.skills !== false && <Skills />}

        {/* 6. Contact (#contact) */}
        {s.contact !== false && <Contact />}
      </main>

      {/* 7. Footer */}
      <Footer />

      {/* PWA Install Banner */}
      <InstallBanner />
    </div>
  )
}
