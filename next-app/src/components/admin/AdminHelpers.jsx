import React from 'react'
import { Plus, Trash2 } from 'lucide-react'

export const Card = ({ children, style, className = "" }) => (
  <div
    className={className}
    style={{
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: 14,
      background: '#0B0F17',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
      padding: 'clamp(18px, 3vw, 24px)',
      color: '#F0F2F5',
      ...style,
    }}
  >
    {children}
  </div>
)

export const FL = ({ children, htmlFor }) => (
  <label
    htmlFor={htmlFor}
    style={{
      display: 'block',
      fontSize: 11,
      fontWeight: 600,
      fontFamily: 'var(--font-mono, monospace)',
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      color: '#8B93A7',
      marginBottom: 7,
    }}
  >
    {children}
  </label>
)

export const AddBtn = ({ onClick, label }) => (
  <button
    type="button"
    onClick={onClick}
    className="btn btn-primary btn-sm"
    style={{ marginTop: 14 }}
  >
    <Plus size={14} /> {label}
  </button>
)

export const DelBtn = ({ onClick, title = "Delete" }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    aria-label={title}
    style={{
      background: 'rgba(239, 68, 68, 0.08)',
      border: '1px solid rgba(239, 68, 68, 0.25)',
      borderRadius: 8,
      padding: '6px 10px',
      cursor: 'pointer',
      color: '#EF4444',
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
      transition: 'all 0.2s',
    }}
  >
    <Trash2 size={14} />
  </button>
)

export const CharCount = ({ val = 0, max }) => (
  <span
    style={{
      float: 'right',
      fontWeight: 500,
      fontSize: 10,
      letterSpacing: 0,
      fontFamily: 'var(--font-mono, monospace)',
      color: (typeof val === 'number' ? val : (val?.length || 0)) >= max * 0.9 ? '#EF4444' : '#8B93A7',
    }}
  >
    {typeof val === 'number' ? val : (val?.length || 0)}/{max}
  </span>
)
