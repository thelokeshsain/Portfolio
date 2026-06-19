import React from 'react'
import useMagnetic from '../../hooks/useMagnetic'

export default function MagneticElement({ children, strength = 0.25 }) {
  const ref = useMagnetic(strength)
  return React.cloneElement(children, { ref })
}
