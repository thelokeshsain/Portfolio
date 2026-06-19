"use client";

/**
 * Portfolio.jsx — Main page shell (redesigned)
 *
 * All existing hooks and data flow preserved:
 * - useData() for section visibility
 * - useTheme() for toast styling
 * - usePWA() for install prompts
 * - Toaster with custom styling
 * - Section conditional rendering via data.sections
 * - InstallBanner
 */
import { Toaster } from 'react-hot-toast'
import Image from 'next/image'
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
import { useTheme } from '../context/ThemeContext'

import useParallax from '../hooks/useParallax'

function ParallaxBanner({ image, quote, author, height = 'clamp(200px, 30vh, 280px)' }) {
  const imgRef = useParallax(-0.12)

  return (
    <div className="parallax-banner" style={{
      position: 'relative',
      height: height,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-primary)',
    }}>
      {/* Background image layer */}
      <Image
        ref={imgRef}
        src={image}
        alt="Parallax background element"
        className="parallax-banner-img"
        fill
        sizes="100vw"
        style={{ objectFit: 'cover' }}
      />
      {/* Overlay: blending to dark background in dark mode, or solid light background watermark in light mode */}
      <div className="parallax-banner-overlay" />
      {/* Content */}
      <div className="inner" style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 20px' }}>
        <p className="parallax-banner-quote">
          "{quote}"
        </p>
        {author && (
          <p className="parallax-banner-author">
            — {author}
          </p>
        )}
      </div>
    </div>
  )
}

export default function Portfolio() {
  const { data, loading } = useData()
  const { dark } = useTheme()
  const { isInstallable, triggerInstall } = usePWA()
  const s = data.sections || {}

  if (loading) return <Loader />

  const toastStyle = {
    background: dark ? 'var(--bg-secondary)' : '#ffffff',
    color: dark ? 'var(--text-primary)' : '#09090b',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    boxShadow: 'var(--shadow-lg)',
    fontSize: 14,
  }

  return (
    <div>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: toastStyle }} />
      <ScrollProgress />
      <Navbar isInstallable={isInstallable} onInstall={triggerInstall} />

      <main id="main-content" style={{ paddingTop: 64 }}>
        {s.hero       !== false && <Hero />}
        {s.about      !== false && <About />}
        {s.about      !== false && s.experience !== false && (
          <ParallaxBanner
            image="/images/editor_mockup.webp"
            quote="First, solve the problem. Then, write the code."
            author="John Johnson"
          />
        )}
        {s.experience !== false && <Experience />}
        {s.projects   !== false && <Projects />}
        {s.skills     !== false && <Skills />}
        {s.skills     !== false && s.contact !== false && (
          <ParallaxBanner
            image="/images/cloud_network_mesh.webp"
            quote="Simplicity is the soul of efficiency."
            author="Austin Freeman"
          />
        )}
        {s.contact    !== false && <Contact />}
      </main>

      {/* PWA install banner */}
      <InstallBanner isInstallable={isInstallable} onInstall={triggerInstall} />

      {/* Footer */}
      <footer style={{
        padding: 'clamp(24px, 3vw, 32px) clamp(20px, 5vw, 60px)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        background: 'var(--bg-secondary)',
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'clamp(16px, 2vw, 18px)',
          letterSpacing: '-0.03em',
          color: 'var(--text-primary)',
        }}>
          Lokesh<span className="gradient-text">Sain</span>
        </div>
        <div style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-mono)',
        }}>
          © {new Date().getFullYear()} · Built with Next.js
        </div>
        <div style={{
          fontSize: 12,
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-mono)',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}>
          <span>Software Engineer · Jaipur</span>
        </div>
      </footer>
    </div>
  )
}
