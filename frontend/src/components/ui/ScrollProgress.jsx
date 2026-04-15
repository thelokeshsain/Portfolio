import { useEffect, useState } from 'react'
export default function ScrollProgress() {
  const [w, setW] = useState(0)
  useEffect(() => {
    const fn = () => {
      const d = document.documentElement
      setW(Math.min(100, (d.scrollTop / (d.scrollHeight - d.clientHeight)) * 100))
    }
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return <div id="sp" style={{ width: `${w}%` }} />
}
