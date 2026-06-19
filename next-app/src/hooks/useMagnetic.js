import { useEffect, useRef } from 'react'

export default function useMagnetic(strength = 0.3) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Respect reduced motion & mobile
    if (window.innerWidth < 768) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return

    let ticking = false

    const handleMouseMove = (e) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = el.getBoundingClientRect()
          const cx = rect.left + rect.width / 2
          const cy = rect.top + rect.height / 2
          const ox = e.clientX - cx
          const oy = e.clientY - cy

          el.style.transform = `translate3d(${ox * strength}px, ${oy * strength}px, 0)`
          el.style.transition = 'transform 0.1s ease-out'
          ticking = false
        })
        ticking = true
      }
    }

    const handleMouseLeave = () => {
      el.style.transform = 'translate3d(0, 0, 0)'
      el.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
    }

    el.addEventListener('mousemove', handleMouseMove, { passive: true })
    el.addEventListener('mouseleave', handleMouseLeave, { passive: true })

    return () => {
      el.removeEventListener('mousemove', handleMouseMove)
      el.removeEventListener('mouseleave', handleMouseLeave)
      if (el) {
        el.style.transform = ''
        el.style.transition = ''
      }
    }
  }, [strength])

  return ref
}
