import React from 'react'
import useCardGlow from '../../hooks/useCardGlow'

export default function GlowCard({ children, style = {}, className = '', ...props }) {
  const ref = useCardGlow()
  return (
    <div
      ref={ref}
      className={`glass-card ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  )
}
