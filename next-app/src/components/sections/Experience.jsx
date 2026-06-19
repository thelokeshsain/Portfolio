import { MapPin, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { useData } from '../../context/DataContext'

export default function Experience() {
  const { data } = useData()
  const experience = data.experience || []

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 45 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 60,
        damping: 15,
      },
    },
  }

  return (
    <section id="experience" className="section section-border" style={{ position: 'relative' }}>
      <div className="mesh-bg" />

      <div className="inner-sm">
        <div className="section-label">Experience</div>
        <motion.h2 
          className="section-heading" 
          style={{ marginBottom: 56 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Where I've <span className="gradient-text">worked.</span>
        </motion.h2>

        <motion.div 
          className="tl"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {experience.map((exp, i) => (
            <motion.div 
              key={exp.id || `exp-${i}`} 
              variants={cardVariants}
              className="exp-card" 
              style={{
                position: 'relative',
                marginBottom: i < experience.length - 1 ? 36 : 0,
              }}
            >
              <div className={`tl-dot${exp.current ? ' now' : ''}`} />

              <div className="glass-card" style={{
                marginLeft: 'clamp(16px, 3vw, 24px)',
                overflow: 'hidden',
              }}>
                {/* Accent top bar */}
                {exp.current && (
                  <div style={{
                    height: 2,
                    background: 'var(--gradient-accent)',
                  }} />
                )}

                <div style={{ padding: 'clamp(20px, 3vw, 28px)' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 12,
                    marginBottom: 16,
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                        <h3 style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 700,
                          fontSize: 'clamp(16px, 2.2vw, 18px)',
                          letterSpacing: '-0.02em',
                          color: 'var(--text-primary)',
                        }}>
                          {exp.role}
                        </h3>
                        {exp.current && (
                          <span className="tag tag-g" style={{ fontSize: 11 }}>
                            ● Active
                          </span>
                        )}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-secondary)' }}>{exp.company}</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        <Calendar size={12} />{exp.period}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                        <MapPin size={12} />{exp.location}
                      </div>
                    </div>
                  </div>

                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(exp.points || []).map((pt, j) => (
                      <li key={j} style={{
                        display: 'flex',
                        gap: 12,
                        fontSize: 'clamp(13px, 1.6vw, 14.5px)',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.7,
                      }}>
                        <span style={{
                          color: 'var(--accent-light)',
                          fontWeight: 700,
                          flexShrink: 0,
                          marginTop: 2,
                        }}>→</span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

