import { useEffect, useRef } from 'react'

export default function useCardGlow() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Respect reduced motion & mobile
    if (window.innerWidth < 768) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return

    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      el.style.setProperty('--mouse-x', `${x}px`)
      el.style.setProperty('--mouse-y', `${y}px`)
    }

    el.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      el.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return ref
}
