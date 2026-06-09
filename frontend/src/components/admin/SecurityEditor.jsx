import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { KeyRound, Shield, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useConfirm } from '../ui/ConfirmDialog'
import { Card, FL } from './AdminHelpers'
import { apiClient } from '../../context/AuthContext'

/* ── Password field with eye toggle (reused in SecurityEditor) ── */
function PwField({
  value,
  onChange,
  placeholder,
  autoComplete = "current-password",
  label,
}) {
  const [show, setShow] = useState(false)
  return (
    <div>
      {label && (
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            fontFamily: "var(--mono)",
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 7,
          }}
        >
          {label}
        </div>
      )}
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="field"
          style={{ paddingRight: 44 }}
          autoComplete={autoComplete}
          maxLength={128}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          tabIndex={-1}
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--muted)",
            display: "flex",
            alignItems: "center",
            padding: 4,
          }}
          aria-label={show ? "Hide" : "Show"}
        >
          {show ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

/* ── Password strength bar ── */
function StrBar({ pw }) {
  const checks = [
    pw.length >= 12,
    /[A-Z]/.test(pw),
    /[a-z]/.test(pw),
    /[0-9]/.test(pw),
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(pw),
  ]
  const score = checks.filter(Boolean).length
  const cols = ["#ff4444", "#ff8c42", "#ffd700", "#00aa44", "#00cc66"]
  if (!pw) return null
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: i < score ? cols[score - 1] : "var(--cream)",
            }}
          />
        ))}
      </div>
      <div
        style={{
          fontSize: 11,
          fontFamily: "var(--mono)",
          fontWeight: 700,
          color: cols[score - 1] || "var(--muted)",
        }}
      >
        {["Very weak", "Weak", "Fair", "Good", "Strong"][score - 1] || ""}
        {score < 5 && (
          <span style={{ fontWeight: 400, color: "var(--muted)" }}>
            {" "}
            — needs:{" "}
            {[
              !checks[0] && "12+ chars",
              !checks[1] && "uppercase",
              !checks[2] && "lowercase",
              !checks[3] && "number",
              !checks[4] && "symbol",
            ]
              .filter(Boolean)
              .join(", ")}
          </span>
        )}
      </div>
    </div>
  )
}

export default function SecurityEditor() {
  const { admin } = useAuth()
  const { confirm, Dialog } = useConfirm()

  // TOTP state
  const [step, setStep] = useState("idle")
  const [qr, setQr] = useState(null)
  const [setupToken, setSetupToken] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)

  // Change-password state
  const [pwPanel, setPwPanel] = useState("idle") // idle | verify-otp | change
  const [pwOtp, setPwOtp] = useState("")
  const [curPw, setCurPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [pwLoading, setPwLoading] = useState(false)

  const requestPwOtp = async () => {
    if (!admin?.email) return
    setPwLoading(true)
    try {
      const r = await apiClient.post("/admin/forgot-password", {
        email: admin.email,
      })
      if (r.data.token) {
        setPwPanel("verify-otp")
        toast.success("A verification code has been sent to your email")
      } else {
        toast.error("Could not send code — check server email config")
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to send code")
    } finally {
      setPwLoading(false)
    }
  }

  const verifyPwOtp = () => {
    const c = pwOtp.replace(/\s/g, "")
    if (c.length < 6) {
      toast.error("Enter the 6-digit code")
      return
    }
    setPwPanel("change")
  }

  const submitPwChange = async () => {
    if (!curPw) {
      toast.error("Enter your current password")
      return
    }
    if (!newPw) {
      toast.error("Enter a new password")
      return
    }
    if (newPw !== confirmPw) {
      toast.error("Passwords do not match")
      return
    }
    if (newPw.length < 12) {
      toast.error("Password must be at least 12 characters")
      return
    }
    setPwLoading(true)
    try {
      await apiClient.put("/admin/password", {
        currentPassword: curPw,
        newPassword: newPw,
      })
      toast.success("Password changed. You have been logged out.")
      setCurPw("")
      setNewPw("")
      setConfirmPw("")
      setPwOtp("")
      setPwPanel("idle")
    } catch (e) {
      toast.error(e.response?.data?.message || "Change failed")
    } finally {
      setPwLoading(false)
    }
  }

  const resetPwPanel = () => {
    setPwPanel("idle")
    setPwOtp("")
    setCurPw("")
    setNewPw("")
    setConfirmPw("")
  }

  const startSetup = async () => {
    if (loading) return
    setLoading(true)
    try {
      const r = await apiClient.post("/admin/setup-totp")
      setQr(r.data.qrDataUrl)
      setSetupToken(r.data.setupToken)
      setCode("")
      setStep("setup")
    } catch (e) {
      toast.error(e.response?.data?.message || "Setup failed")
    } finally {
      setLoading(false)
    }
  }

  const verifyTotp = async () => {
    if (!code || code.length < 6) {
      toast.error("Enter 6-digit code")
      return
    }
    setLoading(true)
    try {
      await apiClient.post("/admin/enable-totp", { code, setupToken })
      toast.success("Google Authenticator enabled!")
      setQr(null)
      setSetupToken("")
      setCode("")
      setStep("done")
    } catch (e) {
      toast.error(e.response?.data?.message || "Invalid code")
    } finally {
      setLoading(false)
    }
  }

  const disableTotp = async () => {
    const ok = await confirm(
      "Disable Google Authenticator? Email OTP will be used instead.",
    )
    if (!ok) return
    setLoading(true)
    try {
      await apiClient.delete("/admin/disable-totp")
      toast.success("Google Authenticator disabled")
      setStep("idle")
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed")
    } finally {
      setLoading(false)
    }
  }

  const totpEnabled = admin?.totpEnabled

  return (
    <div>
      {Dialog}
      <h2
        style={{
          fontWeight: 900,
          fontSize: "clamp(20px,3vw,26px)",
          letterSpacing: "-0.03em",
          marginBottom: 28,
        }}
      >
        Security
      </h2>

      <Card style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>
              Two-Factor Authentication
            </div>
            <div style={{ fontSize: 14, color: "var(--muted)" }}>
              {totpEnabled || step === "done"
                ? "Google Authenticator is enabled. Your account is protected."
                : "Email OTP is active. Upgrade to Google Authenticator for better security."}
            </div>
          </div>
          <span
            style={{
              padding: "5px 14px",
              borderRadius: 99,
              border: "2px solid var(--ink)",
              fontWeight: 700,
              fontSize: 13,
              background:
                totpEnabled || step === "done"
                  ? "var(--green)"
                  : "var(--yellow)",
              color: "#000",
            }}
          >
            {totpEnabled || step === "done" ? "🔐 TOTP Active" : "📧 Email OTP"}
          </span>
        </div>
      </Card>

      {step === "idle" && (
        <Card>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
            {totpEnabled
              ? "Manage Google Authenticator"
              : "Enable Google Authenticator"}
          </div>
          <p
            style={{
              fontSize: 14,
              color: "var(--muted)",
              marginBottom: 18,
              lineHeight: 1.7,
            }}
          >
            {totpEnabled
              ? "Your account is protected by Google Authenticator. You can disable it to switch back to email OTP."
              : "Use Google Authenticator or any TOTP app (Authy, 1Password, etc.) to generate time-based codes."}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {!totpEnabled && (
              <button
                onClick={startSetup}
                disabled={loading}
                className="btn btn-yellow"
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                <KeyRound size={15} />
                {loading ? "Generating…" : "Set Up Google Authenticator"}
              </button>
            )}
            {totpEnabled && (
              <button
                onClick={disableTotp}
                disabled={loading}
                className="btn btn-outline"
                style={{
                  color: "#cc0000",
                  borderColor: "#cc0000",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Disabling…" : "Disable TOTP"}
              </button>
            )}
          </div>
        </Card>
      )}

      {step === "setup" && (
        <Card>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18 }}>
            Step 1 — Scan QR Code
          </div>
          <p
            style={{
              fontSize: 14,
              color: "var(--muted)",
              marginBottom: 16,
              lineHeight: 1.7,
            }}
          >
            Open{" "}
            <strong style={{ color: "var(--ink)" }}>
              Google Authenticator
            </strong>{" "}
            (or Authy, 1Password, etc.) on your phone and scan this QR code:
          </p>
          {qr && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <img
                src={qr}
                alt="TOTP QR Code — scan with your authenticator app"
                style={{
                  width: 200,
                  height: 200,
                  border: "2px solid var(--ink)",
                  borderRadius: 12,
                  boxShadow: "var(--sh)",
                }}
              />
            </div>
          )}
          <p
            style={{
              fontSize: 13,
              color: "var(--muted)",
              marginBottom: 20,
              fontFamily: "var(--mono)",
            }}
          >
            If you cannot scan the QR code, please regenerate it by cancelling
            and starting again.
          </p>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
            Step 2 — Verify Code
          </div>
          <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 14 }}>
            Enter the 6-digit code shown in the app:
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            <div style={{ flex: 1, minWidth: 160 }}>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="field"
                style={{
                  textAlign: "center",
                  fontSize: 24,
                  fontWeight: 900,
                  fontFamily: "var(--mono)",
                  letterSpacing: "0.35em",
                }}
                autoComplete="one-time-code"
              />
            </div>
            <button
              onClick={verifyTotp}
              disabled={loading || code.length < 6}
              className="btn btn-yellow"
              style={{ opacity: loading || code.length < 6 ? 0.7 : 1 }}
            >
              <Shield size={15} />
              {loading ? "Verifying…" : "Verify & Enable"}
            </button>
          </div>
          <button
            onClick={() => {
              setStep("idle")
              setQr(null)
              setSetupToken("")
              setCode("")
            }}
            className="btn btn-outline btn-sm"
            style={{ marginTop: 14 }}
          >
            <ArrowLeft size={13} /> Cancel
          </button>
        </Card>
      )}

      {step === "done" && (
        <Card style={{ background: "var(--green)", borderColor: "var(--ink)" }}>
          <div
            style={{
              fontWeight: 900,
              fontSize: 20,
              marginBottom: 8,
              color: "#000",
            }}
          >
            ✓ Google Authenticator Enabled!
          </div>
          <p style={{ fontSize: 15, color: "#000", lineHeight: 1.7 }}>
            From your next login you'll be asked for a code from your
            authenticator app.
          </p>
          <button
            onClick={() => setStep("idle")}
            className="btn btn-outline btn-sm"
            style={{ marginTop: 14, borderColor: "#000", color: "#000" }}
          >
            Done
          </button>
        </Card>
      )}

      {/* Change Password */}
      <div
        style={{
          marginTop: 28,
          borderTop: "2px solid var(--ink)",
          paddingTop: 28,
        }}
      >
        <h3
          style={{
            fontWeight: 900,
            fontSize: 17,
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}
        >
          Change Password
        </h3>

        {pwPanel === "idle" && (
          <Card>
            <p
              style={{
                fontSize: 14,
                color: "var(--muted)",
                marginBottom: 18,
                lineHeight: 1.7,
              }}
            >
              To change your password, we'll first send a verification code to
              your admin email to confirm your identity.
            </p>
            <button
              onClick={requestPwOtp}
              disabled={pwLoading}
              className="btn btn-yellow"
              style={{ opacity: pwLoading ? 0.7 : 1 }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              {pwLoading ? "Sending code…" : "Start Password Change"}
            </button>
          </Card>
        )}

        {pwPanel === "verify-otp" && (
          <Card>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
              Step 1 — Verify your identity
            </div>
            <p
              style={{
                fontSize: 13,
                color: "var(--muted)",
                marginBottom: 16,
                lineHeight: 1.7,
              }}
            >
              Enter the 6-digit code sent to{" "}
              <strong style={{ color: "var(--ink)" }}>{admin?.email}</strong>
            </p>
            <div style={{ marginBottom: 16 }}>
              <FL>Verification Code</FL>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pwOtp}
                onChange={(e) =>
                  setPwOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="field"
                style={{
                  textAlign: "center",
                  fontSize: 24,
                  fontWeight: 900,
                  fontFamily: "var(--mono)",
                  letterSpacing: "0.35em",
                }}
                placeholder="000000"
                autoComplete="one-time-code"
              />
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={verifyPwOtp}
                disabled={pwOtp.length < 6}
                className="btn btn-yellow"
                style={{ opacity: pwOtp.length < 6 ? 0.6 : 1 }}
              >
                Continue →
              </button>
              <button
                onClick={requestPwOtp}
                disabled={pwLoading}
                className="btn btn-outline btn-sm"
                style={{ opacity: pwLoading ? 0.6 : 1 }}
              >
                {pwLoading ? "Sending…" : "Resend Code"}
              </button>
              <button onClick={resetPwPanel} className="btn btn-outline btn-sm">
                Cancel
              </button>
            </div>
          </Card>
        )}

        {pwPanel === "change" && (
          <Card>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
              Step 2 — Set new password
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <FL>Current Password</FL>
                <PwField
                  value={curPw}
                  onChange={(e) => setCurPw(e.target.value)}
                  placeholder="Your current password"
                  autoComplete="current-password"
                />
              </div>
              <div>
                <FL>New Password</FL>
                <PwField
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="Min 12 chars, mixed, symbol"
                  autoComplete="new-password"
                />
                <StrBar pw={newPw} />
              </div>
              <div>
                <FL>Confirm New Password</FL>
                <PwField
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                />
                {confirmPw && newPw !== confirmPw && (
                  <p
                    style={{
                      fontSize: 11,
                      color: "#cc0000",
                      marginTop: 5,
                      fontFamily: "var(--mono)",
                    }}
                  >
                    Passwords do not match
                  </p>
                )}
                {confirmPw && newPw === confirmPw && (
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--green)",
                      marginTop: 5,
                      fontFamily: "var(--mono)",
                    }}
                  >
                    ✓ Passwords match
                  </p>
                )}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 20,
              }}
            >
              <button
                onClick={submitPwChange}
                disabled={
                  pwLoading ||
                  !curPw ||
                  newPw !== confirmPw ||
                  newPw.length < 12
                }
                className="btn btn-yellow"
                style={{
                  opacity:
                    pwLoading ||
                    !curPw ||
                    newPw !== confirmPw ||
                    newPw.length < 12
                      ? 0.6
                      : 1,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                {pwLoading ? "Saving…" : "Save New Password"}
              </button>
              <button onClick={resetPwPanel} className="btn btn-outline btn-sm">
                Cancel
              </button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
