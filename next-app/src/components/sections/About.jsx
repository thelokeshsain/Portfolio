import { useState } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion'
import { useData } from '../../context/DataContext'
import { useTheme } from '../../context/ThemeContext'
import CertificationsModal from '../ui/CertificationsModal'
import GlowCard from '../ui/GlowCard'

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

const eduColors = [
  { bg: 'rgba(99, 102, 241, 0.08)', border: 'rgba(99, 102, 241, 0.15)', accent: '#818cf8' },
  { bg: 'rgba(236, 72, 153, 0.08)', border: 'rgba(236, 72, 153, 0.15)', accent: '#f472b6' },
]

export default function About() {
  const { data } = useData()
  const { dark } = useTheme()
  const { scrollY } = useScroll()
  const shouldReduceMotion = useReducedMotion()

  const about        = Array.isArray(data.about)        ? data.about        : []
  const education    = Array.isArray(data.education)    ? data.education    : []
  const achievements = Array.isArray(data.achievements) ? data.achievements : []
  const [isCertsOpen, setIsCertsOpen] = useState(false)
  const h = data.hero || {}

  // Scroll Parallax for Dashboard Mockup
  const yVal = useTransform(scrollY, [100, 1200], [0, -100])
  const y = useSpring(yVal, { stiffness: 80, damping: 25 })

  const fields = TERMINAL_FIELDS.map(f => ({
    ...f,
    displayVal: f.val
      || (f.key === 'name'     ? `"${h.name     || 'Lokesh Sain'}"` : undefined)
      || (f.key === 'location' ? `"${h.location || 'Jaipur, Rajasthan'}"` : '""'),
  }))
  const lastIdx = fields.length - 1

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: 'spring', stiffness: 80, damping: 15 }
    }
  }

  return (
    <section id="about" className="section section-border" style={{ position: 'relative' }}>
      <div className="mesh-bg" />

      <div className="inner">
        <div className="section-label">About</div>
        <motion.h2 
          className="section-heading" 
          style={{ marginBottom: 56 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          A developer who cares<br />about the <span className="gradient-text">details.</span>
        </motion.h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
          gap: 'clamp(28px, 4vw, 48px)',
          alignItems: 'start',
        }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {about.map((p, i) => (
              <motion.p 
                key={i} 
                style={{ fontSize: 'clamp(15px, 1.7vw, 16px)', lineHeight: 1.85, color: 'var(--text-secondary)' }}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                {p}
              </motion.p>
            ))}

            {/* Education cards with stagger */}
            <motion.div 
              style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {education.map((e, i) => {
                const c = eduColors[i % eduColors.length]
                return (
                  <motion.div key={i} variants={cardVariants}>
                    <GlowCard className="edu-card" style={{
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      background: c.bg,
                      borderColor: c.border,
                    }}>
                      <div style={{
                        fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-mono)',
                        color: c.accent, minWidth: 44, flexShrink: 0,
                      }}>{e.abbr}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{e.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 3 }}>{e.period} · {e.grade}</div>
                      </div>
                    </GlowCard>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* Achievements button */}
            {achievements.length > 0 && (
              <motion.button
                className="btn btn-ghost"
                style={{ alignSelf: 'flex-start', marginTop: 8 }}
                onClick={() => setIsCertsOpen(true)}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                🏆 View Achievements & Certifications
              </motion.button>
            )}
          </div>

          {/* Right: terminal */}
          <div style={{ position: 'relative', alignSelf: 'start' }}>
            {/* Floating dashboard mockup layer */}
            <motion.div
              style={{
                position: 'absolute',
                bottom: '-20%',
                left: '-25%',
                width: '75%',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                overflow: 'hidden',
                boxShadow: dark ? 'var(--shadow-xl)' : 'var(--shadow-md)',
                zIndex: -1,
                opacity: dark ? 0.6 : 0.35,
                pointerEvents: 'none',
                background: 'var(--bg-secondary)',
                y: shouldReduceMotion ? 0 : y,
              }}
            >
              <Image
                src="/images/dashboard_mockup.webp"
                alt="Dashboard Analytics Mockup"
                width={800}
                height={600}
                style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
              />
            </motion.div>

            <motion.div 
              className="terminal"
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ type: 'spring', stiffness: 50, damping: 15 }}
            >
              <div className="terminal-bar">
                <div className="terminal-dot" style={{ background: '#ff5f57' }} />
                <div className="terminal-dot" style={{ background: '#febc2e' }} />
                <div className="terminal-dot" style={{ background: '#28c840' }} />
                <span className="terminal-title">lokesh@dev — zsh</span>
              </div>
              <div className="terminal-body" style={{ overflowX: 'auto', paddingBottom: 20 }}>
                <div><span className="t-p">lokesh@dev</span> <span className="t-m">~</span> <span className="t-c">$</span> cat about.json</div>
                <br />
                <div><span className="t-m">{'{'}</span></div>
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
                  <span className="t-p">lokesh@dev</span>{' '}
                  <span className="t-m">~</span>{' '}
                  <span className="t-c">$</span>{' '}
                  <span className="caret" />
                </div>
              </div>
            </motion.div>
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

