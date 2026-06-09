/**
 * ScrollProgress — Gradient progress bar
 * Uses requestAnimationFrame + direct DOM manipulation instead of React state
 * to avoid unnecessary re-renders on every scroll tick.
 */
import { useEffect, useRef } from 'react'

export default function ScrollProgress() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let ticking = false

    const update = () => {
      const d = document.documentElement
      const pct = Math.min(100, (d.scrollTop / (d.scrollHeight - d.clientHeight)) * 100)
      el.style.width = `${pct}%`
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return <div id="sp" ref={ref} />
}
