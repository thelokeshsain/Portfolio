/**
 * useMouseParallax — Mouse-position-driven parallax for decorative elements
 *
 * Returns { ref, style } — attach ref to the container, apply style
 * to the moving element. The element shifts subtly based on mouse position
 * relative to the container.
 *
 * Performance: Uses rAF, passive mousemove. Disabled on mobile and
 * prefers-reduced-motion. Does NOT cause React re-renders (uses refs).
 */
import { useEffect, useRef } from 'react'

export default function useMouseParallax(intensity = 0.02) {
  const containerRef = useRef(null)
  const posRef = useRef({ x: 0, y: 0 })
  const targetRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Respect reduced motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return

    // Disable on touch devices
    if ('ontouchstart' in window) return

    const animate = () => {
      // Lerp towards target
      posRef.current.x += (targetRef.current.x - posRef.current.x) * 0.08
      posRef.current.y += (targetRef.current.y - posRef.current.y) * 0.08

      // Apply to all children with data-parallax-mouse attribute
      const layers = el.querySelectorAll('[data-parallax-mouse]')
      layers.forEach(layer => {
        const speed = parseFloat(layer.dataset.parallaxMouse) || 1
        const x = posRef.current.x * speed * intensity * 100
        const y = posRef.current.y * speed * intensity * 100
        layer.style.transform = `translate3d(${x}px, ${y}px, 0)`
      })

      rafRef.current = requestAnimationFrame(animate)
    }

    const onMouseMove = (e) => {
      const rect = el.getBoundingClientRect()
      // Normalize to -1 to 1 range
      targetRef.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      targetRef.current.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    }

    const onMouseLeave = () => {
      targetRef.current.x = 0
      targetRef.current.y = 0
    }

    el.addEventListener('mousemove', onMouseMove, { passive: true })
    el.addEventListener('mouseleave', onMouseLeave, { passive: true })
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      el.removeEventListener('mousemove', onMouseMove)
      el.removeEventListener('mouseleave', onMouseLeave)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [intensity])

  return containerRef
}
