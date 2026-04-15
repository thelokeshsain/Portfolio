import { Toaster } from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import ScrollProgress from '../components/ui/ScrollProgress'
import Hero from '../components/sections/Hero'
import About from '../components/sections/About'
import Experience from '../components/sections/Experience'
import Projects from '../components/sections/Projects'
import Skills from '../components/sections/Skills'
import Contact from '../components/sections/Contact'
import Loader from '../components/ui/Loader'
import { InstallBanner } from '../components/ui/InstallPWA'
import usePWA from '../hooks/usePWA'
import { useData } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'

export default function Portfolio() {
  const { data, loading } = useData()
  const { dark } = useTheme()
  const { isInstallable, triggerInstall } = usePWA()
  const s = data.sections || {}

  if (loading) return <Loader />

  const toastStyle = {
    background:  dark ? '#1e1e1e' : '#fff',
    color:        dark ? '#e8e8e8' : '#000',
    border:       '2px solid var(--ink)',
    borderRadius: 'var(--r)',
    fontFamily:   'var(--font)',
    fontWeight:   600,
    boxShadow:    'var(--sh)',
  }

  return (
    <div>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: toastStyle }} />
      <ScrollProgress />
      <Navbar isInstallable={isInstallable} onInstall={triggerInstall} />

      <main style={{ paddingTop: 56 }}>
        {s.hero       !== false && <Hero />}
        {s.about      !== false && <About />}
        {s.experience !== false && <Experience />}
        {s.projects   !== false && <Projects />}
        {s.skills     !== false && <Skills />}
        {s.contact    !== false && <Contact />}
      </main>

      {/* PWA install banner — appears at bottom when installable */}
      <InstallBanner isInstallable={isInstallable} onInstall={triggerInstall} />

      <footer style={{
        padding: 'clamp(20px,3vw,28px) clamp(16px,5vw,60px)',
        borderTop: '2px solid var(--ink)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12, background: 'var(--cream)',
      }}>
        <div style={{ fontWeight: 900, fontSize: 'clamp(15px,2vw,18px)', letterSpacing: '-0.04em', color: 'var(--ink)' }}>
          Lokesh<mark style={{ background: 'var(--yellow)', padding: '0 5px 1px', border: '2px solid var(--ink)', borderRadius: 4, marginLeft: 2, color: '#000' }}>Sain</mark>
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
          © {new Date().getFullYear()} · React + Vite + Tailwind v4
        </div>
        <div style={{ fontSize: 12, color: 'var(--subtle)', fontFamily: 'var(--mono)', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span>Software Engineer · Jaipur</span>
        </div>
      </footer>
    </div>
  )
}
