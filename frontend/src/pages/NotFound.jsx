/**
 * NotFound — 404 page
 * Shown for any path not matched by the router.
 * Uses hard-coded fallback styles (no dependency on CSS vars loading)
 * so it works even if the global stylesheet failed to load.
 */
import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function NotFound() {
  const nav      = useNavigate()
  const location = useLocation()
  const [dark, setDark] = useState(false)

  // Detect dark mode independently (ThemeContext may not be available)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setDark(document.documentElement.classList.contains('dark') || mq.matches)
    const listener = (e) => setDark(e.matches)
    mq.addEventListener('change', listener)
    return () => mq.removeEventListener('change', listener)
  }, [])

  const bg      = dark ? '#111111' : '#fffef7'
  const surface = dark ? '#1e1e1e' : '#ffffff'
  const ink     = dark ? '#f0f0f0' : '#000000'
  const muted   = dark ? '#b0b0b0' : '#555555'
  const shadow  = dark ? '6px 6px 0 rgba(255,255,255,0.25)' : '6px 6px 0 #000'
  const path    = location.pathname

  return (
    <div style={{
      minHeight: '100vh',
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(24px,5vw,60px)',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{ textAlign: 'center', maxWidth: 520, width: '100%' }}>

        {/* Logo */}
        <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: '-0.05em', color: ink, marginBottom: 40 }}>
          Lokesh
          <mark style={{ background: '#ffde2d', padding: '0 6px 2px', border: `2px solid ${ink}`, borderRadius: 5, marginLeft: 3, color: '#000' }}>
            Sain
          </mark>
        </div>

        {/* Card */}
        <div style={{
          border: `2px solid ${ink}`,
          borderRadius: 16,
          padding: 'clamp(32px,5vw,52px)',
          background: surface,
          boxShadow: shadow,
        }}>
          {/* 404 number */}
          <div style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 'clamp(64px,14vw,96px)',
            fontWeight: 900,
            letterSpacing: '-0.05em',
            lineHeight: 1,
            color: ink,
            marginBottom: 8,
          }}>
            404
          </div>

          {/* Yellow underline accent */}
          <div style={{
            width: 64,
            height: 5,
            background: '#ffde2d',
            border: `2px solid ${ink}`,
            borderRadius: 3,
            margin: '0 auto 28px',
          }} />

          <h1 style={{
            fontSize: 'clamp(18px,3vw,24px)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            color: ink,
            marginBottom: 12,
          }}>
            Page not found
          </h1>

          <p style={{ fontSize: 14, lineHeight: 1.75, color: muted, marginBottom: 8 }}>
            The path{' '}
            <code style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              background: dark ? '#2a2a2a' : '#f5f0e8',
              border: `1px solid ${ink}`,
              borderRadius: 5,
              padding: '1px 7px',
              color: ink,
              wordBreak: 'break-all',
            }}>
              {path}
            </code>{' '}
            doesn't exist.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: muted, marginBottom: 32 }}>
            You may have followed a broken link or typed the address incorrectly.
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => nav('/')}
              style={{
                background: '#ffde2d',
                color: '#000',
                border: `2px solid ${ink}`,
                borderRadius: 12,
                padding: '11px 24px',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: dark ? '4px 4px 0 rgba(255,255,255,0.25)' : '4px 4px 0 #000',
                fontFamily: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'transform .15s, box-shadow .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = dark ? '6px 6px 0 rgba(255,255,255,0.25)' : '6px 6px 0 #000' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = dark ? '4px 4px 0 rgba(255,255,255,0.25)' : '4px 4px 0 #000' }}
            >
              ← Go Home
            </button>

            <button
              onClick={() => nav(-1)}
              style={{
                background: 'transparent',
                color: ink,
                border: `2px solid ${ink}`,
                borderRadius: 12,
                padding: '11px 24px',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: dark ? '4px 4px 0 rgba(255,255,255,0.25)' : '4px 4px 0 #000',
                fontFamily: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'transform .15s, box-shadow .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = dark ? '6px 6px 0 rgba(255,255,255,0.25)' : '6px 6px 0 #000' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = dark ? '4px 4px 0 rgba(255,255,255,0.25)' : '4px 4px 0 #000' }}
            >
              ↩ Go Back
            </button>
          </div>
        </div>

        {/* Footer hint */}
        <p style={{ fontSize: 12, color: muted, marginTop: 28, fontFamily: "'JetBrains Mono', monospace" }}>
          Lost? Try{' '}
          <span
            onClick={() => nav('/')}
            style={{ color: ink, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
          >
            lokeshsain
          </span>
        </p>
      </div>
    </div>
  )
}
