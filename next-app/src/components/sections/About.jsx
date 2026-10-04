import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useData } from '../../context/DataContext'
import CertificationsModal from '../ui/CertificationsModal'

const APPROACH = [
  { num: '01', title: 'Understand Deeply', desc: 'I take time to understand the problem and users.' },
  { num: '02', title: 'Build Iteratively', desc: 'I prefer small, consistent iterations with real feedback.' },
  { num: '03', title: 'Keep It Simple', desc: 'Clean, readable and maintainable code always.' },
  { num: '04', title: 'Focus on Impact', desc: 'I care about building features that create real value.' },
]

export default function About() {
  const { data } = useData()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const about = Array.isArray(data.about) ? data.about : []

  return (
    <section id="about" className="section section-border" style={{ position: 'relative' }}>
      <div className="inner">
        <div className="section-label" style={{ marginBottom: 12 }}>05 / ABOUT</div>

        {/* Two Column Layout: Left (About Me) & Right (My Approach) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)',
          gap: 'clamp(32px, 5vw, 64px)',
          alignItems: 'flex-start',
        }}>
          {/* Left Column: More About Me */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="section-heading" style={{ marginBottom: 20 }}>
              More About Me
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
              <p style={{
                fontSize: 14.5,
                lineHeight: 1.7,
                color: '#94A3B8',
                margin: 0,
              }}>
                I&apos;m Lokesh Sain, a full-stack software engineer based in Jaipur, India. I enjoy building web applications that are reliable, user-friendly and solve real problems. I&apos;m especially interested in modern web technologies, scalable architectures and practical use cases of AI/LLM APIs in everyday products.
              </p>
            </div>

            {/* White Pill Button: Know More About Me */}
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#FFFFFF',
                color: '#090D16',
                fontSize: 13,
                fontWeight: 600,
                padding: '10px 22px',
                borderRadius: 9999,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.background = '#F1F5F9'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.background = '#FFFFFF'
              }}
            >
              <span>Know More About Me</span>
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </motion.div>

          {/* Right Column: My Approach */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="section-heading" style={{ marginBottom: 20 }}>
              My Approach
            </h2>

            {/* 4 Cards (2x2 grid on large screens) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
              gap: 16,
            }}>
              {APPROACH.map((item, idx) => (
                <motion.div
                  key={item.num}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  style={{
                    background: '#0B0F17',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 16,
                    padding: '22px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    transition: 'border-color 0.2s, transform 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#38BDF8',
                    letterSpacing: '0.02em',
                  }}>
                    {item.num}
                  </span>

                  <h3 style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: '#F8FAFC',
                    margin: 0,
                  }}>
                    {item.title}
                  </h3>

                  <p style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: '#94A3B8',
                    margin: 0,
                  }}>
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Certifications & Education Modal */}
      {isModalOpen && (
        <CertificationsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </section>
  )
}
