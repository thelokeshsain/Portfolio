/**
 * CertificationsModal — Midnight Blueprint System
 * Accessible modal displaying Achievements, Certifications & Academic Background.
 */
import { X, ExternalLink, Award, GraduationCap, Calendar, CheckCircle2 } from 'lucide-react'
import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { useData } from '../../context/DataContext'
import GlowCard from './GlowCard'

const emptySubscribe = () => () => {}

export default function CertificationsModal({
  isOpen,
  onClose,
  achievements: propAchievements,
  education: propEducation,
}) {
  const { data } = useData()
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)
  const [activeTab, setActiveTab] = useState('certifications') // 'certifications' | 'education'

  // Resolve data from props or context fallback
  const achievements = Array.isArray(propAchievements) && propAchievements.length > 0
    ? propAchievements
    : (Array.isArray(data?.achievements) ? data.achievements : [])

  const education = Array.isArray(propEducation) && propEducation.length > 0
    ? propEducation
    : (Array.isArray(data?.education) ? data.education : [])

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on Escape
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen || !mounted) return null

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        background: 'rgba(5, 7, 10, 0.78)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(14px, 3vw, 24px)',
        animation: 'modalFadeIn 0.2s ease',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Achievements, Certifications and Education"
    >
      <style>{`
        @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideIn { from { transform: scale(0.96) translateY(8px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
      `}</style>

      <div
        style={{
          background: '#0B0F17',
          width: '100%',
          maxWidth: 620,
          maxHeight: '88vh',
          borderRadius: 20,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 50px rgba(56, 189, 248, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          animation: 'modalSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Gradient Bar */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, #38BDF8, #818CF8, #34D399)' }} />

        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px 16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#38BDF8',
                marginBottom: 4,
              }}
            >
              Background & Credentials
            </div>
            <h3
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#F8FAFC',
              }}
            >
              Achievements & Certifications
            </h3>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#94A3B8',
              transition: 'all 0.2s',
              padding: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FFFFFF'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#94A3B8'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
            }}
            aria-label="Close modal"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <button
            onClick={() => setActiveTab('certifications')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 9999,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: activeTab === 'certifications' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
              background: activeTab === 'certifications' ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
              color: activeTab === 'certifications' ? '#38BDF8' : '#94A3B8',
            }}
          >
            <Award size={14} strokeWidth={2.2} />
            <span>Certifications ({achievements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('education')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 9999,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: activeTab === 'education' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
              background: activeTab === 'education' ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
              color: activeTab === 'education' ? '#38BDF8' : '#94A3B8',
            }}
          >
            <GraduationCap size={15} strokeWidth={2.2} />
            <span>Education ({education.length})</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div
          style={{
            padding: '20px 24px 28px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            maxHeight: 'calc(88vh - 150px)',
          }}
        >
          {activeTab === 'certifications' ? (
            achievements.length > 0 ? (
              achievements.map((item, index) => (
                <GlowCard
                  key={item.id || item._id || index}
                  style={{
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    background: 'rgba(15, 23, 42, 0.55)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 14,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: 'rgba(56, 189, 248, 0.1)',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: '#38BDF8',
                        fontSize: 20,
                      }}
                    >
                      {item.icon ? (
                        <span>{item.icon}</span>
                      ) : (
                        <Award size={22} strokeWidth={2} />
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 15,
                          color: '#F8FAFC',
                          lineHeight: 1.3,
                        }}
                      >
                        {item.title}
                      </div>
                      {item.sub && (
                        <div
                          style={{
                            fontSize: 13,
                            color: '#94A3B8',
                            fontFamily: 'var(--font-mono)',
                            marginTop: 3,
                          }}
                        >
                          {item.sub}
                        </div>
                      )}
                    </div>
                  </div>

                  {item.link && (
                    <div style={{ paddingLeft: 58 }}>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: '#38BDF8',
                          background: 'rgba(56, 189, 248, 0.08)',
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                          padding: '6px 14px',
                          borderRadius: 8,
                          textDecoration: 'none',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(56, 189, 248, 0.16)'
                          e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(56, 189, 248, 0.08)'
                          e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.2)'
                        }}
                      >
                        <span>View Credential</span>
                        <ExternalLink size={12} strokeWidth={2.5} />
                      </a>
                    </div>
                  )}
                </GlowCard>
              ))
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: '#94A3B8',
                  fontSize: 14,
                }}
              >
                No achievements or certifications found.
              </div>
            )
          ) : (
            education.length > 0 ? (
              education.map((item, index) => (
                <GlowCard
                  key={item.id || item._id || index}
                  style={{
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    background: 'rgba(15, 23, 42, 0.55)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 14,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: '#818CF8',
                      }}
                    >
                      <GraduationCap size={22} strokeWidth={2} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono)',
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: 'rgba(56, 189, 248, 0.12)',
                            color: '#38BDF8',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                          }}
                        >
                          {item.abbr || 'Degree'}
                        </span>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 15,
                            color: '#F8FAFC',
                          }}
                        >
                          {item.name}
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 16,
                          fontSize: 13,
                          color: '#94A3B8',
                          marginTop: 6,
                          flexWrap: 'wrap',
                        }}
                      >
                        {item.period && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Calendar size={13} color="#64748B" />
                            <span>{item.period}</span>
                          </div>
                        )}
                        {item.grade && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#34D399' }}>
                            <CheckCircle2 size={13} color="#34D399" />
                            <span>{item.grade}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </GlowCard>
              ))
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: '#94A3B8',
                  fontSize: 14,
                }}
              >
                No education details found.
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
