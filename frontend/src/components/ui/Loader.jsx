/**
 * Loader — Full-page loading screen
 *
 * Fix: The old ldbar animation used margin-left which was clipped by
 * overflow:hidden on the parent, making the bar appear empty after it
 * swept past 50%. Replaced with a translateX-based shimmer that stays
 * within bounds at all times. Uses self-contained inline styles so it
 * renders correctly before the stylesheet is fully parsed.
 */
import { useEffect, useState } from 'react'

export default function Loader({ message = 'Loading…' }) {
  // Detect theme independently — ThemeContext may not be ready yet
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark') ||
    document.body.classList.contains('dark') ||
    window.matchMedia?.('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    const obs = new MutationObserver(() => {
      setDark(document.body.classList.contains('dark'))
    })
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  const bg = dark ? '#111111' : '#fffef7'
  const ink = dark ? '#f0f0f0' : '#000000'
  const track = dark ? '#2a2a2a' : '#e8e3d8'

  return (
    <div
      role="status"
      aria-label={message}
      style={{
        position: 'fixed',
        inset: 0,
        background: bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        gap: 24,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Logo */}
      <div style={{ fontWeight: 900, fontSize: 32, letterSpacing: '-0.05em', color: ink }}>
        Lokesh
        <span style={{
          background: '#ffde2d',
          padding: '0 6px 2px',
          border: `2px solid ${ink}`,
          borderRadius: 5,
          marginLeft: 2,
          color: '#000',
        }}>
          Sain
        </span>
      </div>

      {/* Progress bar track */}
      <div style={{
        width: 200,
        height: 6,
        background: track,
        borderRadius: 3,
        border: `2px solid ${ink}`,
        overflow: 'hidden',   /* clip the shimmer */
        position: 'relative',
      }}>
        {/*
         * The shimmer div is WIDER than the track (60% of track = 120px).
         * It slides from -60% to +160% using translateX only — it never
         * changes its own width, so overflow:hidden always has something
         * to clip against and the yellow bar is always visible mid-sweep.
         */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '55%',
          background: '#ffde2d',
          borderRadius: 2,
          animation: 'ld-sweep 1.4s ease-in-out infinite',
        }} />
      </div>

      {/* Accessible label */}
      <span style={{
        fontSize: 13,
        color: dark ? '#888' : '#666',
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: '0.05em',
      }}>
        {message}
      </span>

      {/* Inline keyframes — no external stylesheet dependency */}
      <style>{`
        @keyframes ld-sweep {
          0%   { transform: translateX(-110%); }
          100% { transform: translateX(290%);  }
        }
      `}</style>
    </div>
  )
}