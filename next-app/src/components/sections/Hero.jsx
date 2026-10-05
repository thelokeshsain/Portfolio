import React from 'react'
import Image from 'next/image'
import { MapPin, ArrowRight, Download, Zap, Mail } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { BrandIcon } from '../../config/brandAssets'

export default function Hero() {
  const { data } = useData()
  const h = data.hero || {}

  const targetImage = (h.image && typeof h.image === 'string' && !h.image.includes('social_preview'))
    ? h.image
    : '/images/hero_laptop_mockup.webp';
  const [imgError, setImgError] = React.useState(false);
  const heroImgSrc = imgError ? '/images/hero_laptop_mockup.webp' : targetImage;

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="home" style={{
      position: 'relative',
      minHeight: '88vh',
      display: 'flex',
      alignItems: 'center',
      paddingTop: 'clamp(36px, 5vw, 64px)',
      paddingBottom: 'clamp(48px, 6vw, 72px)',
      overflow: 'hidden',
    }}>
      {/* Background ambient glow */}
      <div style={{
        position: 'absolute',
        top: '-80px',
        right: '5%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, rgba(99, 102, 241, 0.04) 45%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div className="inner" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        <div className="hero-grid">
          {/* Left Column: Text & CTAs */}
          <div>
            {/* Availability Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 9999,
              background: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              color: '#4ADE80',
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 28,
            }}>
              <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#22C55E',
                boxShadow: '0 0 8px rgba(34, 197, 94, 0.8)',
              }} />
              <span>Available for opportunities</span>
            </div>

            {/* Main Headline */}
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(38px, 4.8vw, 62px)',
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: '-0.035em',
              color: '#FFFFFF',
              marginBottom: 24,
            }}>
              Software Engineer<br />
              who turns ideas into<br />
              <span style={{
                background: 'linear-gradient(135deg, #60A5FA 0%, #38BDF8 50%, #818CF8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                real products.
              </span>
            </h1>

            {/* Description Paragraph */}
            <p style={{
              fontSize: 'clamp(15px, 1.3vw, 16.5px)',
              lineHeight: 1.65,
              color: '#94A3B8',
              maxWidth: 520,
              marginBottom: 20,
            }}>
              I build responsive web applications with React.js, integrate LLM APIs into product features, and enjoy solving real-world problems with clean, scalable and user-friendly solutions.
            </p>

            {/* Location */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              fontSize: 14,
              color: '#94A3B8',
              marginBottom: 32,
            }}>
              <MapPin size={15} color="#94A3B8" />
              <span>Jaipur, Rajasthan, India</span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 36 }}>
              {/* Primary: White Pill View My Work */}
              <a
                href="#projects"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo('projects');
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#FFFFFF',
                  color: '#090D16',
                  fontSize: 14,
                  fontWeight: 600,
                  padding: '12px 24px',
                  borderRadius: 9999,
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 16px rgba(255, 255, 255, 0.1)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.background = '#F8FAFC'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.background = '#FFFFFF'
                }}
              >
                <span>View My Work</span>
                <ArrowRight size={15} strokeWidth={2.5} />
              </a>

              {/* Secondary: Dark Pill Download Resume */}
              <a
                href={h.resumeUrl || '/resume.pdf'}
                download="Lokesh_Sain_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: '#F8FAFC',
                  fontSize: 14,
                  fontWeight: 500,
                  padding: '12px 24px',
                  borderRadius: 9999,
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'
                }}
              >
                <Download size={15} />
                <span>Download Resume</span>
              </a>
            </div>

            {/* Social Icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <a
                href={h.github || 'https://github.com/thelokeshsain'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Profile"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94A3B8',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#FFFFFF'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = '#94A3B8'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
                }}
              >
                <BrandIcon name="GitHub" size={18} />
              </a>

              <a
                href={h.linkedin || 'https://linkedin.com/in/thelokeshsain'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94A3B8',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#FFFFFF'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = '#94A3B8'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
                }}
              >
                <BrandIcon name="LinkedIn" size={18} />
              </a>

              <a
                href={h.email ? `mailto:${h.email}` : 'mailto:iamlokeshsain@gmail.com'}
                aria-label="Send email to Lokesh Sain"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94A3B8',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#FFFFFF'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = '#94A3B8'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
                }}
              >
                <Mail size={18} strokeWidth={2} />
              </a>
            </div>
          </div>

          {/* Right Column: 3D Laptop Display with floating annotations */}
          <div style={{ position: 'relative' }}>
            {/* Top-Right Handwritten Annotation */}
            <div className="hero-annotation" style={{
              position: 'absolute',
              top: '-32px',
              right: '24px',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pointerEvents: 'none',
            }}>
              <span style={{
                fontFamily: "'Caveat', 'Patrick Hand', cursive, sans-serif",
                fontSize: 22,
                color: '#CBD5E1',
                lineHeight: 1.1,
                transform: 'rotate(-6deg)',
                textShadow: '0 2px 8px rgba(0,0,0,0.6)',
              }}>
                Building<br />what&apos;s next.
              </span>
              <svg width="40" height="30" viewBox="0 0 50 40" fill="none" style={{ marginTop: 2, transform: 'rotate(-10deg)' }}>
                <path
                  d="M40 5 C30 20, 20 25, 10 32"
                  stroke="#94A3B8"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray="3 3"
                />
                <polyline points="15,26 8,33 16,35" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>

            {/* Laptop Image Mockup */}
            <div style={{
              position: 'relative',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <Image
                src={heroImgSrc}
                alt="Lokesh Sain — Software Engineer modern development environment"
                width={800}
                height={500}
                priority
                fetchPriority="high"
                sizes="(max-width: 480px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 50vw, 500px"
                onError={() => {
                  setImgError(true);
                }}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  transform: 'scale(1.02)',
                }}
              />
            </div>

            {/* Bottom-Right Floating Glass Badge */}
            <div style={{
              position: 'absolute',
              bottom: '18px',
              right: '18px',
              zIndex: 10,
              background: 'rgba(10, 14, 22, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 12,
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={13} color="#38BDF8" fill="#38BDF8" />
                <span style={{ fontSize: 12, fontWeight: 500, color: '#E2E8F0' }}>Clean Code</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={13} color="#38BDF8" fill="#38BDF8" />
                <span style={{ fontSize: 12, fontWeight: 500, color: '#E2E8F0' }}>Scalable Products</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={13} color="#38BDF8" fill="#38BDF8" />
                <span style={{ fontSize: 12, fontWeight: 500, color: '#E2E8F0' }}>Better Experiences</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
