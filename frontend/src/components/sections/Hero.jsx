import React, { useState } from 'react'
import { Mail, FileText, ChevronDown } from 'lucide-react'
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion'
import useTyping from '../../hooks/useTyping'
import { useData } from '../../context/DataContext'
import { useTheme } from '../../context/ThemeContext'

const WORDS = ['React Developer', 'MERN Engineer', 'Frontend Architect', 'Problem Solver']

const GHIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
)
const LIIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

export default function Hero() {
  const { data } = useData()
  const typed = useTyping(WORDS)
  const { scrollY } = useScroll()
  const shouldReduceMotion = useReducedMotion()

  const h     = data.hero  || {}
  const stats = Array.isArray(data.stats) ? data.stats : []
  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  // Parallax Scroll calculations (GPU accelerated spring values)
  const yOrb1 = useSpring(useTransform(scrollY, [0, 1000], [0, -120]), { stiffness: 80, damping: 25 })
  const yOrb2 = useSpring(useTransform(scrollY, [0, 1000], [0, 80]), { stiffness: 80, damping: 25 })
  const yOrb3 = useSpring(useTransform(scrollY, [0, 1000], [0, -40]), { stiffness: 80, damping: 25 })

  const statColors = [
    { bg: 'rgba(99, 102, 241, 0.08)', border: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' },
    { bg: 'rgba(236, 72, 153, 0.08)', border: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' },
    { bg: 'rgba(34, 197, 94, 0.08)', border: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' },
    { bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' },
  ]

  // Container variants for staggered entrance animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 15,
      },
    },
  }

  return (
    <section id="home" style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      paddingTop: 'calc(64px + clamp(40px, 6vw, 60px))',
      paddingBottom: 'clamp(40px, 6vw, 80px)',
    }}>
      {/* Background Workstation Image with Premium Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}>
        <img
          src="/images/developer_workspace.webp"
          alt=""
          aria-hidden="true"
          className="hero-bg-img"
        />
        <div className="hero-bg-overlay" />
      </div>

      {/* Background layers */}
      <div className="mesh-bg" />
      <div className="grid-pattern" />

      {/* Floating orbs — Framer Motion Parallax */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
        <motion.div className="orb orb-accent" style={{ width: 400, height: 400, top: '10%', left: '-5%', y: shouldReduceMotion ? 0 : yOrb1 }} />
        <motion.div className="orb orb-purple" style={{ width: 300, height: 300, top: '60%', right: '-10%', y: shouldReduceMotion ? 0 : yOrb2 }} />
        <motion.div className="orb orb-blue" style={{ width: 200, height: 200, bottom: '10%', left: '30%', y: shouldReduceMotion ? 0 : yOrb3 }} />
      </div>

      {/* Content */}
      <div className="inner" style={{ width: '100%', position: 'relative', zIndex: 2 }}>
        <div className="hero-layout">

          {/* Left: text content */}
          <motion.div
            className="hero-text"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {h.available && (
              <motion.div className="status-badge" style={{ marginBottom: 32 }} variants={itemVariants}>
                <span className="pulse" />
                Open to opportunities
              </motion.div>
            )}

            <motion.h1 className="display-heading" style={{ marginBottom: 20 }} variants={itemVariants}>
              Hi, I'm<br />
              <span className="gradient-text">{h.name || 'Lokesh Sain'}</span>
            </motion.h1>

            <motion.p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(14px, 2vw, 18px)',
              fontWeight: 500,
              color: 'var(--text-muted)',
              marginBottom: 16,
              minHeight: '1.8em',
            }} variants={itemVariants}>
              &gt; <span style={{ color: 'var(--text-primary)' }}>{typed}</span>
              <span className="caret" />
            </motion.p>

            <motion.p style={{
              fontSize: 'clamp(15px, 1.8vw, 17px)',
              lineHeight: 1.8,
              color: 'var(--text-secondary)',
              maxWidth: 540,
              marginBottom: 40,
            }} variants={itemVariants}>
              {h.description}
            </motion.p>

            <motion.div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }} variants={itemVariants}>
              <button className="btn btn-primary btn-lg" onClick={() => scrollTo('projects')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="2" y="3" width="20" height="14" rx="2"/>
                  <path d="M8 21h8m-4-4v4"/>
                </svg>
                View Projects
              </button>
              <a href={`mailto:${h.email}`} className="btn btn-secondary btn-lg">
                <Mail size={16} /> Say Hello
              </a>
              {h.resumeUrl && (
                <a href={h.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-lg">
                  <FileText size={16} /> Resume
                </a>
              )}
            </motion.div>

            <motion.div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }} variants={itemVariants}>
              {h.github && (
                <a href={h.github} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                  <GHIcon /> GitHub
                </a>
              )}
              {h.linkedin && (
                <a href={h.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                  <LIIcon /> LinkedIn
                </a>
              )}
              {h.location && (
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  📍 {h.location}
                </span>
              )}
            </motion.div>
          </motion.div>

          {/* Right: profile card + stats (desktop) */}
          <motion.div
            className="hero-right"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 50, damping: 15, delay: 0.3 }}
          >
            <ProfileCard h={h} stats={stats} statColors={statColors} />
          </motion.div>
        </div>

        {/* Mobile stats */}
        <div className="hero-mobile-stats">
          <MobileStatsBar h={h} stats={stats} statColors={statColors} />
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          opacity: 0.4,
          animation: 'float 3s ease-in-out infinite',
        }}>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Scroll</span>
          <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>

      <style>{`
        .hero-layout {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: clamp(40px, 6vw, 80px);
          align-items: center;
        }
        .hero-right { display: flex; flex-direction: column; gap: 16px; }
        .hero-mobile-stats { display: none; }

        @media (max-width: 900px) {
          .hero-layout { grid-template-columns: 1fr; }
          .hero-right { display: none; }
          .hero-mobile-stats { display: block; margin-top: 48px; }
        }

        @keyframes float {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
      `}</style>
    </section>
  )
}

/* ── Profile card for desktop ── */
function ProfileCard({ h, stats, statColors }) {
  const { dark } = useTheme()
  const { scrollY } = useScroll()
  const shouldReduceMotion = useReducedMotion()

  // Transform scroll position to vertical translate (Mockup element moves differently for depth)
  const yVal = useTransform(scrollY, [0, 800], [0, -80])
  const y = useSpring(yVal, { stiffness: 80, damping: 25 })

  return (
    <div style={{ position: 'relative' }}>
      {/* Floating software engineer mock image */}
      <motion.div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-25%',
          width: '75%',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          boxShadow: dark ? 'var(--shadow-xl)' : 'var(--shadow-md)', // Soften shadow in light mode
          zIndex: -1,
          opacity: dark ? 0.65 : 0.35, // Increased from 0.15 to 0.35 in light mode for proper watermark visibility
          pointerEvents: 'none',
          background: 'var(--bg-secondary)',
          y: shouldReduceMotion ? 0 : y,
        }}
      >
        <img
          src="/images/editor_mockup.webp"
          alt="Code Editor Mockup"
          style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
        />
      </motion.div>

      {/* Terminal-style profile card */}
      <div className="terminal" style={{ transition: 'all 0.4s var(--ease-out-quart)', marginBottom: 12 }}>
        <div className="terminal-bar">
          <div className="terminal-dot" style={{ background: '#ff5f57' }} />
          <div className="terminal-dot" style={{ background: '#febc2e' }} />
          <div className="terminal-dot" style={{ background: '#28c840' }} />
          <span className="terminal-title">profile.json</span>
        </div>
        <div style={{ padding: 'clamp(20px, 3vw, 28px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <AvatarImage h={h} size="clamp(80px, 10vw, 100px)" fontSize="clamp(26px, 4vw, 34px)" />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 'clamp(16px, 2vw, 18px)', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>{h.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>{h.role || h.title}</div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="tag tag-y">React.js</span>
            <span className="tag tag-g">Node.js</span>
            <span className="tag tag-bl">MongoDB</span>
          </div>
        </div>
      </div>

      {/* Stats 2x2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        {stats.map((s, i) => {
          const c = statColors[i % statColors.length]
          return (
            <div key={`stat-${i}`} className="glass-card" style={{
              padding: '18px 14px',
              textAlign: 'center',
              background: c.bg,
              borderColor: c.border,
            }}>
              <div style={{ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 800, letterSpacing: '-0.04em', fontFamily: 'var(--font-display)', color: c.color }}>{s.num}</div>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', marginTop: 4, color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          )
        })}
      </div>

      {/* Current work indicator */}
      <div className="glass-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="pulse" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          @ <strong style={{ color: 'var(--text-primary)' }}>3Handshake Techsoft</strong>
        </span>
      </div>
    </div>
  )
}

/* ── Mobile stats bar ── */
function MobileStatsBar({ h, stats, statColors }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Avatar + name on mobile */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <AvatarImage h={h} size="52px" fontSize="18px" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{h.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{h.role}</div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 11, color: '#4ade80', fontWeight: 600,
          background: 'rgba(34, 197, 94, 0.1)',
          padding: '6px 12px', borderRadius: 'var(--radius-full)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          flexShrink: 0,
          fontFamily: 'var(--font-mono)',
        }}>
          <span className="pulse" style={{ width: 6, height: 6 }} />
          3Handshake
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {stats.map((s, i) => {
          const c = statColors[i % statColors.length]
          return (
            <div key={`mstat-${i}`} className="glass-card" style={{
              padding: '16px 12px',
              textAlign: 'center',
              background: c.bg,
              borderColor: c.border,
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em', fontFamily: 'var(--font-display)', color: c.color }}>{s.num}</div>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', marginTop: 3, color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Avatar with image fallback ── */
function AvatarImage({ h, size, fontSize }) {
  const [imgError, setImgError] = useState(false)
  const showInitials = !h.image || imgError

  return (
    <div className="av" style={{ width: size, height: size, fontSize }}>
      {!showInitials ? (
        <img
          src={h.image}
          alt={h.name}
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span style={{ fontWeight: 800, color: 'var(--accent-light)', fontSize }}>{(h.name || 'LS').split(' ').map(w => w[0]).join('')}</span>
      )}
    </div>
  )
}

