import { motion } from 'framer-motion'
import { useData } from '../../context/DataContext'
import GlowCard from '../ui/GlowCard'

const CAT = {
  Frontend: { icon: '⬡', gradient: 'linear-gradient(135deg, #6366f1, #818cf8)', color: '#818cf8' },
  Backend:  { icon: '◈', gradient: 'linear-gradient(135deg, #22c55e, #4ade80)', color: '#4ade80' },
  Database: { icon: '◉', gradient: 'linear-gradient(135deg, #ec4899, #f472b6)', color: '#f472b6' },
  Tools:    { icon: '⊞', gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)', color: '#60a5fa' },
}

const STACK_TAGS = ['tag-y', 'tag-g', 'tag-pk', 'tag-bl', 'tag-pu', 'tag-or', 'tag-cr']

export default function Skills() {
  const { data } = useData()

  const skills    = data.skills    || {}
  const coreStack = Array.isArray(data.coreStack) ? data.coreStack : []

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 70, damping: 15 }
    }
  }

  return (
    <section id="skills" className="section section-border" style={{ position: 'relative' }}>
      <div className="mesh-bg" />

      <div className="inner">
        <div className="section-label">Skills</div>
        <motion.h2 
          className="section-heading" 
          style={{ marginBottom: 56 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          My <span className="gradient-text">toolbox.</span>
        </motion.h2>

        {/* Skills grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
            gap: 20,
            marginBottom: 24,
          }}
        >
          {Object.entries(skills).map(([cat, list]) => {
            const m = CAT[cat] || { icon: '◎', gradient: 'var(--gradient-accent)', color: 'var(--accent-light)' }
            const safeList = Array.isArray(list) ? list : []
            return (
              <motion.div key={cat} variants={cardVariants}>
                <GlowCard className="skill-group" style={{ padding: 'clamp(20px, 3vw, 28px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                    <div style={{
                      width: 34,
                      height: 34,
                      borderRadius: 'var(--radius-sm)',
                      background: m.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      color: '#fff',
                      flexShrink: 0,
                      fontWeight: 700,
                      boxShadow: `0 4px 12px ${m.color}33`,
                    }}>
                      {m.icon}
                    </div>
                    <span style={{
                      fontWeight: 700,
                      fontSize: 14,
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '.03em',
                      color: 'var(--text-primary)',
                    }}>{cat}</span>
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                      background: 'var(--surface)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--border)',
                    }}>{safeList.length}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {safeList.map((s, i) => (
                      <span key={`${cat}-${i}`} className="pill">{s}</span>
                    ))}
                  </div>
                </GlowCard>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Core stack bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <GlowCard style={{
            padding: 'clamp(18px, 2.5vw, 24px) clamp(18px, 3vw, 28px)',
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              flexShrink: 0,
            }}>
              Core Stack →
            </span>
            {coreStack.length > 0
              ? coreStack.map((t, i) => (
                  <span key={`cs-${i}`} className={`tag ${STACK_TAGS[i % STACK_TAGS.length]}`}>{t}</span>
                ))
              : ['React.js', 'Node.js', 'MongoDB', 'MySQL', 'JavaScript', 'Git', 'REST APIs'].map((t, i) => (
                  <span key={`cs-${i}`} className={`tag ${STACK_TAGS[i % STACK_TAGS.length]}`}>{t}</span>
                ))
            }
          </GlowCard>
        </motion.div>
      </div>
    </section>
  )
}

