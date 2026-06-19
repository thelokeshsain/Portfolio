/**
 * useParallax — Scroll-driven parallax movement
 *
 * Returns a ref to attach to any element. The element will translate
 * vertically based on scroll position at the given speed factor.
 *
 * - speed > 0 → moves UP as page scrolls down (foreground feel)
 * - speed < 0 → moves DOWN as page scrolls down (background feel)
 * - speed = 0 → no movement
 *
 * Performance: Uses rAF-throttled scroll listener, translate3d for GPU,
 * will-change hint. Disables on mobile (<768px) and prefers-reduced-motion.
 */
import { useEffect, useRef } from 'react'

export default function useParallax(speed = 0.1, direction = 'y') {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Respect reduced motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return

    // Disable on mobile
    if (window.innerWidth < 768) return

    let ticking = false

    const update = () => {
      const rect = el.getBoundingClientRect()
      const windowH = window.innerHeight
      // How far the element's center is from viewport center, normalized
      const center = rect.top + rect.height / 2
      const offset = (center - windowH / 2) * speed

      if (direction === 'y') {
        el.style.transform = `translate3d(0, ${offset}px, 0)`
      } else {
        el.style.transform = `translate3d(${offset}px, 0, 0)`
      }
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update)
        ticking = true
      }
    }

    // Initial position
    update()

    window.addEventListener('scroll', onScroll, { passive: true })

    // Cleanup
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (el) el.style.transform = ''
    }
  }, [speed, direction])

  return ref
}
