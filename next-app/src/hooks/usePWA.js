/**
 * usePWA Hook — Service Worker registration + Install prompt
 * Handles: SW registration, beforeinstallprompt capture, install trigger
 */
import { useState, useEffect } from 'react'

export default function usePWA() {
  const [installPrompt, setInstallPrompt]   = useState(null)
  const [isInstallable, setIsInstallable]   = useState(false)
  const [isInstalled, setIsInstalled]       = useState(() => {
    return typeof window !== 'undefined' && (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    )
  })
  const [swRegistered, setSwRegistered]     = useState(false)

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(() => {
          setSwRegistered(true)
          // SW registered
        })
        .catch(() => {})
    }

    // Capture install prompt (Chrome/Edge/Samsung)
    const handlePrompt = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      setIsInstallable(true)
    }
    window.addEventListener('beforeinstallprompt', handlePrompt)

    // Detect successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setInstallPrompt(null)
    })

    return () => window.removeEventListener('beforeinstallprompt', handlePrompt)
  }, [])

  const triggerInstall = async () => {
    if (!installPrompt) return false
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstallable(false)
      setInstallPrompt(null)
    }
    return outcome === 'accepted'
  }

  return { isInstallable, isInstalled, swRegistered, triggerInstall }
}
