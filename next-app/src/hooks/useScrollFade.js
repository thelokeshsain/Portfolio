/**
 * useScrollFade — IntersectionObserver-based reveal animations
 *
 * Enhanced to support multiple animation variants:
 * - 'fade-up' (default)
 * - 'fade-down'
 * - 'fade-left'
 * - 'fade-right'
 * - 'scale-up'
 * - 'blur-in'
 *
 * Usage: const ref = useScrollFade('fade-left', 0.15)
 *        <div ref={ref} className="reveal">...</div>
 *
 * The 'reveal' class and its variants are defined in index.css.
 * When intersecting, 'in' class is added → triggers the CSS transition.
 */
import { useEffect, useRef } from 'react'

export default function useScrollFade(variant = 'fade-up', threshold = 0.1) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Apply variant class if not already present
    if (!el.classList.contains(variant)) {
      el.classList.add(variant)
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in')
          obs.unobserve(el)
        }
      },
      { threshold }
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [variant, threshold])

  return ref
}

/**
 * useStaggerReveal — Reveals child elements with staggered delays
 *
 * Attaches IntersectionObserver to the container. When visible,
 * adds 'in' class to each child matching the selector with staggered
 * CSS transition-delay.
 */
export function useStaggerReveal(selector = '.stagger-item', staggerMs = 100, threshold = 0.1) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const children = el.querySelectorAll(selector)
          children.forEach((child, i) => {
            child.style.transitionDelay = `${i * staggerMs}ms`
            child.classList.add('in')
          })
          obs.unobserve(el)
        }
      },
      { threshold }
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [selector, staggerMs, threshold])

  return ref
}
