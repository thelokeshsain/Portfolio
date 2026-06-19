/**
 * ConfirmDialog — Issue #18 Fix
 * Replaces blocking window.confirm() with accessible, styled modal dialog.
 */
import { useState, useCallback } from 'react'

export function useConfirm() {
  const [state, setState] = useState({ open: false, message: '', resolve: null })

  const confirm = useCallback((message) =>
    new Promise(resolve => setState({ open: true, message, resolve }))
  , [])

  const handleClose = useCallback((result) => {
    setState(s => { s.resolve?.(result); return { open: false, message: '', resolve: null } })
  }, [])

  const Dialog = state.open ? (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
      onClick={() => handleClose(false)}
    >
      <div
        style={{ background: 'var(--surface)', border: '2px solid var(--ink)', borderRadius: 'var(--rl)', padding: 'clamp(24px,4vw,36px)', maxWidth: 420, width: '100%', boxShadow: 'var(--sh-xl)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 12, color: 'var(--ink)' }} id="confirm-title">
          Are you sure?
        </div>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 24 }}>
          {state.message}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="btn btn-outline btn-sm" onClick={() => handleClose(false)}>
            Cancel
          </button>
          <button className="btn btn-solid btn-sm" onClick={() => handleClose(true)}
            style={{ background: '#cc0000', borderColor: '#cc0000' }}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  ) : null

  return { confirm, Dialog }
}
