import useScrollFade from '../../hooks/useScrollFade'
import { useData } from '../../context/DataContext'

const CAT = {
  Frontend: { icon: '⬡', bg: 'var(--yellow)', color: '#000' },
  Backend:  { icon: '◈', bg: 'var(--green)',  color: '#000' },
  Database: { icon: '◉', bg: 'var(--pink)',   color: '#000' },
  Tools:    { icon: '⊞', bg: 'var(--blue)',   color: '#fff' },
}

const STACK_TAGS = ['tag-y','tag-g','tag-pk','tag-bl','tag-pu','tag-or','tag-cr']

export default function Skills() {
  const { data } = useData()
  const ref = useScrollFade()

  const skills    = data.skills    || {}
  const coreStack = Array.isArray(data.coreStack) ? data.coreStack : []

  return (
    <section id="skills" className="section fade-up" ref={ref} style={{ background: 'var(--cream)' }}>
      <div className="inner">
        <div className="label">Skills</div>
        <h2 className="h2" style={{ marginBottom: 48 }}>
          My <span className="mark">toolbox.</span>
        </h2>

        {/* Mac window */}
        <div className="mac" style={{ marginBottom: 20 }}>
          <div className="mac-bar">
            <div className="mac-dot" style={{ background: '#ff5f57' }} />
            <div className="mac-dot" style={{ background: '#febc2e' }} />
            <div className="mac-dot" style={{ background: '#28c840' }} />
            <span className="mac-bar-title">skills.config.js</span>
          </div>
          <div style={{ padding: 'clamp(20px,3vw,32px)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))', gap: 'clamp(20px,3vw,32px)' }}>
              {Object.entries(skills).map(([cat, list]) => {
                const m = CAT[cat] || { icon: '◎', bg: 'var(--cream)', color: 'var(--ink)' }
                const safeList = Array.isArray(list) ? list : []
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: m.bg, border: '2px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: m.color, flexShrink: 0, fontWeight: 700, boxShadow: '2px 2px 0 var(--ink)' }}>
                        {m.icon}
                      </div>
                      <span style={{ fontWeight: 800, fontSize: 14, fontFamily: 'var(--mono)', letterSpacing: '.04em' }}>{cat}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--subtle)', fontFamily: 'var(--mono)' }}>{safeList.length}</span>
                    </div>
                    <div>
                      {safeList.map((s, i) => (
                        <span key={`${cat}-${i}`} className="pill">{s}</span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Core stack — always shown */}
        <div style={{ border: '2px solid var(--ink)', borderRadius: 'var(--r)', padding: 'clamp(16px,2vw,22px) clamp(16px,3vw,28px)', background: 'var(--surface)', boxShadow: 'var(--sh)', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', flexShrink: 0 }}>
            Core Stack →
          </span>
          {coreStack.length > 0
            ? coreStack.map((t, i) => (
                <span key={`cs-${i}`} className={`tag ${STACK_TAGS[i % STACK_TAGS.length]}`}>{t}</span>
              ))
            : ['React.js','Node.js','MongoDB','MySQL','JavaScript','Git','REST APIs'].map((t, i) => (
                <span key={`cs-${i}`} className={`tag ${STACK_TAGS[i % STACK_TAGS.length]}`}>{t}</span>
              ))
          }
        </div>
      </div>
    </section>
  )
}
