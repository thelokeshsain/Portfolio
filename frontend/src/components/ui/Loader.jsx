/**
 * Loader — Full-page terminal-styled compilation/boot animation loading screen.
 * Utilizes hardware-accelerated transforms for exit transitions and inline styles
 * to support immediate render before main stylesheets are processed.
 */
import { useEffect, useState } from 'react'

const BOOT_LOGS = [
  { text: "$ sh init_portfolio.sh", delay: 50, isCmd: true },
  { text: "> Loading environment variables... OK", delay: 200 },
  { text: "> Resolving database socket connection... OK", delay: 350 },
  { text: "> Bundling React & Framer Motion assets... OK", delay: 500 },
  { text: "> Compiling theme modules (Luminous Void v2.0)... OK", delay: 650 },
  { text: "> Injecting schema structured data... OK", delay: 800 },
  { text: "> Checking secure auth headers... OK", delay: 950 },
  { text: "> Fetching latest projects database records... OK", delay: 1100 },
  { text: "> Performance validation: LCP 98% / FCP 100ms... OK", delay: 1250 },
  { text: "> Booting portfolio application shell... READY", delay: 1350, isSuccess: true }
]

export default function Loader({ message = 'Initializing...' }) {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return true
    return document.documentElement.classList.contains('dark') ||
      document.body.classList.contains('dark') ||
      window.matchMedia?.('(prefers-color-scheme: dark)').matches
  })

  const [visibleLines, setVisibleLines] = useState([])
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    const obs = new MutationObserver(() => {
      setDark(document.body.classList.contains('dark') || document.documentElement.classList.contains('dark'))
    })
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    // Sequentially print boot logs
    const timers = BOOT_LOGS.map((log) => {
      return setTimeout(() => {
        setVisibleLines(prev => [...prev, log])
      }, log.delay)
    })

    // Trigger smooth fade out
    const finishTimer = setTimeout(() => {
      setIsFadingOut(true)
    }, 1600)

    return () => {
      obs.disconnect()
      timers.forEach(clearTimeout)
      clearTimeout(finishTimer)
    }
  }, [])

  const bg = dark ? '#09090b' : '#fafafa'
  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const termBg = dark ? '#0b0f17' : '#ffffff'
  const textPrimary = dark ? '#c9d1d9' : '#1f2937'
  const shadow = dark ? '0 20px 50px rgba(0,0,0,0.6)' : '0 10px 30px rgba(0,0,0,0.08)'

  return (
    <div
      role="status"
      aria-label="Booting portfolio"
      style={{
        position: 'fixed',
        inset: 0,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 20,
        fontFamily: "'JetBrains Mono', Consolas, monospace",
        transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(1.02) translateY(-10px)' : 'scale(1) translateY(0)',
        pointerEvents: isFadingOut ? 'none' : 'auto',
      }}
    >
      <div style={{
        width: '100%',
        maxWidth: 580,
        background: termBg,
        border: `1px solid ${border}`,
        borderRadius: 16,
        boxShadow: shadow,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Terminal Header */}
        <div style={{
          background: dark ? '#121824' : '#f3f4f6',
          borderBottom: `1px solid ${border}`,
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
          <span style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 11,
            color: dark ? '#8b949e' : '#57606a',
            marginRight: 36,
          }}>lokesh@compiling_loader: ~</span>
        </div>

        {/* Terminal Body */}
        <div style={{
          padding: '24px 28px',
          minHeight: 280,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          gap: 10,
          fontSize: 13,
          lineHeight: 1.6,
          color: textPrimary,
          textAlign: 'left',
        }}>
          {visibleLines.map((line, idx) => {
            let color = textPrimary
            if (line.isCmd) color = dark ? '#79c0ff' : '#2563eb'
            else if (line.isSuccess) color = '#16a34a'
            
            return (
              <div key={idx} style={{ color, wordBreak: 'break-all' }}>
                {line.text}
              </div>
            )
          })}
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{
              width: 8,
              height: 15,
              background: dark ? '#6366f1' : '#4f46e5',
              display: 'inline-block',
              animation: 'comp-blink 1s step-end infinite',
            }} />
          </div>
        </div>
      </div>

      <span style={{
        position: 'absolute',
        bottom: 24,
        fontSize: 11,
        color: dark ? '#52525b' : '#a1a1aa',
        fontFamily: "'Inter', sans-serif",
      }}>
        {message}
      </span>

      <style>{`
        @keyframes comp-blink {
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}