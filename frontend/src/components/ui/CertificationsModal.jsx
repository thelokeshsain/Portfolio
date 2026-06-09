/**
 * CertificationsModal — Glassmorphic redesign
 * All modal logic preserved: scroll lock, achievement rendering, external links.
 */
import { X, ExternalLink } from 'lucide-react'
import { useEffect, useCallback } from 'react'
import GlowCard from './GlowCard'

export default function CertificationsModal({ isOpen, onClose, achievements }) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Close on Escape
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(16px, 3vw, 24px)',
        animation: 'modalFadeIn 0.2s ease',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Achievements & Certifications"
    >
      <style>{`@keyframes modalFadeIn{from{opacity:0}to{opacity:1}} @keyframes modalSlideIn{from{transform:scale(0.95);opacity:0}to{transform:scale(1);opacity:1}}`}</style>

      <div
        style={{
          background: 'var(--bg-secondary)',
          width: '100%',
          maxWidth: 600,
          maxHeight: '85vh',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          animation: 'modalSlideIn 0.3s var(--ease-out-expo)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient accent */}
        <div style={{ height: 2, background: 'var(--gradient-accent)' }} />

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
        }}>
          <h3 style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
          }}>
            Achievements & Certifications
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s',
              padding: 0,
            }}
            aria-label="Close modal"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          {achievements && achievements.length > 0 ? (
            achievements.map((item) => (
              <GlowCard
                key={item.id || item._id}
                style={{
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: 14,
                }}>
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: 'var(--accent-glow)',
                    border: '1px solid var(--border-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: 18,
                  }}>
                    {item.icon || '🏆'}
                  </div>
                  <div>
                    <div style={{
                      fontWeight: 700,
                      fontSize: 15,
                      color: 'var(--text-primary)',
                    }}>
                      {item.title}
                    </div>
                    {item.sub && (
                      <div style={{
                        fontSize: 13,
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                        marginTop: 3,
                      }}>
                        {item.sub}
                      </div>
                    )}
                  </div>
                </div>
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm"
                    style={{ alignSelf: 'flex-start', marginTop: 6, width: 'auto' }}
                  >
                    View Credential <ExternalLink size={13} />
                  </a>
                )}
              </GlowCard>
            ))
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--text-muted)',
              fontSize: 14,
            }}>
              No achievements or certifications added yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
