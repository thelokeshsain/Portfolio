/**
 * Contact Section — Production-hardened
 * Fix QA-01: use publicClient (no auth token) for the public contact endpoint
 * Fix QA-05: rel="noopener noreferrer" on all external links
 */
import { useState } from 'react'
import { publicClient } from '../../context/DataContext'
import toast from 'react-hot-toast'
import { Send, Mail, MapPin } from 'lucide-react'
import useScrollFade from '../../hooks/useScrollFade'
import { useData } from '../../context/DataContext'
import { useTheme } from '../../context/ThemeContext'

const GHIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
)
const LIIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

export default function Contact() {
  const { data } = useData()
  const { dark } = useTheme()
  const ref = useScrollFade()
  const h = data.hero || {}
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)
  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in all fields'); return
    }
    if (form.name.length > 100) { toast.error('Name must be under 100 characters'); return }
    if (form.message.length > 2000) { toast.error('Message must be under 2000 characters'); return }
    if (form.message.trim().length < 10) { toast.error('Message is too short'); return }

    setLoading(true)
    try {
      // Fix QA-01: publicClient has no auth header — correct for a public endpoint
      await publicClient.post('/contact', form)
      toast.success("Message sent! I'll get back to you soon ✓")
      setForm({ name: '', email: '', message: '' })
    } catch (err) {
      const msg = err.response?.data?.message || 'Send failed. Please email directly.'
      toast.error(msg)
    } finally { setLoading(false) }
  }

  const INFO = [
    { Icon: Mail, label: 'Email', val: h.email, href: `mailto:${h.email}`, bg: 'var(--yellow)', color: '#000', iconBg: 'var(--yellow)' },
    { Icon: MapPin, label: 'Location', val: h.location, href: null, bg: 'var(--cream)', color: 'var(--ink)', iconBg: 'var(--cream)' },
    { Icon: GHIcon, label: 'GitHub', val: 'thelokeshsain', href: h.github, bg: 'var(--surface)', color: 'var(--ink)', iconBg: '#24292e' },
    { Icon: LIIcon, label: 'LinkedIn', val: 'in/thelokeshsain', href: h.linkedin, bg: 'var(--surface)', color: 'var(--ink)', iconBg: '#0A66C2' },
  ]

  return (
    <section id="contact" className="section fade-up" ref={ref}>
      <div className="inner">
        <div className="label">Contact</div>
        <h2 className="h2" style={{ marginBottom: 14 }}>
          Let's build something <span className="mark">great.</span>
        </h2>
        <p style={{ fontSize: 'clamp(14px,1.8vw,17px)', color: 'var(--muted)', marginBottom: 48, maxWidth: 480, lineHeight: 1.75 }}>
          I'm always excited about new projects, collaborations, or just a friendly chat.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 'clamp(20px,3vw,32px)' }}>
          {/* Contact Form */}
          <div className="mac">
            <div className="mac-bar">
              <div className="mac-dot" style={{ background: '#ff5f57' }} />
              <div className="mac-dot" style={{ background: '#febc2e' }} />
              <div className="mac-dot" style={{ background: '#28c840' }} />
              <span className="mac-bar-title">contact.send()</span>
            </div>
            <div style={{ padding: 'clamp(18px,3vw,28px)' }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 7 }}>Name</label>
                <input
                  value={form.name} onChange={e => setField('name', e.target.value)}
                  className="field" placeholder="Your name" maxLength={100}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 7 }}>Email</label>
                <input
                  type="email" value={form.email} onChange={e => setField('email', e.target.value)}
                  className="field" placeholder="your@email.com" maxLength={254}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 7 }}>
                  Message
                  <span style={{ float: 'right', fontWeight: 400, letterSpacing: 0 }}>{form.message.length}/2000</span>
                </label>
                <textarea
                  rows={5} value={form.message} onChange={e => setField('message', e.target.value)}
                  className="field" placeholder="Tell me about your project..." style={{ resize: 'vertical', lineHeight: 1.7 }}
                  maxLength={2000}
                />
              </div>
              <button onClick={submit} disabled={loading} className="btn btn-yellow" style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
                <Send size={14} />{loading ? 'Sending…' : 'Send Message'}
              </button>
            </div>
          </div>

          {/* Contact Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {INFO.map(({ Icon, label, val, href, bg, color, iconBg }) => {
              // Icon text color: white for dark icon backgrounds (GitHub/LinkedIn), else same as row color
              const iconColor = (iconBg === '#24292e' || iconBg === '#0A66C2') ? '#ffffff' : color
              return (
                <div key={label} style={{ border: '2px solid var(--ink)', borderRadius: 'var(--r)', padding: '16px 20px', background: bg, boxShadow: 'var(--sh)', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, border: '2px solid var(--ink)', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: iconColor }}>
                    <Icon />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 2 }}>{label}</div>
                    {href
                      ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ fontSize: 14, fontWeight: 600, color, wordBreak: 'break-all', textDecoration: 'none' }}>{val}</a>
                      : <span style={{ fontSize: 14, fontWeight: 600, color }}>{val}</span>
                    }
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}