/**
 * ErrorBoundary — Production-hardened v2
 *
 * Root cause of blank screen: the component renders into the DOM before
 * React has mounted the CSS stylesheet, so CSS custom properties like
 * --paper, --ink, --rl resolve to empty strings → elements have zero
 * height, transparent backgrounds, and invisible text.
 *
 * Fix 1 — Self-contained inline styles: no dependency on CSS vars, Google
 *          Fonts, or any external stylesheet. Reads dark/light from the
 *          <html> class directly in the constructor so it works at any
 *          point in the render lifecycle.
 *
 * Fix 2 — "Try Again" performs a hard reload that bypasses and wipes
 *          the PWA service-worker cache before reloading. This prevents a
 *          stale cached bundle from serving the broken page again.
 *
 * Fix NH-02 — raw error.message suppressed in production.
 */
import { Component } from 'react'

/* ─── Hard-reload helper ─────────────────────────────────────────────────── */
async function hardReloadClearCache() {
  // 1. Unregister all service workers
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map(r => r.unregister()))
  }

  // 2. Delete every cache the SW may have created
  if ('caches' in window) {
    const keys = await caches.keys()
    await Promise.all(keys.map(k => caches.delete(k)))
  }

  // 3. Hard reload — bypasses the browser's HTTP cache too
  //    location.reload(true) is deprecated in some browsers,
  //    so we append a cache-bust query to force a fresh fetch.
  const url = new URL(window.location.href)
  url.searchParams.set('_cb', Date.now())
  window.location.replace(url.toString())
}

/* ─── Theme detection ────────────────────────────────────────────────────── */
function isDarkMode() {
  // Prefer the class set by ThemeContext; fall back to OS preference
  if (document.documentElement.classList.contains('dark')) return true
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return true
  return false
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError:  false,
      error:     null,
      dark:      isDarkMode(),
      clearing:  false,
    }
    this.handleClearAndReload = this.handleClearAndReload.bind(this)
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error.message)
      console.error(info.componentStack)
    } else {
      // TODO: replace with Sentry.captureException(error)
      console.error('[ErrorBoundary] caught:', error.message)
    }
  }

  async handleClearAndReload() {
    this.setState({ clearing: true })
    await hardReloadClearCache()
    // hardReloadClearCache() always navigates away, so this line
    // only runs if something unexpected prevented it
    this.setState({ clearing: false })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const { dark, clearing } = this.state

    // Self-contained colour tokens — NO CSS var() references
    const bg      = dark ? '#111111' : '#fffef7'
    const surface = dark ? '#1e1e1e' : '#ffffff'
    const ink     = dark ? '#f0f0f0' : '#000000'
    const muted   = dark ? '#b0b0b0' : '#555555'
    const shadow  = dark ? '6px 6px 0 rgba(255,255,255,0.25)' : '6px 6px 0 #000'
    const btnShadow = dark ? '4px 4px 0 rgba(255,255,255,0.2)' : '4px 4px 0 #000'

    // Fix NH-02: never expose raw error messages in production
    const detail = import.meta.env.DEV
      ? (this.state.error?.message || 'An unexpected error occurred.')
      : 'Something went wrong. This may be caused by a stale cached file.'

    return (
      /*
       * Using a plain <div> with hardcoded px values — not clamp(), not
       * CSS vars — so the fallback renders correctly in every environment
       * including before stylesheets have loaded.
       */
      <div style={{
        minHeight:      this.props.fullPage ? '100vh' : '320px',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '40px 24px',
        background:     bg,
        fontFamily:     "'Inter', system-ui, -apple-system, sans-serif",
        boxSizing:      'border-box',
      }}>
        {/* Logo strip — always visible even before fonts load */}
        <div style={{
          fontWeight:    900,
          fontSize:      20,
          letterSpacing: '-0.05em',
          color:         ink,
          marginBottom:  32,
        }}>
          Lokesh
          <span style={{
            background:   '#ffde2d',
            padding:      '0 6px 2px',
            border:       `2px solid ${ink}`,
            borderRadius: 5,
            marginLeft:   3,
            color:        '#000',
          }}>
            Sain
          </span>
        </div>

        {/* Error card */}
        <div style={{
          border:       `2px solid ${ink}`,
          borderRadius: 16,
          padding:      '36px 32px',
          background:   surface,
          boxShadow:    shadow,
          maxWidth:     480,
          width:        '100%',
          textAlign:    'center',
          boxSizing:    'border-box',
        }}>
          {/* Icon — inline SVG so no icon library dependency */}
          <svg
            width="48" height="48" viewBox="0 0 24 24"
            fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ marginBottom: 16 }}
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>

          <h2 style={{
            fontWeight:    900,
            fontSize:      22,
            letterSpacing: '-0.03em',
            color:         ink,
            marginBottom:  12,
            marginTop:     0,
          }}>
            Something went wrong
          </h2>

          <p style={{
            fontSize:     14,
            color:        muted,
            lineHeight:   1.75,
            marginBottom: 8,
            marginTop:    0,
          }}>
            {detail}
          </p>

          <p style={{
            fontSize:     13,
            color:        muted,
            lineHeight:   1.7,
            marginBottom: 28,
            marginTop:    0,
          }}>
            Clicking <strong style={{ color: ink }}>Clear Cache & Reload</strong> will wipe
            the service-worker cache and fetch a fresh copy of the app.
          </p>

          {/* Primary CTA — Clear cache + hard reload */}
          <button
            onClick={this.handleClearAndReload}
            disabled={clearing}
            style={{
              display:      'inline-flex',
              alignItems:   'center',
              gap:          8,
              background:   '#ffde2d',
              color:        '#000',
              border:       `2px solid ${ink}`,
              borderRadius: 12,
              padding:      '11px 22px',
              fontSize:     14,
              fontWeight:   700,
              cursor:       clearing ? 'wait' : 'pointer',
              boxShadow:    btnShadow,
              fontFamily:   'inherit',
              marginBottom: 12,
              opacity:      clearing ? 0.7 : 1,
              transition:   'transform .15s, box-shadow .15s',
              width:        '100%',
              justifyContent: 'center',
            }}
          >
            {/* Spinner shown while clearing */}
            {clearing ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ animation: 'eb-spin 0.8s linear infinite' }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 .49-3.45"/>
              </svg>
            )}
            {clearing ? 'Clearing cache…' : 'Clear Cache & Reload'}
          </button>

          {/* Secondary — simple reload without clearing cache */}
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
            style={{
              display:        'block',
              width:          '100%',
              background:     'transparent',
              color:          muted,
              border:         'none',
              padding:        '8px',
              fontSize:       13,
              fontWeight:     600,
              cursor:         'pointer',
              fontFamily:     'inherit',
              textDecoration: 'underline',
            }}
          >
            Or just reload the page
          </button>
        </div>

        {/* CSS for the spinner animation — inlined to avoid stylesheet dependency */}
        <style>{`@keyframes eb-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }
}
