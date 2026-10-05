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
import GoogleAd, { openConsentManager } from './ads/GoogleAd'

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
  return (
    <footer style={{
      padding: '24px 0',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      background: '#040609',
    }}>
      <div className="inner" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 15,
          color: '#F8FAFC',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          Lokesh Sain
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#38BDF8' }} />
        </div>

        <div style={{ fontSize: 13, color: '#94A3B8' }}>
          Built with React.js & Next.js
        </div>

        <div style={{ fontSize: 12.5, color: '#94A3B8', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span>© {new Date().getFullYear()} Lokesh Sain</span>
          <span>•</span>
          <Link
            href="/privacy-policy"
            style={{ color: '#94A3B8', textDecoration: 'none' }}
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
            }}
            aria-label="Manage Privacy and Cookie Choices"
          >
            Privacy Settings
          </button>
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

        {/* Non-intrusive AdSense Slot before Footer */}
        <GoogleAd slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CONTENT_BOTTOM} style={{ maxWidth: '1200px', padding: '0 20px' }} />
      </main>

      {/* 7. Footer */}
      <Footer />

      {/* PWA Install Banner */}
      <InstallBanner />
    </div>
  )
}
