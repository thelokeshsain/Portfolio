/**
 * InstallPWA — Banner + Button component (restyled)
 * All PWA logic preserved: dismissed state, install trigger.
 */
import { useState } from 'react'
import { Download, X, Smartphone } from 'lucide-react'

export function InstallBanner({ isInstallable, onInstall }) {
  const [dismissed, setDismissed] = useState(false)

  if (!isInstallable || dismissed) return null

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      zIndex: 500, width: 'calc(100% - 40px)', maxWidth: 440,
      border: '1px solid var(--border-accent)',
      borderRadius: 'var(--radius-lg)',
      background: 'var(--bg-secondary)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      boxShadow: 'var(--shadow-xl), var(--shadow-glow)',
      padding: '16px 20px',
      display: 'flex', alignItems: 'center', gap: 14,
      animation: 'slideUp .3s var(--ease-out-expo)',
    }}>
      <style>{`@keyframes slideUp{from{transform:translateX(-50%) translateY(60px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}`}</style>

      <div style={{
        width: 40, height: 40, borderRadius: 'var(--radius-md)',
        background: 'var(--gradient-accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Smartphone size={18} color="#fff" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          Install App
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
          Add to home screen for quick access
        </div>
      </div>

      <button
        onClick={onInstall}
        className="btn btn-primary btn-sm"
        style={{ flexShrink: 0 }}
      >
        <Download size={13} /> Install
      </button>

      <button
        onClick={() => setDismissed(true)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', padding: 4, flexShrink: 0,
          transition: 'color 0.2s',
        }}
        aria-label="Dismiss install prompt"
      >
        <X size={16} />
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
      aria-label="Install App"
    >
      <Download size={15} />
    </button>
  )
}
