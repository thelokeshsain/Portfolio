import { useState } from 'react'
import toast from 'react-hot-toast'
import { Mail, ArrowRight, Send } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { BrandIcon } from '../../config/brandAssets'

export default function Contact() {
  const { data } = useData()
  const h = data.hero || {}
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    if (form.name.length > 100) { toast.error('Name must be under 100 characters'); return }
    if (form.message.length > 2000) { toast.error('Message must be under 2000 characters'); return }
    if (form.message.trim().length < 10) { toast.error('Message is too short'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Send failed')
      toast.success("Message sent! I'll get back to you soon.")
      setForm({ name: '', email: '', message: '' })
      setShowForm(false)
    } catch (err) {
      toast.error(err.message || 'Send failed. Please email directly.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="section section-border" style={{ position: 'relative' }}>
      <div className="inner">
        <div className="section-label" style={{ marginBottom: 12 }}>06 / CONTACT</div>

        {/* Contact Banner matching the reference */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 32,
          paddingBottom: 36,
        }}>
          {/* Left Text */}
          <div style={{ maxWidth: 620 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 3.8vw, 42px)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: '#FFFFFF',
              margin: '0 0 14px 0',
            }}>
              Have a product to build?
            </h2>
            <p style={{
              fontSize: 14.5,
              lineHeight: 1.65,
              color: '#94A3B8',
              margin: 0,
            }}>
              I&apos;m currently open to new opportunities and interesting projects. Whether it&apos;s a full-time role, freelance work or just a good conversation about tech — feel free to reach out.
            </p>
          </div>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {/* Email Me Button */}
            <a
              href={h.email ? `mailto:${h.email}` : 'mailto:iamlokeshsain@gmail.com'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#F8FAFC',
                fontSize: 13,
                fontWeight: 500,
                padding: '10px 18px',
                borderRadius: 9999,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <Mail size={14} />
              <span>Email Me</span>
            </a>

            {/* LinkedIn Button */}
            <a
              href={h.linkedin || 'https://linkedin.com/in/thelokeshsain'}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#F8FAFC',
                fontSize: 13,
                fontWeight: 500,
                padding: '10px 18px',
                borderRadius: 9999,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <BrandIcon name="LinkedIn" size={15} />
              <span>LinkedIn</span>
            </a>

            {/* GitHub Button */}
            <a
              href={h.github || 'https://github.com/thelokeshsain'}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#F8FAFC',
                fontSize: 13,
                fontWeight: 500,
                padding: '10px 18px',
                borderRadius: 9999,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <BrandIcon name="GitHub" size={15} />
              <span>GitHub</span>
            </a>

            {/* Circular Arrow Button (Opens direct contact message form) */}
            <button
              onClick={() => setShowForm(p => !p)}
              aria-label="Open contact form"
              title="Open message form"
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: '#FFFFFF',
                color: '#090D16',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
                transition: 'transform 0.2s, background 0.2s',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.08)'
                e.currentTarget.style.background = '#F1F5F9'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.background = '#FFFFFF'
              }}
            >
              <ArrowRight size={18} strokeWidth={2.5} style={{ transform: showForm ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
          </div>
        </div>

        {/* Expandable Contact Form (Preserves all API & validation) */}
        {showForm && (
          <div
            style={{
              marginTop: 24,
              padding: '32px',
              background: '#0B0F17',
              borderRadius: 20,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              maxWidth: 680,
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF', marginBottom: 20 }}>
              Send a Direct Message
            </h3>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label htmlFor="contact-name" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Your name"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label htmlFor="contact-email" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="your.email@example.com"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label htmlFor="contact-message" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={4}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Tell me about your project or opportunity..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    fontSize: 14,
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  alignSelf: 'flex-start',
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
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <Send size={14} />
                <span>{loading ? 'Sending...' : 'Send Message'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  )
}