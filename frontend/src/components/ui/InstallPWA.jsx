/**
 * InstallPWA — Banner + Button component
 * Shows a dismissible install banner when the browser fires beforeinstallprompt.
 * Also exports a standalone <InstallButton> for use in the Navbar.
 */
import { useState } from 'react'
import { Download, X, Smartphone } from 'lucide-react'

export function InstallBanner({ isInstallable, onInstall }) {
  const [dismissed, setDismissed] = useState(false)

  if (!isInstallable || dismissed) return null

  return (
    <div style={{
      position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
      zIndex: 500, width: 'calc(100% - 32px)', maxWidth: 480,
      border: '2px solid var(--ink)', borderRadius: 'var(--rl)',
      background: 'var(--yellow)', boxShadow: 'var(--sh-xl)',
      padding: '14px 18px',
      display: 'flex', alignItems: 'center', gap: 14,
      animation: 'slideUp .3s ease',
    }}>
      <style>{`@keyframes slideUp{from{transform:translateX(-50%) translateY(80px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}`}</style>

      <div style={{ width: 38, height: 38, borderRadius: 10, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Smartphone size={18} color="#ffde2d" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: '#000', letterSpacing: '-0.02em' }}>
          Install App
        </div>
        <div style={{ fontSize: 12, color: '#333', fontFamily: 'var(--mono)', marginTop: 1 }}>
          Add to home screen for quick access
        </div>
      </div>

      <button
        onClick={onInstall}
        style={{
          background: '#000', color: '#ffde2d', border: '2px solid #000',
          borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 700,
          cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
          boxShadow: '2px 2px 0 rgba(0,0,0,0.3)', fontFamily: 'var(--font)',
        }}
      >
        <Download size={13} /> Install
      </button>

      <button
        onClick={() => setDismissed(true)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#000', padding: 4, flexShrink: 0 }}
        aria-label="Dismiss install prompt"
      >
        <X size={18} />
      </button>
    </div>
  )
}

export function InstallButton({ isInstallable, onInstall }) {
  if (!isInstallable) return null
  return (
    <button
      onClick={onInstall}
      className="icon-btn"
      title="Install App"
      style={{ fontSize: 15 }}
    >
      <Download size={15} />
    </button>
  )
}
