// SECURITY: AuthContext — Centralized session management and persistent authentication.
// Implements secure axios interceptors for 401 handling and idle session timeouts.
import { createContext, useContext, useState, useEffect, useRef } from 'react'
import axios from 'axios'

const Ctx = createContext()
const API = import.meta.env.VITE_API_URL || '/api'

// Scoped axios instance — used for all admin calls
const apiClient = axios.create({ 
  baseURL: API,
  withCredentials: true, // SECURITY: Required to send/receive HTTP-only refresh cookies
  xsrfCookieName: 'csrfToken',
  xsrfHeaderName: 'X-CSRF-TOKEN',
})

function setAuthHeaders(token, csrfToken) {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete apiClient.defaults.headers.common['Authorization']
  }
  
  if (csrfToken) {
    apiClient.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken
  } else {
    delete apiClient.defaults.headers.common['X-CSRF-TOKEN']
  }
}

let refreshPromise = null

const AUTH_REFRESH_SKIP_PATHS = [
  '/admin/login',
  '/admin/verify-2fa',
  '/admin/refresh-token',
  '/admin/forgot-password',
  '/admin/reset-password',
]

function shouldSkipAuthRefresh(config = {}) {
  if (config.skipAuthRefresh) return true
  const url = config.url || ''
  return AUTH_REFRESH_SKIP_PATHS.some(path => url.includes(path))
}

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = apiClient
      .post('/admin/refresh-token', null, { skipAuthRefresh: true })
      .then(({ data }) => {
        setAuthHeaders(data.token, data.csrfToken)
        return data.token
      })
      .catch(err => {
        setAuthHeaders(null, null)
        throw err
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

// SECURITY: Silent Refresh Interceptor
// Detects 401 (Expired Access Token) and attempts to rotate using the HTTP-only Refresh Cookie.
apiClient.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config || {}

    // Only protected-resource 401s should attempt refresh. Auth endpoints can fail normally.
    if (err.response?.status === 401 && !originalRequest._retry && !shouldSkipAuthRefresh(originalRequest)) {
      originalRequest._retry = true

      try {
        const newToken = await refreshAccessToken()
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch (refreshErr) {
        // Global logout on refresh failure
        localStorage.removeItem('adminLoginTime')
        window.dispatchEvent(new Event('admin-logout'))
        return Promise.reject(refreshErr)
      }
    }
    return Promise.reject(err)
  }
)

const IDLE_MS    = 30 * 60 * 1000  // 30-minute idle logout
const MAX_AGE_MS = 24 * 60 * 60 * 1000  // 24h max session age

export function AuthProvider({ children }) {
  const [admin, setAdmin]     = useState(null)
  const [loading, setLoading] = useState(true)
  const idleTimer             = useRef(null)

  const doLogout = async () => {
    clearTimeout(idleTimer.current)
    try { await apiClient.post('/admin/logout', null, { skipAuthRefresh: true }) } catch { /* continue */ }
    localStorage.removeItem('adminLoginTime')
    setAuthHeaders(null, null)
    setAdmin(null)
  }

  // Handle global logout signal from interceptor
  useEffect(() => {
    const handler = () => doLogout()
    window.addEventListener('admin-logout', handler)
    return () => window.removeEventListener('admin-logout', handler)
  }, [])

  const resetIdleTimer = () => {
    clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => doLogout(), IDLE_MS)
  }

  useEffect(() => {
    if (!admin) return
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    const handler = () => resetIdleTimer()
    events.forEach(e => window.addEventListener(e, handler, { passive: true }))
    resetIdleTimer()
    return () => {
      clearTimeout(idleTimer.current)
      events.forEach(e => window.removeEventListener(e, handler))
    }
  }, [admin]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const loginTime = parseInt(localStorage.getItem('adminLoginTime') || '0')

    //belt-and-suspenders session age check
    if (loginTime && (Date.now() - loginTime > MAX_AGE_MS)) {
      doLogout()
      setLoading(false)
      return
    }

    if (!loginTime) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function restoreSession() {
      try {
        const token = await refreshAccessToken()
        const r = await apiClient.get('/admin/me', {
          headers: { Authorization: `Bearer ${token}` },
          skipAuthRefresh: true,
        })
        if (!cancelled) setAdmin(r.data.admin)
      } catch {
        localStorage.removeItem('adminLoginTime')
        setAuthHeaders(null, null)
        if (!cancelled) setAdmin(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    restoreSession()
    return () => {
      cancelled = true
    }
  }, [])

  const login = async (email, password) => {
    const r = await apiClient.post('/admin/login', { email, password })
    return r.data
  }

  const verifyTwoFactor = async (token, code) => {
    const r = await apiClient.post('/admin/verify-2fa', { token, code })
    localStorage.setItem('adminLoginTime', Date.now().toString())
    setAuthHeaders(r.data.token, r.data.csrfToken)
    setAdmin(r.data.admin)
  }

  const setSession = (token, adminData, csrfToken) => {
    localStorage.setItem('adminLoginTime', Date.now().toString())
    setAuthHeaders(token, csrfToken)
    setAdmin(adminData)
  }

  return (
    <Ctx.Provider value={{ admin, loading, login, verifyTwoFactor, setSession, logout: doLogout, apiClient }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)
export { apiClient }
