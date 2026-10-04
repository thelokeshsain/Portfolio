import { motion } from 'framer-motion'
import { Briefcase } from 'lucide-react'

const EXPERIENCE_ITEMS = [
  {
    id: 1,
    role: 'Software Engineer',
    company: '3Handshake Techsoft Private Limited',
    location: 'Jaipur, Rajasthan',
    period: 'Jul 2025 – Present',
    type: 'Full-time',
    points: [
      'Building and maintaining web applications in React.js.',
      'Integrated LLM-powered image generation using OpenRouter API with Gemini.',
      'Used AI-assisted development tools (OpenAI Codex, Google Antigravity).',
      'Reduced page load time through lazy loading and improved user experience.',
    ],
  },
  {
    id: 2,
    role: 'Web Developer Intern',
    company: '3Handshake Techsoft Private Limited',
    location: 'Jaipur, Rajasthan',
    period: 'Jan 2025 – Jul 2025',
    type: 'Internship',
    points: [
      'Built responsive web interfaces using React.js, HTML5, CSS3 and JavaScript.',
      'Integrated RESTful APIs with error handling.',
      'Used React Hooks and Context API for state management.',
      'Developed reusable components and resolved production bugs.',
    ],
  },
]

export default function Experience() {
  return (
    <section id="experience" className="section section-border" style={{ position: 'relative' }}>
      <div className="inner">
        <div className="section-label" style={{ marginBottom: 12 }}>04 / EXPERIENCE</div>
        <h2 className="section-heading" style={{ marginBottom: 36 }}>
          My Professional Journey
        </h2>

      {/* Timeline List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, position: 'relative' }}>
        {EXPERIENCE_ITEMS.map((exp, idx) => (
          <motion.div
            key={exp.id || idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            style={{
              display: 'grid',
              gridTemplateColumns: '130px 24px 1fr',
              gap: 16,
              alignItems: 'flex-start',
            }}
          >
            {/* Left Date & Location */}
            <div style={{ paddingTop: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', lineHeight: 1.3 }}>
                {exp.period}
              </div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                {exp.location}
              </div>
            </div>

            {/* Middle Timeline Line & Dot */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
              position: 'relative',
              paddingTop: 6,
            }}>
              <span style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#38BDF8',
                boxShadow: '0 0 10px rgba(56, 189, 248, 0.8)',
                zIndex: 2,
              }} />
              {idx < EXPERIENCE_ITEMS.length - 1 && (
                <div style={{
                  position: 'absolute',
                  top: 16,
                  bottom: -32,
                  width: 1,
                  background: 'rgba(56, 189, 248, 0.25)',
                }} />
              )}
            </div>

            {/* Right Experience Card */}
            <div style={{
              background: '#0B0F17',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 16,
              padding: '20px 22px',
              transition: 'border-color 0.2s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38BDF8',
                    flexShrink: 0,
                  }}>
                    <Briefcase size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC', margin: 0 }}>
                      {exp.role}
                    </h3>
                    <div style={{ fontSize: 13, color: '#38BDF8', marginTop: 2, fontWeight: 500 }}>
                      {exp.company}
                    </div>
                  </div>
                </div>

                {/* Badge */}
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 9999,
                  background: exp.type === 'Full-time' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                  border: `1px solid ${exp.type === 'Full-time' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(59, 130, 246, 0.25)'}`,
                  color: exp.type === 'Full-time' ? '#38BDF8' : '#60A5FA',
                  whiteSpace: 'nowrap',
                }}>
                  {exp.type}
                </span>
              </div>

              {/* Bullet Points */}
              <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {exp.points?.map((pt, pIdx) => (
                  <li key={pIdx} style={{ fontSize: 13, lineHeight: 1.55, color: '#94A3B8' }}>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
      </div>
    </section>
  )
}
