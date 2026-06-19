import React from 'react'
import { Plus, Trash2 } from 'lucide-react'

export const Card = ({ children, style }) => (
  <div
    style={{
      border: '2px solid var(--ink)',
      borderRadius: 14,
      background: 'var(--surface)',
      boxShadow: 'var(--sh)',
      padding: 'clamp(18px,3vw,26px)',
      ...style,
    }}
  >
    {children}
  </div>
)

export const FL = ({ children }) => (
  <label
    style={{
      display: 'block',
      fontSize: 11,
      fontWeight: 700,
      fontFamily: 'var(--mono)',
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      color: 'var(--muted)',
      marginBottom: 7,
    }}
  >
    {children}
  </label>
)

export const AddBtn = ({ onClick, label }) => (
  <button
    onClick={onClick}
    className="btn btn-yellow btn-sm"
    style={{ marginTop: 14 }}
  >
    <Plus size={14} /> {label}
  </button>
)

export const DelBtn = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: 'none',
      border: '2px solid var(--ink)',
      borderRadius: 8,
      padding: '6px 10px',
      cursor: 'pointer',
      color: '#cc0000',
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
    }}
  >
    <Trash2 size={14} />
  </button>
)

export const CharCount = ({ val, max }) => (
  <span
    style={{
      float: 'right',
      fontWeight: 400,
      fontSize: 10,
      letterSpacing: 0,
      color: val >= max * 0.9 ? '#cc0000' : 'var(--muted)',
    }}
  >
    {val}/{max}
  </span>
)
