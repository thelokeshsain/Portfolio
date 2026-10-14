import { useState, useCallback, useEffect, useRef } from 'react'

export function useConfirm() {
  const [state, setState] = useState({
    open: false,
    title: 'Are you sure?',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    danger: true,
    resolve: null,
  })

  const confirmBtnRef = useRef(null)

  const confirm = useCallback((param) => {
    return new Promise((resolve) => {
      let title = 'Are you sure?'
      let message = ''
      let confirmText = 'Confirm'
      let cancelText = 'Cancel'
      let danger = true

      if (typeof param === 'string') {
        message = param
      } else if (param && typeof param === 'object') {
        if (typeof param.title === 'string' && param.title.trim()) {
          title = param.title.trim()
        }
        if (typeof param.message === 'string') {
          message = param.message
        } else if (param.message != null && typeof param.message !== 'object') {
          message = String(param.message)
        } else if (param.message && typeof param.message === 'object') {
          message = JSON.stringify(param.message)
        }
        if (typeof param.confirmText === 'string' && param.confirmText.trim()) {
          confirmText = param.confirmText.trim()
        }
        if (typeof param.cancelText === 'string' && param.cancelText.trim()) {
          cancelText = param.cancelText.trim()
        }
        if (typeof param.danger === 'boolean') {
          danger = param.danger
        }
      } else if (param != null) {
        message = String(param)
      }

      setState({
        open: true,
        title,
        message,
        confirmText,
        cancelText,
        danger,
        resolve,
      })
    })
  }, [])

  const handleClose = useCallback((result) => {
    setState((s) => {
      s.resolve?.(result)
      return {
        open: false,
        title: 'Are you sure?',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        danger: true,
        resolve: null,
      }
    })
  }, [])

  useEffect(() => {
    if (!state.open) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    const timer = setTimeout(() => {
      confirmBtnRef.current?.focus()
    }, 50)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      clearTimeout(timer)
    }
  }, [state.open, handleClose])

  const Dialog = state.open ? (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={() => handleClose(false)}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '2px solid var(--ink)',
          borderRadius: 'var(--rl)',
          padding: 'clamp(24px,4vw,36px)',
          maxWidth: 420,
          width: '100%',
          boxShadow: 'var(--sh-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: 17,
            marginBottom: 12,
            color: 'var(--ink)',
          }}
          id="confirm-title"
        >
          {state.title}
        </div>
        <p
          id="confirm-desc"
          style={{
            fontSize: 14,
            color: 'var(--muted)',
            lineHeight: 1.7,
            marginBottom: 24,
          }}
        >
          {state.message}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => handleClose(false)}
          >
            {state.cancelText}
          </button>
          <button
            type="button"
            ref={confirmBtnRef}
            className="btn btn-solid btn-sm"
            onClick={() => handleClose(true)}
            style={
              state.danger
                ? { background: '#cc0000', borderColor: '#cc0000', color: '#ffffff' }
                : undefined
            }
          >
            {state.confirmText}
          </button>
        </div>
      </div>
    </div>
  ) : null

  return { confirm, Dialog, ConfirmDialog: () => Dialog }
}
