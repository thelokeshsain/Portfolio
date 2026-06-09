import { useRef, useCallback } from 'react'
import { ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { useData } from '../../context/DataContext'

const GHIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
)

const accentMap = {
  'var(--yellow)': { bg: 'rgba(99, 102, 241, 0.06)', border: 'rgba(99, 102, 241, 0.15)', gradient: 'linear-gradient(135deg, #6366f1, #818cf8)' },
  'var(--green)': { bg: 'rgba(34, 197, 94, 0.06)', border: 'rgba(34, 197, 94, 0.15)', gradient: 'linear-gradient(135deg, #22c55e, #4ade80)' },
  'var(--pink)': { bg: 'rgba(236, 72, 153, 0.06)', border: 'rgba(236, 72, 153, 0.15)', gradient: 'linear-gradient(135deg, #ec4899, #f472b6)' },
  'var(--blue)': { bg: 'rgba(59, 130, 246, 0.06)', border: 'rgba(59, 130, 246, 0.15)', gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)' },
  'var(--purple)': { bg: 'rgba(139, 92, 246, 0.06)', border: 'rgba(139, 92, 246, 0.15)', gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' },
}

const fallbackAccent = { bg: 'rgba(99, 102, 241, 0.06)', border: 'rgba(99, 102, 241, 0.15)', gradient: 'var(--gradient-accent)' }

const cardVariants = {
  hidden: { opacity: 0, y: 35 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 70, damping: 15 }
  }
}

function ProjectCard({ p }) {
  const cardRef = useRef(null)
  const tags = Array.isArray(p.tags)
    ? p.tags.map(t => typeof t === 'string' ? t : t?.label || '')
    : []
  const isGithubLink = p.link?.includes('github.com')
  const accent = accentMap[p.accentBg] || fallbackAccent

  // 3D tilt on hover (using performant CSS Transforms)
  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current
    if (!card || window.innerWidth < 768) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`
    
    // Add glow cursor update
    const glowX = e.clientX - rect.left
    const glowY = e.clientY - rect.top
    card.style.setProperty('--mouse-x', `${glowX}px`)
    card.style.setProperty('--mouse-y', `${glowY}px`)
  }, [])

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current
    if (card) card.style.transform = 'perspective(800px) rotateY(0) rotateX(0) translateY(0)'
  }, [])

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        border: `1px solid ${accent.border}`,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: accent.bg,
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.15s var(--ease-out-quart), box-shadow 0.3s',
        willChange: 'transform',
      }}
    >
      {/* Gradient accent bar */}
      <div style={{
        height: 3,
        background: accent.gradient,
      }} />

      {/* Card content */}
      <div style={{
        padding: 'clamp(20px, 3vw, 28px)',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header: category + period + logo */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 16,
          gap: 12,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
            <span className={`tag ${p.tagClass || 'tag-y'}`} style={{ fontSize: 11, alignSelf: 'flex-start' }}>
              {p.category || 'Project'}
            </span>
            {p.period && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                {p.period}
              </span>
            )}
          </div>

          {p.image && (
            <div style={{
              width: 'clamp(56px, 10vw, 80px)',
              height: 'clamp(56px, 10vw, 70px)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img
                src={p.image}
                alt={`${p.title} logo`}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                loading="lazy"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 'clamp(17px, 2.5vw, 20px)',
          letterSpacing: '-0.02em',
          marginBottom: 10,
          lineHeight: 1.2,
          color: 'var(--text-primary)',
        }}>
          {p.title}
        </h3>

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {tags.map((t, i) => (
              <span key={`${t}-${i}`} className="tag" style={{ fontSize: 11 }}>
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        <p style={{
          fontSize: 'clamp(13px, 1.5vw, 14px)',
          lineHeight: 1.75,
          color: 'var(--text-secondary)',
          flex: 1,
          marginBottom: 20,
        }}>
          {p.desc || p.description}
        </p>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {p.link && (
            <a
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
            >
              {isGithubLink ? (
                <><GHIcon /> Source Code</>
              ) : (
                <><ExternalLink size={13} /> Live Demo</>
              )}
            </a>
          )}
          {p.github && p.github !== p.link && (
            <a
              href={p.github}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
            >
              <GHIcon /> Source
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function Projects() {
  const { data } = useData()
  const projects = (data.projects || []).filter(p => p.visible !== false)

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      }
    }
  }

  return (
    <section id="projects" className="section section-border" style={{ position: 'relative' }}>
      <div className="mesh-bg" />

      <div className="inner">
        <div className="section-label">Projects</div>
        <motion.h2 
          className="section-heading" 
          style={{ marginBottom: 56 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Things I've <span className="gradient-text">shipped.</span>
        </motion.h2>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
            gap: 20,
          }}
        >
          {projects.map((p, i) => (
            <ProjectCard key={p.id || `proj-${i}`} p={p} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

