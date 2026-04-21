/**
 * Hero.jsx
 * Fix #5: Profile image path — use img with onError fallback
 * Fix #8: Show stats on mobile (separate row below text, not hidden)
 */
import { Mail, FileText } from 'lucide-react'
import useTyping from '../../hooks/useTyping'
import useScrollFade from '../../hooks/useScrollFade'
import { useData } from '../../context/DataContext'

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
  const ref   = useScrollFade()
  const h     = data.hero  || {}
  const stats = Array.isArray(data.stats) ? data.stats : []
  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section id="home" className="section fade-up" ref={ref} style={{
      background: 'var(--cream)', minHeight: '100vh', display: 'flex',
      alignItems: 'center', paddingTop: 'calc(56px + clamp(40px,7vw,80px))',
    }}>
      <div className="inner" style={{ width: '100%' }}>

        {/* ── Desktop: 2-col. Mobile: 1-col (right col shown differently) ── */}
        <div className="hero-layout">

          {/* ── Left: text ── */}
          <div className="hero-text">
            {h.available && (
              <div className="status-badge" style={{ marginBottom: 28 }}>
                <span className="pulse" />
                Open to opportunities
              </div>
            )}

            <h1 className="h1" style={{ marginBottom: 16 }}>
              Hi, I'm<br />
              <span className="mark">{h.name || 'Lokesh Sain'}</span><br />
              <span style={{ color: 'var(--muted)', fontWeight: 800 }}>Engineer.</span>
            </h1>

            <p style={{ fontFamily: 'var(--mono)', fontSize: 'clamp(14px,2vw,18px)', fontWeight: 500, color: 'var(--muted)', marginBottom: 16, minHeight: '1.8em' }}>
              &gt; <span style={{ color: 'var(--ink)' }}>{typed}</span>
              <span className="caret" />
            </p>

            <p style={{ fontSize: 'clamp(14px,1.8vw,16.5px)', lineHeight: 1.85, color: 'var(--muted)', maxWidth: 520, marginBottom: 36 }}>
              {h.description}
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
              <button className="btn btn-solid" onClick={() => scrollTo('projects')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="2" y="3" width="20" height="14" rx="2"/>
                  <path d="M8 21h8m-4-4v4"/>
                </svg>
                View Projects
              </button>
              <a href={`mailto:${h.email}`} className="btn btn-outline">
                <Mail size={15} /> Say Hello
              </a>
              {h.resumeUrl && (
                <a href={h.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                  <FileText size={15} /> View Resume
                </a>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {h.github && (
                <a href={h.github} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                  <GHIcon /> GitHub
                </a>
              )}
              {h.linkedin && (
                <a href={h.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                  <LIIcon /> LinkedIn
                </a>
              )}
              {h.location && (
                <span style={{ fontSize: 13, color: 'var(--subtle)', fontFamily: 'var(--mono)' }}>
                  📍 {h.location}
                </span>
              )}
            </div>
          </div>

          {/* ── Right: profile card + stats (desktop only) ── */}
          <div className="hero-right">
            <ProfileCard h={h} stats={stats} />
          </div>
        </div>

        {/* ── Mobile stats row — shown ONLY on mobile below text ── */}
        {/* Issue #8: Stats visible on mobile */}
        <div className="hero-mobile-stats">
          <MobileStatsBar h={h} stats={stats} />
        </div>

      </div>

      <style>{`
        /* Desktop: side-by-side */
        .hero-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(32px,5vw,72px);
          align-items: center;
        }
        .hero-right { display: flex; flex-direction: column; gap: 16px; }
        .hero-mobile-stats { display: none; }

        /* Mobile: single column, right panel hidden, stats shown inline */
        @media (max-width: 820px) {
          .hero-layout { grid-template-columns: 1fr; }
          .hero-right { display: none; }
          .hero-mobile-stats { display: block; margin-top: 36px; }
        }
      `}</style>
    </section>
  )
}

/* ── Profile card for desktop ── */
function ProfileCard({ h, stats }) {
  return (
    <>
      <div className="mac">
        <div className="mac-bar">
          <div className="mac-dot" style={{ background: '#ff5f57' }} />
          <div className="mac-dot" style={{ background: '#febc2e' }} />
          <div className="mac-dot" style={{ background: '#28c840' }} />
          <span className="mac-bar-title">profile.json</span>
        </div>
        <div style={{ padding: 'clamp(20px,3vw,28px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          {/* Issue #5: Profile image with correct path and onError fallback */}
          <AvatarImage h={h} size="clamp(80px,12vw,110px)" fontSize="clamp(26px,5vw,38px)" />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 'clamp(15px,2vw,18px)', letterSpacing: '-0.03em', color: 'var(--ink)' }}>{h.name}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 2 }}>{h.role || h.title}</div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="tag tag-y">React.js</span>
            <span className="tag tag-g">Node.js</span>
            <span className="tag tag-cr">MongoDB</span>
          </div>
        </div>
      </div>

      {/* Stats 2x2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {stats.map((s, i) => (
          <div key={`stat-${i}`} className="stat" style={{ background: s.bg, color: s.color }}>
            <div style={{ fontSize: 'clamp(22px,3.5vw,28px)', fontWeight: 900, letterSpacing: '-0.04em' }}>{s.num}</div>
            <div style={{ fontSize: 10, fontFamily: 'var(--mono)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ border: 'var(--bw) solid var(--ink)', borderRadius: 'var(--r)', padding: '12px 18px', background: 'var(--surface)', boxShadow: 'var(--sh)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="pulse" style={{ background: 'var(--green)', flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
          @ <strong style={{ color: 'var(--ink)' }}>3Handshake Techsoft</strong>
        </span>
      </div>
    </>
  )
}

/* ── Mobile stats bar ── */
function MobileStatsBar({ h, stats }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Avatar + name on mobile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', border: '2px solid var(--ink)', borderRadius: 'var(--r)', background: 'var(--surface)', boxShadow: 'var(--sh)' }}>
        <AvatarImage h={h} size="56px" fontSize="20px" />
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--ink)' }}>{h.name}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{h.role}</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#000', fontWeight: 700, background: 'var(--green)', padding: '5px 12px', borderRadius: 99, border: '2px solid var(--ink)', boxShadow: 'var(--sh)', flexShrink: 0 }}>
          <span className="pulse" />
          3Handshake
        </div>
      </div>

      {/* Stats grid — 2x2 on mobile */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {stats.map((s, i) => (
          <div key={`mstat-${i}`} className="stat" style={{ background: s.bg, color: s.color }}>
            <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.04em' }}>{s.num}</div>
            <div style={{ fontSize: 10, fontFamily: 'var(--mono)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Avatar with image fallback — Issue #5 ── */
function AvatarImage({ h, size, fontSize }) {
  const [imgError, setImgError] = React.useState(false)
  
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
        <span style={{ fontWeight: 900, color: '#000', fontSize }}>LS</span>
      )}
    </div>
  )
}

// Need React for useState in AvatarImage
import React from 'react'
