import { useEffect, useRef } from 'react'
export default function useScrollFade(threshold = 0.1) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('in'); obs.unobserve(el) }
    }, { threshold })
    obs.observe(el); return () => obs.disconnect()
  }, [threshold])
  return ref
}
