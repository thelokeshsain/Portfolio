import { motion } from 'framer-motion'
import { BrandIcon } from '../../config/brandAssets'

const TECH_SKILLS = [
  { name: 'JavaScript' },
  { name: 'React.js' },
  { name: 'Python' },
  { name: 'Node.js' },
  { name: 'HTML5' },
  { name: 'CSS3' },
  { name: 'REST APIs' },
  { name: 'LLM APIs' },
  { name: 'MySQL' },
  { name: 'MongoDB' },
  { name: 'Git' },
  { name: 'VS Code' },
]

export default function Skills() {
  return (
    <div id="skills" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="section-label" style={{ marginBottom: 12 }}>04 / SKILLS</div>
      <h2 className="section-heading" style={{ marginBottom: 36 }}>
        Technologies I Work With
      </h2>

      {/* 4 × 3 Grid of 12 Technology Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
      }}>
        {TECH_SKILLS.map((skill, idx) => (
          <motion.div
            key={skill.name}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: idx * 0.03 }}
            style={{
              background: '#0B0F17',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 14,
              padding: '18px 10px 14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              minHeight: 100,
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.35)'
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.boxShadow = '0 10px 24px -5px rgba(0, 0, 0, 0.5), 0 0 16px rgba(56, 189, 248, 0.1)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <BrandIcon name={skill.name} size={30} />
            </div>

            <span style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#CBD5E1',
              textAlign: 'center',
              lineHeight: 1.2,
            }}>
              {skill.name}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
