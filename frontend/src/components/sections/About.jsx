import { useState } from 'react'
import useScrollFade from '../../hooks/useScrollFade'
import { useData } from '../../context/DataContext'
import CertificationsModal from '../ui/CertificationsModal'

const TERMINAL_FIELDS = [
  { key: 'name',         cls: 't-s' },
  { key: 'role',         val: '"Software Engineer"',       cls: 't-s' },
  { key: 'company',      val: '"3Handshake Techsoft"',     cls: 't-s' },
  { key: 'mca_cgpa',     val: '8.29',                     cls: 't-n' },
  { key: 'bca',          val: '"81.64%"',                  cls: 't-n' },
  { key: 'stack',        val: '["React","Node","MongoDB"]', cls: 't-s' },
  { key: 'location',     cls: 't-s' },
  { key: 'open_to_work', val: 'true',                     cls: 't-b' },
]

export default function About() {
  const { data } = useData()
  const ref = useScrollFade()

  const about        = Array.isArray(data.about)        ? data.about        : []
  const education    = Array.isArray(data.education)    ? data.education    : []
  const achievements = Array.isArray(data.achievements) ? data.achievements : []
  const certifications = [] // Keep variable for linting, but no longer used
  const [isCertsOpen, setIsCertsOpen] = useState(false)
  const h = data.hero || {}

  const fields = TERMINAL_FIELDS.map(f => ({
    ...f,
    displayVal: f.val
      || (f.key === 'name'     ? `"${h.name     || 'Lokesh Sain'}"` : undefined)
      || (f.key === 'location' ? `"${h.location || 'Jaipur, Rajasthan'}"` : '""'),
  }))
  const lastIdx = fields.length - 1

  return (
    <section id="about" className="section fade-up" ref={ref}>
      <div className="inner">
        <div className="label">About</div>
        <h2 className="h2" style={{ marginBottom: 48 }}>
          A developer who cares<br />about the <span className="mark">details.</span>
        </h2>

        {/*
          Issue #4: Use `align-items: start` so the right column (terminal)
          does NOT stretch to match the left column height.
          Each column is naturally sized by its content.
        */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: 'clamp(24px,4vw,48px)',
          alignItems: 'start',   /* ← KEY FIX: no stretching */
        }}>

          {/* ── Left column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {about.map((p, i) => (
              <p key={i} style={{ fontSize: 'clamp(14px,1.7vw,16px)', lineHeight: 1.85, color: 'var(--muted)' }}>{p}</p>
            ))}

            {/* Education */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              {education.map((e, i) => (
                <div key={i} style={{ border: '2px solid var(--ink)', borderRadius: 'var(--r)', padding: '14px 18px', background: e.bg || 'var(--yellow)', boxShadow: 'var(--sh)', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'var(--mono)', color: e.color || '#000', minWidth: 44, flexShrink: 0 }}>{e.abbr}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: e.color || '#000' }}>{e.name}</div>
                    <div style={{ fontSize: 12, color: e.color || '#000', fontFamily: 'var(--mono)', marginTop: 2, opacity: 0.75 }}>{e.period} · {e.grade}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Achievements */}
            {/* Unified Achievements & Certs Button */}
            {achievements.length > 0 && (
              <button
                className="btn btn-outline"
                style={{ alignSelf: "flex-start", marginTop: 8 }}
                onClick={() => setIsCertsOpen(true)}
              >
                🏆 View Achievements & Certifications
              </button>
            )}
          </div>

          {/* ── Right: terminal (content-height only, no stretch) ── */}
          <div className="mac" style={{ alignSelf: 'start' }}>
            <div className="mac-bar">
              <div className="mac-dot" style={{ background: '#ff5f57' }} />
              <div className="mac-dot" style={{ background: '#febc2e' }} />
              <div className="mac-dot" style={{ background: '#28c840' }} />
              <span className="mac-bar-title">lokesh@macbook — zsh</span>
            </div>
            {/* Issue #4: padding-bottom:0 — no extra blank space at bottom */}
            <div className="term" style={{ overflowX: 'auto', paddingBottom: 20 }}>
              <div><span className="t-p">lokesh@macbook</span> <span className="t-m">~</span> <span className="t-c">$</span> cat about.json</div>
              <br />
              <div><span className="t-m">{'{'}</span></div>
              {/* Issue #1 (prev): No trailing comma on last item */}
              {fields.map(({ key, displayVal, cls }, idx) => (
                <div key={key}>
                  &nbsp;&nbsp;<span className="t-k">"{key}"</span>
                  <span className="t-m">: </span>
                  <span className={cls}>{displayVal}</span>
                  {idx < lastIdx && <span className="t-m">,</span>}
                </div>
              ))}
              <div><span className="t-m">{'}'}</span></div>
              <br />
              <div>
                <span className="t-p">lokesh@macbook</span>{' '}
                <span className="t-m">~</span>{' '}
                <span className="t-c">$</span>{' '}
                <span className="caret" style={{ background: '#cdd6f4' }} />
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <CertificationsModal 
        isOpen={isCertsOpen} 
        onClose={() => setIsCertsOpen(false)} 
        achievements={achievements} 
      />
    </section>
  )
}
