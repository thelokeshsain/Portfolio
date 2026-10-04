"use client";
/**
 * AdminLogin — Midnight Blueprint Identity
 * Minimal, secure administration authentication card.
 * Strict design consistency with #05070A canvas, #0B0F17 card, #38BDF8 accent.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import { Lock, Mail, Shield, ArrowLeft, Smartphone, Eye, EyeOff, KeyRound } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { apiClient } from '@/context/AuthContext'

/* ── Reusable password field with eye toggle ── */
function PasswordField({ value, onChange, placeholder = 'Enter password', autoComplete = 'current-password', id, label }) {
  const [show, setShow] = useState(false)
  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          style={{
            display: 'block',
            fontSize: 11,
            fontWeight: 600,
            fontFamily: 'var(--font-mono, monospace)',
            textTransform: 'uppercase',
            letterSpacing: '.08em',
            color: '#8B93A7',
            marginBottom: 8,
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <Lock
          size={15}
          style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#505872',
            pointerEvents: 'none',
          }}
        />
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
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#8B93A7',
            display: 'flex',
            alignItems: 'center',
            padding: 4,
          }}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  )
}

/* ── Password strength indicator ── */
function StrengthBar({ password }) {
  const checks = [
    password.length >= 12,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const colors = ['#EF4444', '#F97316', '#FBBF24', '#34D399', '#10B981']
  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong']
  if (!password) return null
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: i < score ? colors[score - 1] : 'rgba(255, 255, 255, 0.08)',
              transition: 'background .2s',
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: 11, color: score > 0 ? colors[score - 1] : '#8B93A7', fontFamily: 'var(--font-mono, monospace)', fontWeight: 600 }}>
        {labels[score - 1] || ''}
        {score < 5 && password && (
          <span style={{ color: '#505872', fontWeight: 400 }}>
            {' '}— requires: {[
              !checks[0] && '12+ chars',
              !checks[1] && 'uppercase',
              !checks[2] && 'lowercase',
              !checks[3] && 'number',
              !checks[4] && 'symbol',
            ].filter(Boolean).join(', ')}
          </span>
        )}
      </div>
    </div>
  )
}

export default function AdminLogin() {
  const { login, verifyTwoFactor, setSession } = useAuth()
  const nav = useRouter()

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
  const [confirmPassword, setConfirmPassword] = useState('')

  const toastStyle = {
    background: '#0B0F17',
    color: '#F0F2F5',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
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
        toast.success('Welcome back')
        nav.push('/admin')
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
      toast.success('Authenticated')
      nav.push('/admin')
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
      if (res.data.token) {
        setResetToken(res.data.token)
        setStep('reset')
        toast.success('Check your email for the 6-digit reset code')
      } else {
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
      toast.success(res.data.message || 'Password reset. Please log in.')
      setResetCode('')
      setNewPassword('')
      setConfirmPassword('')
      setResetToken('')
      setForgotEmail('')
      setStep('login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed — please try again')
    } finally { setLoading(false) }
  }

  const titles = {
    login: 'Admin Sign In',
    '2fa': 'Two-Factor Verification',
    forgot: 'Password Recovery',
    reset: 'Set New Password',
  }

  const subtitles = {
    login: 'Authenticate to access portfolio system controls',
    '2fa': twoFAMethod === 'totp' ? 'Enter the security token from your authenticator' : 'Enter the 6-digit verification code sent to your email',
    forgot: 'Enter your admin email to receive a recovery code',
    reset: 'Enter the verification code and configure your new password',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#05070A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: 'var(--font-body)',
        color: '#F0F2F5',
      }}
    >
      <Toaster position="top-center" toastOptions={{ style: toastStyle }} />

      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: '#0F141D',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 18,
              color: '#38BDF8',
              fontFamily: 'var(--font-mono, monospace)',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.15)',
            }}
          >
            LS
          </div>
          <h1
            style={{
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: '-0.03em',
              color: '#F0F2F5',
              marginBottom: 6,
            }}
          >
            {titles[step]}
          </h1>
          <p style={{ fontSize: 13, color: '#8B93A7', lineHeight: 1.5, margin: 0 }}>
            {subtitles[step]}
          </p>
        </div>

        {/* Auth Card Container */}
        <div
          style={{
            background: '#0B0F17',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 14,
            padding: 'clamp(24px, 5vw, 32px)',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.7)',
          }}
        >
          {/* ── LOGIN ── */}
          {step === 'login' && (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 18 }}>
                <label
                  htmlFor="login-email"
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: 'var(--font-mono, monospace)',
                    textTransform: 'uppercase',
                    letterSpacing: '.08em',
                    color: '#8B93A7',
                    marginBottom: 8,
                  }}
                >
                  Admin Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={15}
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#505872',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="field"
                    placeholder="admin@example.com"
                    style={{ paddingLeft: 40 }}
                    autoComplete="username"
                    required
                    maxLength={254}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 10 }}>
                <PasswordField
                  id="login-password"
                  label="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>

              <div style={{ textAlign: 'right', marginBottom: 24 }}>
                <button
                  type="button"
                  onClick={() => { setForgotEmail(email); setStep('forgot') }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12,
                    color: '#8B93A7',
                    fontFamily: 'var(--font-mono, monospace)',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
              >
                <Shield size={15} />
                <span>{loading ? 'Authenticating…' : 'Sign In'}</span>
              </button>
            </form>
          )}

          {/* ── 2FA ── */}
          {step === '2fa' && (
            <form onSubmit={handle2fa}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                {twoFAMethod === 'totp' ? (
                  <Smartphone size={36} style={{ color: '#38BDF8', margin: '0 auto' }} />
                ) : (
                  <Shield size={36} style={{ color: '#38BDF8', margin: '0 auto' }} />
                )}
              </div>
              <div style={{ marginBottom: 24 }}>
                <label
                  htmlFor="code-2fa"
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: 'var(--font-mono, monospace)',
                    textTransform: 'uppercase',
                    letterSpacing: '.08em',
                    color: '#8B93A7',
                    marginBottom: 8,
                    textAlign: 'center',
                  }}
                >
                  Verification Code
                </label>
                <input
                  id="code-2fa"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code2fa}
                  onChange={e => setCode2fa(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="field"
                  placeholder="000000"
                  style={{
                    textAlign: 'center',
                    fontSize: 26,
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono, monospace)',
                    letterSpacing: '0.35em',
                  }}
                  autoComplete="one-time-code"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
              >
                <Shield size={15} />
                <span>{loading ? 'Verifying…' : 'Verify Code'}</span>
              </button>
              <button
                type="button"
                onClick={() => setStep('login')}
                className="btn btn-outline btn-sm"
                style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
              >
                <ArrowLeft size={13} /> Back to Sign In
              </button>
            </form>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {step === 'forgot' && (
            <form onSubmit={handleForgot}>
              <div style={{ marginBottom: 24 }}>
                <label
                  htmlFor="forgot-email"
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: 'var(--font-mono, monospace)',
                    textTransform: 'uppercase',
                    letterSpacing: '.08em',
                    color: '#8B93A7',
                    marginBottom: 8,
                  }}
                >
                  Admin Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={15}
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#505872',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    className="field"
                    placeholder="admin@example.com"
                    style={{ paddingLeft: 40 }}
                    autoComplete="email"
                    required
                    maxLength={254}
                  />
                </div>
                <p style={{ fontSize: 12, color: '#8B93A7', marginTop: 8, lineHeight: 1.6 }}>
                  A 6-digit recovery code will be dispatched if this address matches your admin account.
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
              >
                <KeyRound size={15} />
                <span>{loading ? 'Sending Code…' : 'Send Recovery Code'}</span>
              </button>
              <button
                type="button"
                onClick={() => setStep('login')}
                className="btn btn-outline btn-sm"
                style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
              >
                <ArrowLeft size={13} /> Back to Sign In
              </button>
            </form>
          )}

          {/* ── RESET PASSWORD ── */}
          {step === 'reset' && (
            <form onSubmit={handleReset}>
              <div style={{ marginBottom: 18 }}>
                <label
                  htmlFor="reset-code"
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: 'var(--font-mono, monospace)',
                    textTransform: 'uppercase',
                    letterSpacing: '.08em',
                    color: '#8B93A7',
                    marginBottom: 8,
                  }}
                >
                  6-Digit Recovery Code
                </label>
                <input
                  id="reset-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={resetCode}
                  onChange={e => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="field"
                  placeholder="000000"
                  style={{
                    textAlign: 'center',
                    fontSize: 26,
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono, monospace)',
                    letterSpacing: '0.35em',
                  }}
                  autoComplete="one-time-code"
                  required
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <PasswordField
                  id="new-password"
                  label="New Password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Minimum 12 chars with mixed symbols"
                  autoComplete="new-password"
                />
                <StrengthBar password={newPassword} />
              </div>

              <div style={{ marginBottom: 24, marginTop: 14 }}>
                <PasswordField
                  id="confirm-password"
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p style={{ fontSize: 12, color: '#EF4444', marginTop: 6, fontFamily: 'var(--font-mono, monospace)' }}>
                    Passwords do not match
                  </p>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <p style={{ fontSize: 12, color: '#10B981', marginTop: 6, fontFamily: 'var(--font-mono, monospace)' }}>
                    Passwords match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || newPassword !== confirmPassword || newPassword.length < 12}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  opacity: (loading || newPassword !== confirmPassword || newPassword.length < 12) ? 0.6 : 1,
                }}
              >
                <KeyRound size={15} />
                <span>{loading ? 'Updating…' : 'Reset Password'}</span>
              </button>

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setStep('forgot')}
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Resend Code
                </button>
                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <ArrowLeft size={13} /> Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
