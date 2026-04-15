/**
 * AdminLogin — v15
 *
 * Features added:
 *  - Eye toggle on password field (show/hide)
 *  - Forgot Password flow:
 *      1. Enter email → POST /api/admin/forgot-password → OTP sent
 *      2. Enter 6-digit OTP + new password → POST /api/admin/reset-password
 *      3. Success → back to login with toast
 *
 * Steps managed by a single `step` state string:
 *   'login'       → normal email + password form
 *   '2fa'         → 2FA code entry (existing)
 *   'forgot'      → enter email to request OTP
 *   'reset'       → enter OTP + new password
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import { Lock, Mail, Shield, ArrowLeft, Smartphone, Eye, EyeOff, KeyRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { apiClient } from '../context/AuthContext'

/* ── small reusable password field with eye toggle ── */
function PasswordField({ value, onChange, placeholder = 'Enter password', autoComplete = 'current-password', id, label }) {
  const [show, setShow] = useState(false)
  return (
    <div>
      {label && (
        <label htmlFor={id} style={{ display: 'block', fontSize: 11, fontWeight: 700, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 8 }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} />
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className="field"
          placeholder={placeholder}
          style={{ paddingLeft: 40, paddingRight: 44 }}
          autoComplete={autoComplete}
          required
          maxLength={128}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          tabIndex={-1}
          style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--muted)', display: 'flex', alignItems: 'center', padding: 4,
          }}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  )
}

/* ── password strength indicator ── */
function StrengthBar({ password }) {
  const checks = [
    password.length >= 12,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const colors = ['#ff4444', '#ff8c42', '#ffd700', '#00aa44', '#00cc66']
  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong']
  if (!password) return null
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < score ? colors[score - 1] : 'var(--cream)', transition: 'background .2s' }} />
        ))}
      </div>
      <div style={{ fontSize: 11, color: score > 0 ? colors[score - 1] : 'var(--muted)', fontFamily: 'var(--mono)', fontWeight: 700 }}>
        {labels[score - 1] || ''}
        {score < 5 && password && <span style={{ color: 'var(--muted)', fontWeight: 400 }}> — needs: {[
          !checks[0] && '12+ chars',
          !checks[1] && 'uppercase',
          !checks[2] && 'lowercase',
          !checks[3] && 'number',
          !checks[4] && 'symbol',
        ].filter(Boolean).join(', ')}</span>}
      </div>
    </div>
  )
}

export default function AdminLogin() {
  const { login, verifyTwoFactor, setSession } = useAuth()
  const { dark } = useTheme()
  const nav = useNavigate()

  const [step, setStep] = useState('login') // login | 2fa | forgot | reset
  const [twoFAMethod, setMethod] = useState('email')
  const [loading, setLoading] = useState(false)

  // Login fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // 2FA
  const [tempToken, setTempToken] = useState('')
  const [code2fa, setCode2fa] = useState('')

  // Forgot / reset
  const [forgotEmail, setForgotEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirm] = useState('')

  const toastStyle = {
    background: dark ? '#1e1e1e' : '#fff',
    color: dark ? '#e8e8e8' : '#000',
    border: '2px solid var(--ink)',
    borderRadius: 'var(--r)',
    fontFamily: 'var(--font)',
    fontWeight: 600,
    boxShadow: 'var(--sh)',
  }

  /* ── step: login ── */
  const handleLogin = async e => {
    e.preventDefault()
    if (!email.trim() || !password) return toast.error('Enter your email and password')
    setLoading(true)
    try {
      const res = await login(email.trim(), password)
      if (res.requiresTwoFactor) {
        setTempToken(res.tempToken)
        setMethod(res.method || 'email')
        setStep('2fa')
        toast.success(res.method === 'totp' ? 'Enter the code from your authenticator app' : 'Verification code sent to your email')
      } else {
        setSession(res.token, res.admin, res.csrfToken)
        toast.success('Welcome back!')
        nav('/admin')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed — check your credentials')
    } finally { setLoading(false) }
  }

  /* ── step: 2fa ── */
  const handle2fa = async e => {
    e.preventDefault()
    const c = code2fa.replace(/\s/g, '')
    if (!c || c.length < 6) return toast.error('Enter the 6-digit code')
    setLoading(true)
    try {
      await verifyTwoFactor(tempToken, c)
      toast.success('Authenticated!')
      nav('/admin')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code — please try again')
    } finally { setLoading(false) }
  }

  /* ── step: forgot — request OTP ── */
  const handleForgot = async e => {
    e.preventDefault()
    if (!forgotEmail.trim()) return toast.error('Enter your admin email')
    setLoading(true)
    try {
      const res = await apiClient.post('/admin/forgot-password', { email: forgotEmail.trim() })
      // Even if email not found, server returns same message (no enumeration)
      if (res.data.token) {
        setResetToken(res.data.token)
        setStep('reset')
        toast.success('Check your email for the 6-digit reset code')
      } else {
        // email not found — but we still show success to prevent enumeration
        toast.success(res.data.message)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed — please try again')
    } finally { setLoading(false) }
  }

  /* ── step: reset — verify OTP + set new password ── */
  const handleReset = async e => {
    e.preventDefault()
    const c = resetCode.replace(/\s/g, '')
    if (!c || c.length < 6) return toast.error('Enter the 6-digit code from your email')
    if (!newPassword) return toast.error('Enter your new password')
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match')
    if (newPassword.length < 12) return toast.error('Password must be at least 12 characters')
    setLoading(true)
    try {
      const res = await apiClient.post('/admin/reset-password', {
        token: resetToken,
        code: c,
        newPassword,
      })
      toast.success(res.data.message || 'Password reset! Please log in.')
      // Clear sensitive state
      setResetCode('')
      setNewPassword('')
      setConfirm('')
      setResetToken('')
      setForgotEmail('')
      setStep('login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed — please try again')
    } finally { setLoading(false) }
  }

  const tabLabels = {
    login: 'auth/login.sh',
    '2fa': twoFAMethod === 'totp' ? 'auth/totp-verify.sh' : 'auth/email-verify.sh',
    forgot: 'auth/forgot-password.sh',
    reset: 'auth/reset-password.sh',
  }

  const subtitles = {
    login: 'Sign in to manage your portfolio',
    '2fa': twoFAMethod === 'totp' ? 'Enter the code from your authenticator app' : 'Enter the verification code sent to your email',
    forgot: 'Enter your admin email to receive a reset code',
    reset: 'Enter the code from your email and your new password',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Toaster position="top-center" toastOptions={{ style: toastStyle }} />

      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontWeight: 900, fontSize: 28, letterSpacing: '-0.05em', color: 'var(--ink)', marginBottom: 8 }}>
            Lokesh<mark style={{ background: 'var(--yellow)', padding: '0 6px 2px', border: '2px solid var(--ink)', borderRadius: 5, marginLeft: 3, color: '#000', fontSize: 22 }}>Admin</mark>
          </div>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>{subtitles[step]}</p>
        </div>

        <div className="mac">
          <div className="mac-bar">
            <div className="mac-dot" style={{ background: '#ff5f57' }} />
            <div className="mac-dot" style={{ background: '#febc2e' }} />
            <div className="mac-dot" style={{ background: '#28c840' }} />
            <span className="mac-bar-title">{tabLabels[step]}</span>
          </div>

          <div style={{ padding: 'clamp(22px,4vw,36px)' }}>

            {/* ── LOGIN ── */}
            {step === 'login' && (
              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: 18 }}>
                  <label htmlFor="login-email" style={{ display: 'block', fontSize: 11, fontWeight: 700, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 8 }}>
                    Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} />
                    <input
                      id="login-email" type="email" value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="field" placeholder="admin@example.com"
                      style={{ paddingLeft: 40 }} autoComplete="username"
                      required maxLength={254}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <PasswordField
                    id="login-password"
                    label="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                </div>

                {/* Forgot password link */}
                <div style={{ textAlign: 'right', marginBottom: 24 }}>
                  <button
                    type="button"
                    onClick={() => { setForgotEmail(email); setStep('forgot') }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)', textDecoration: 'underline', padding: 0 }}
                  >
                    Forgot password?
                  </button>
                </div>

                <button type="submit" disabled={loading} className="btn btn-yellow" style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
                  <Shield size={15} />{loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
            )}

            {/* ── 2FA ── */}
            {step === '2fa' && (
              <form onSubmit={handle2fa}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  {twoFAMethod === 'totp'
                    ? <Smartphone size={40} style={{ color: 'var(--ink)', margin: '0 auto' }} />
                    : <Shield size={40} style={{ color: 'var(--ink)', margin: '0 auto' }} />}
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label htmlFor="code-2fa" style={{ display: 'block', fontSize: 11, fontWeight: 700, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 8 }}>
                    Verification Code
                  </label>
                  <input
                    id="code-2fa" type="text" inputMode="numeric" maxLength={6}
                    value={code2fa} onChange={e => setCode2fa(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="field" placeholder="000000"
                    style={{ textAlign: 'center', fontSize: 28, fontWeight: 900, fontFamily: 'var(--mono)', letterSpacing: '0.4em' }}
                    autoComplete="one-time-code" required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn btn-yellow" style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
                  <Shield size={15} />{loading ? 'Verifying…' : 'Verify'}
                </button>
                <button type="button" onClick={() => setStep('login')} className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
                  <ArrowLeft size={13} /> Back to Login
                </button>
              </form>
            )}

            {/* ── FORGOT — enter email ── */}
            {step === 'forgot' && (
              <form onSubmit={handleForgot}>
                <div style={{ marginBottom: 24 }}>
                  <label htmlFor="forgot-email" style={{ display: 'block', fontSize: 11, fontWeight: 700, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 8 }}>
                    Admin Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} />
                    <input
                      id="forgot-email" type="email" value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      className="field" placeholder="admin@example.com"
                      style={{ paddingLeft: 40 }} autoComplete="email"
                      required maxLength={254}
                    />
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, lineHeight: 1.6 }}>
                    A 6-digit reset code will be sent to this email if it matches your admin account.
                  </p>
                </div>
                <button type="submit" disabled={loading} className="btn btn-yellow" style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
                  <KeyRound size={15} />{loading ? 'Sending…' : 'Send Reset Code'}
                </button>
                <button type="button" onClick={() => setStep('login')} className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
                  <ArrowLeft size={13} /> Back to Login
                </button>
              </form>
            )}

            {/* ── RESET — OTP + new password ── */}
            {step === 'reset' && (
              <form onSubmit={handleReset}>
                <div style={{ marginBottom: 18 }}>
                  <label htmlFor="reset-code" style={{ display: 'block', fontSize: 11, fontWeight: 700, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 8 }}>
                    Reset Code
                  </label>
                  <input
                    id="reset-code" type="text" inputMode="numeric" maxLength={6}
                    value={resetCode} onChange={e => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="field" placeholder="000000"
                    style={{ textAlign: 'center', fontSize: 28, fontWeight: 900, fontFamily: 'var(--mono)', letterSpacing: '0.4em' }}
                    autoComplete="one-time-code" required
                  />
                </div>

                <div style={{ marginBottom: 8 }}>
                  <PasswordField
                    id="new-password"
                    label="New Password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min 12 chars, mixed case, number, symbol"
                    autoComplete="new-password"
                  />
                  <StrengthBar password={newPassword} />
                </div>

                <div style={{ marginBottom: 24, marginTop: 14 }}>
                  <PasswordField
                    id="confirm-password"
                    label="Confirm Password"
                    value={confirmPassword}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p style={{ fontSize: 12, color: '#cc0000', marginTop: 6, fontFamily: 'var(--mono)' }}>Passwords do not match</p>
                  )}
                  {confirmPassword && newPassword === confirmPassword && (
                    <p style={{ fontSize: 12, color: 'var(--green)', marginTop: 6, fontFamily: 'var(--mono)' }}>✓ Passwords match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || newPassword !== confirmPassword || newPassword.length < 12}
                  className="btn btn-yellow"
                  style={{ width: '100%', justifyContent: 'center', opacity: (loading || newPassword !== confirmPassword || newPassword.length < 12) ? 0.6 : 1 }}
                >
                  <KeyRound size={15} />{loading ? 'Resetting…' : 'Reset Password'}
                </button>

                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button type="button" onClick={() => setStep('forgot')} className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                    Resend Code
                  </button>
                  <button type="button" onClick={() => setStep('login')} className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                    <ArrowLeft size={13} /> Login
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}