import { useState } from 'react'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { BrandIcon } from '../../config/brandAssets'

const FEATURED_PROJECTS = [
  {
    id: 1,
    title: 'Apna Backup',
    desc: 'Online backup platform with real-time synchronization and secure file storage.',
    tags: ['React.js', 'REST APIs', 'Responsive'],
    image: '/images/project_apna_backup.webp',
    featured: true,
    link: 'https://www.apnabackup.com/',
    github: 'https://github.com/thelokeshsain/Apna-Backup',
  },
  {
    id: 2,
    title: 'FoodCourt Mobile App',
    desc: 'Android app for cafeteria food ordering with real-time tracking.',
    tags: ['Android', 'Java', 'XML'],
    image: '/images/project_foodcourt.webp',
    featured: false,
    link: 'https://github.com/thelokeshsain/FoodCourt',
    github: 'https://github.com/thelokeshsain/FoodCourt',
  },
  {
    id: 3,
    title: 'Sizzling Hair Salon Platform',
    desc: 'Full-stack salon management platform with appointment booking.',
    tags: ['HTML5', 'CSS3', 'JavaScript'],
    image: '/images/project_sizzling.webp',
    featured: false,
    link: 'https://github.com/thelokeshsain/Sizzling',
    github: 'https://github.com/thelokeshsain/Sizzling',
  },
]

export default function Projects() {
  const { data } = useData()
  const dbProjects = data.projects || []
  const [showAll, setShowAll] = useState(false)

  // Use the exact reference featured projects for top 3, plus remaining from DB if showAll
  const extraProjects = dbProjects.slice(3)
  const displayedProjects = showAll ? [...FEATURED_PROJECTS, ...extraProjects] : FEATURED_PROJECTS

  return (
    <section id="projects" className="section section-border" style={{ position: 'relative' }}>
      <div className="inner">
        {/* Section Header */}
        <div style={{ marginBottom: 36 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>03 / FEATURED PROJECTS</div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: 24,
          }}>
            <div>
              <h2 className="section-heading" style={{ margin: 0 }}>
                Projects I&apos;ve Built
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <p style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
                maxWidth: 440,
                margin: 0,
              }}>
                A few projects that showcase my experience in full-stack development, real-world problem solving and building user-focused products.
              </p>

              <button
                onClick={() => setShowAll(p => !p)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#FFFFFF',
                  color: '#090D16',
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '10px 20px',
                  borderRadius: 9999,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
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
                <span>{showAll ? 'Show Featured' : 'View All Projects'}</span>
                <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        {/* 3-Column Projects Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: 24,
        }}>
          {displayedProjects.map((p, idx) => {
            const isFeatured = p.featured
            const tags = Array.isArray(p.tags)
              ? p.tags.map(t => typeof t === 'string' ? t : t?.label || '')
              : []

            return (
              <div
                key={p.id || p.title || idx}
                style={{
                  background: '#0B0F17',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 18,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'border-color 0.25s, transform 0.25s, box-shadow 0.25s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)'
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 12px 36px rgba(0, 0, 0, 0.5)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Image Container */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16 / 10',
                  background: '#070A0F',
                  overflow: 'hidden',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                }}>
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#475569',
                      fontSize: 14,
                    }}>
                      {p.title}
                    </div>
                  )}

                  {/* Featured Badge */}
                  {isFeatured && (
                    <div style={{
                      position: 'absolute',
                      top: 14,
                      left: 14,
                      background: 'rgba(59, 130, 246, 0.9)',
                      backdropFilter: 'blur(8px)',
                      color: '#FFFFFF',
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '4px 12px',
                      borderRadius: 9999,
                      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
                    }}>
                      Featured
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#F8FAFC',
                    marginBottom: 8,
                    letterSpacing: '-0.01em',
                  }}>
                    {p.title}
                  </h3>

                  <p style={{
                    fontSize: 13.5,
                    lineHeight: 1.6,
                    color: '#94A3B8',
                    marginBottom: 18,
                    flex: 1,
                  }}>
                    {p.desc || p.description}
                  </p>

                  {/* Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                    {tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          fontSize: 11,
                          fontWeight: 500,
                          padding: '3px 10px',
                          borderRadius: 9999,
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: '#CBD5E1',
                        }}
                      >
                        <BrandIcon name={tag} size={13} />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>

                  {/* Card Action Links */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto' }}>
                    {/* Live Demo or View Details */}
                    {isFeatured ? (
                      <a
                        href={p.link || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Live demo of ${p.title}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          background: '#FFFFFF',
                          color: '#090D16',
                          fontSize: 12.5,
                          fontWeight: 600,
                          padding: '7px 16px',
                          borderRadius: 9999,
                          textDecoration: 'none',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#E2E8F0'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = '#FFFFFF'
                        }}
                      >
                        <span>Live Demo</span>
                        <ArrowRight size={13} strokeWidth={2.5} />
                      </a>
                    ) : (
                      <a
                        href={p.link || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View details of ${p.title}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          color: '#F8FAFC',
                          fontSize: 13,
                          fontWeight: 500,
                          textDecoration: 'none',
                          transition: 'color 0.2s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = '#38BDF8'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = '#F8FAFC'
                        }}
                      >
                        <span>View Details</span>
                        <ArrowRight size={13} strokeWidth={2} />
                      </a>
                    )}

                    {/* View Code */}
                    <a
                      href={p.github || 'https://github.com/thelokeshsain'}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View Code for ${p.title} on GitHub`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        color: '#94A3B8',
                        fontSize: 13,
                        fontWeight: 500,
                        textDecoration: 'none',
                        transition: 'color 0.2s',
                        marginLeft: isFeatured ? 'auto' : 8,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = '#FFFFFF'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = '#94A3B8'
                      }}
                    >
                      <span>View Code</span>
                      <BrandIcon name="GitHub" size={14} />
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
