import { MapPin, Calendar } from 'lucide-react'
import useScrollFade from '../../hooks/useScrollFade'
import { useData } from '../../context/DataContext'

export default function Experience() {
  const { data } = useData()
  const ref = useScrollFade()
  const experience = data.experience || []

  return (
    <section id="experience" className="section fade-up" ref={ref} style={{ background: 'var(--cream)' }}>
      <div className="inner-sm">
        <div className="label">Experience</div>
        <h2 className="h2" style={{ marginBottom: 48 }}>
          Where I've <span className="mark">worked.</span>
        </h2>
        <div className="tl">
          {experience.map((exp, i) => (
            <div key={exp.id} style={{ position: 'relative', marginBottom: i < experience.length - 1 ? 32 : 0 }}>
              <div className={`tl-dot${exp.current ? ' now' : ''}`} />
              <div className="mac" style={{ marginLeft: 'clamp(14px,3vw,22px)' }}>
                <div className="mac-bar" style={{ background: exp.current ? 'var(--yellow)' : 'var(--cream)' }}>
                  <div className="mac-dot" style={{ background: '#ff5f57' }} />
                  <div className="mac-dot" style={{ background: '#febc2e' }} />
                  <div className="mac-dot" style={{ background: '#28c840' }} />
                  <span className="mac-bar-title" style={{ color: exp.current ? '#000' : 'var(--muted)' }}>
                    {exp.role} · {exp.period}
                  </span>
                </div>
                <div style={{ padding: 'clamp(18px,3vw,26px)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                        <h3 style={{ fontWeight: 800, fontSize: 'clamp(15px,2.2vw,18px)', letterSpacing: '-0.02em' }}>{exp.role}</h3>
                        {exp.current && <span className="tag tag-g" style={{ fontSize: 11 }}>● Live</span>}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--muted)' }}>{exp.company}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--subtle)', fontFamily: 'var(--mono)' }}>
                        <Calendar size={11} />{exp.period}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--subtle)' }}>
                        <MapPin size={11} />{exp.location}
                      </div>
                    </div>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {(exp.points || []).map((pt, j) => (
                      <li key={j} style={{ display: 'flex', gap: 10, fontSize: 'clamp(13px,1.6vw,14.5px)', color: 'var(--muted)', lineHeight: 1.65 }}>
                        <span style={{ color: 'var(--ink)', fontWeight: 800, flexShrink: 0, marginTop: 1 }}>→</span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
