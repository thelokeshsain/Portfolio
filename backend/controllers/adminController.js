const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const OTPLib = require('otpauth')
const QRCode = require('qrcode')
const Admin = require('../models/Admin')
const Portfolio = require('../models/Portfolio')
const RefreshSession = require('../models/RefreshSession')
const sendMail = require('../config/mailer')
const otpStore = require('../utils/otpStore')
const blocklist = require('../utils/tokenBlocklist')
const hashToken = require('../utils/tokenHash')
const { isSafeUrl } = require('../middleware/validate')
const {
  twoFactorEmail,
  loginAlertEmail,
  logoutAlertEmail,
} = require('../utils/emailTemplates')

const REFRESH_TOKEN_MS = 7 * 24 * 60 * 60 * 1000

/* ── TOTP Replay Prevention ─────────────────────────────────────────────────
 * Each 6-digit code is valid for up to 90s (window:1 = ±1 period).
 * Without this map, the same intercepted code could be submitted twice.
 * Map is cleared every 60s; keys are 'adminId_windowIndex_code'.
 */
// TOTP replay prevention is persisted via otpStore.reserve().

/* ── helpers ── */
function parseBrowser(ua = '') {
  if (ua.includes('Edg/')) return `Edge ${(ua.match(/Edg\/([\d.]+)/) || [])[1] || ''}`
  if (ua.includes('Chrome/')) return `Chrome ${(ua.match(/Chrome\/([\d.]+)/) || [])[1] || ''}`
  if (ua.includes('Firefox/')) return `Firefox ${(ua.match(/Firefox\/([\d.]+)/) || [])[1] || ''}`
  if (ua.includes('Safari/') && !ua.includes('Chrome')) return `Safari ${(ua.match(/Version\/([\d.]+)/) || [])[1] || ''}`
  if (ua.includes('OPR/')) return `Opera ${(ua.match(/OPR\/([\d.]+)/) || [])[1] || ''}`
  return ua.slice(0, 60) || 'Unknown'
}

function getDevice(ua = '') {
  if (/mobile/i.test(ua)) return 'Mobile'
  if (/tablet|ipad/i.test(ua)) return 'Tablet'
  if (/android/i.test(ua)) return 'Android'
  return 'Desktop'
}

// SECURITY: Signs a short-lived (15m) Access Token with minimal payload.
function signAccessToken(adminId, tokenVersion = 0, sessionId) {
  return jwt.sign(
    {
      id: String(adminId),
      role: 'admin',
      v: tokenVersion,
      sid: sessionId,
      jti: crypto.randomBytes(16).toString('hex'),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '15m', algorithm: 'HS256',
      issuer: 'lokesh-portfolio-admin', audience: 'lokesh-portfolio-admin'
    }
  )
}

// SECURITY: Signs a long-lived refresh token bound to one durable session.
function signRefreshToken(adminId, sessionId) {
  const jti = crypto.randomBytes(16).toString('hex')
  const token = jwt.sign(
    { id: String(adminId), sid: sessionId, jti },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d', algorithm: 'HS256',
      issuer: 'lokesh-portfolio-admin', audience: 'lokesh-portfolio-admin'
    }
  )
  return token
}

function isLocalUrl(value = '') {
  try {
    const { hostname } = new URL(value)
    return ['localhost', '127.0.0.1', '::1', '[::1]'].includes(hostname)
  } catch {
    return false
  }
}

function refreshCookieOptions(req, includeMaxAge = false) {
  const secureOverride = process.env.COOKIE_SECURE
  const sameSiteOverride = process.env.COOKIE_SAME_SITE || process.env.COOKIE_SAMESITE
  const requestUrl = req.get('origin') || `${req.protocol}://${req.get('host')}`
  const isLocalRequest = isLocalUrl(requestUrl)

  const secure = secureOverride
    ? secureOverride === 'true'
    : process.env.NODE_ENV === 'production' && !isLocalRequest

  let sameSite = sameSiteOverride
    ? sameSiteOverride.toLowerCase()
    : secure ? 'none' : 'lax'

  if (!secure && sameSite === 'none') sameSite = 'lax'

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: '/api/admin',
    ...(includeMaxAge && { maxAge: REFRESH_TOKEN_MS }),
  }
}

// SECURITY: Sets the sensitive Refresh Token in a host-isolated HTTP-only cookie.
function setRefreshCookie(req, res, token) {
  res.cookie('refreshToken', token, refreshCookieOptions(req, true))
}

function clearRefreshCookie(req, res) {
  res.clearCookie('refreshToken', refreshCookieOptions(req))
}

function csrfCookieOptions(req, includeMaxAge = false) {
  const options = refreshCookieOptions(req, includeMaxAge)
  return {
    ...options,
    httpOnly: false,
    path: '/',
  }
}

function setCsrfCookie(req, res, token) {
  res.cookie('csrfToken', token, csrfCookieOptions(req, true))
}

function clearCsrfCookie(req, res) {
  res.clearCookie('csrfToken', csrfCookieOptions(req))
}

function buildRequestMeta(req) {
  const ua = req.headers['user-agent'] || ''
  return {
    ip: req.ip,
    browser: parseBrowser(ua),
    device: getDevice(ua),
    dateStr: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'medium' }),
    userAgent: ua,
  }
}

function codesMatch(expectedHash, code) {
  if (!expectedHash || !code) return false
  const a = Buffer.from(expectedHash)
  const b = Buffer.from(hashToken(String(code).trim()))
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

function validateCsrf(req, session) {
  const headerToken = req.get('x-csrf-token')
  const cookieToken = req.cookies.csrfToken
  if (!headerToken || !cookieToken || headerToken !== cookieToken) return false
  return hashToken(headerToken) === session?.csrfTokenHash
}

async function issueSession(req, res, admin) {
  const meta = buildRequestMeta(req)
  const sessionId = crypto.randomBytes(16).toString('hex')
  const csrfToken = crypto.randomBytes(32).toString('hex')
  const refreshToken = signRefreshToken(admin._id, sessionId)

  await RefreshSession.create({
    admin: admin._id,
    sessionId,
    refreshTokenHash: hashToken(refreshToken),
    csrfTokenHash: hashToken(csrfToken),
    ip: meta.ip,
    userAgent: meta.userAgent.slice(0, 500),
    browser: meta.browser,
    device: meta.device,
    lastUsedAt: new Date(),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_MS),
  })

  setRefreshCookie(req, res, refreshToken)
  setCsrfCookie(req, res, csrfToken)

  return {
    accessToken: signAccessToken(admin._id, admin.tokenVersion, sessionId),
    csrfToken,
  }
}

async function revokeAdminSessions(adminId, reason) {
  await RefreshSession.updateMany(
    { admin: adminId, revokedAt: null },
    { $set: { revokedAt: new Date(), revokedReason: reason } }
  )
}

function stripMongoFields(payload) {
  if (Array.isArray(payload)) {
    return payload.map(item => {
      if (item && typeof item === 'object') {
        const { _id, __v, ...rest } = item
        const cleaned = {}
        for (const [k, v] of Object.entries(rest)) {
          cleaned[k] = Array.isArray(v) ? v.map(x => (x && typeof x === 'object' ? (({ _id: _a, __v: _b, ...r }) => r)(x) : x)) : v
        }
        return cleaned
      }
      return item
    })
  }
  if (payload && typeof payload === 'object') {
    const { _id, __v, ...rest } = payload
    return rest
  }
  return payload
}


// SECURITY: Validates that a base64 data URL is a real image by checking magic bytes.
// This prevents stored XSS attacks via image file masquerading (e.g., SVG/HTML in a PNG).
function validateBase64Image(dataUrl) {
  if (!dataUrl) return { ok: true }
  if (typeof dataUrl !== 'string') return { ok: false, msg: 'Image must be a string' }

  const match = dataUrl.match(/^data:(image\/(jpeg|png|webp|gif));base64,/)
  if (!match) return { ok: false, msg: 'Image must be JPEG, PNG, WebP, or GIF (not SVG or other formats)' }

  const b64 = dataUrl.split(',')[1]
  if (!b64) return { ok: false, msg: 'Invalid image data' }


  const approxBytes = Math.ceil(b64.length * 0.75)
  if (approxBytes > 2 * 1024 * 1024) return { ok: false, msg: 'Image must be under 2MB' }


  const bytes = Buffer.from(b64.slice(0, 16), 'base64')
  const hex = bytes.toString('hex')

  const MAGIC = {
    'ffd8ff': 'jpeg',   // JPEG
    '89504e47': 'png',    // PNG
    '52494646': 'webp',   // RIFF (WebP)
    '47494638': 'gif',    // GIF
  }

  const matchesMagic = Object.keys(MAGIC).some(magic => hex.startsWith(magic))
  if (!matchesMagic) return { ok: false, msg: 'Image content does not match its declared format' }

  return { ok: true }
}


// SECURITY: Validates URL fields to block javascript: pseudo-protocols and other XSS vectors.
function validateHeroUrls(hero) {
  const urlFields = ['github', 'linkedin', 'resumeUrl']
  for (const field of urlFields) {
    const val = hero[field]
    if (val && !isSafeUrl(val)) {
      return { ok: false, msg: `${field} must be a valid http:// or https:// URL` }
    }
  }
  return { ok: true }
}


function recursivelyValidateUrls(obj, path = '') {
  if (!obj) return { ok: true }

  if (typeof obj === 'string') {
    const looksLikeUrl = obj.includes('://') || obj.startsWith('/')
    if (looksLikeUrl && !isSafeUrl(obj)) {
      return { ok: false, msg: `Invalid URL detected at ${path}: protocol must be http:// or https://` }
    }
    return { ok: true }
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const res = recursivelyValidateUrls(obj[i], `${path}[${i}]`)
      if (!res.ok) return res
    }
    return { ok: true }
  }

  if (typeof obj === 'object') {
    for (const [key, val] of Object.entries(obj)) {
      const res = recursivelyValidateUrls(val, path ? `${path}.${key}` : key)
      if (!res.ok) return res
    }
  }

  return { ok: true }
}

/* ── POST /api/admin/login ── */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    
    // SECURITY: Use a constant-time dummy comparison to prevent account enumeration via timing
    const admin = await Admin.findOne({ email }).select('+password +totpSecret')
    const DUMMY_HASH = '$2a$12$rBFqLJNTvLuIy0z3RkMCce3wfRSLq7X3YMp5HHvV.6Z/bDmSNu1uO'
    const passwordValid = admin
      ? await admin.comparePassword(password)
      : await require('bcryptjs').compare(password, DUMMY_HASH)
    
    if (!admin || !passwordValid)
      return res.status(401).json({ message: 'Invalid email or password' })

    if (admin.twoFactorEnabled) {
      // SECURITY: Generate a temporary session token for MFA verification step
      const tempToken = crypto.randomBytes(32).toString('hex')
      if (admin.totpEnabled && admin.totpSecret) {
        await otpStore.set(tempToken, { adminId: String(admin._id), type: 'totp' })
        return res.json({ requiresTwoFactor: true, method: 'totp', tempToken })
      }
      const otpCode = crypto.randomInt(100000, 999999).toString()
      await otpStore.set(tempToken, { codeHash: hashToken(otpCode), adminId: String(admin._id), type: 'email' })
      try {
        await sendMail({ to: admin.email, subject: '🔐 Admin Login — Verification Code', html: twoFactorEmail(otpCode) })
      } catch (e) { console.error('[2FA email]', e.message) }
      return res.json({ requiresTwoFactor: true, method: 'email', tempToken })
    }

    admin.lastLogin = new Date()
    await admin.save()
    
    const { accessToken, csrfToken } = await issueSession(req, res, admin)

    const meta = buildRequestMeta(req)
    sendMail({ to: admin.email, subject: '🔐 Admin Login Detected — Lokesh Portfolio', html: loginAlertEmail(meta) })
      .catch(e => console.error('[Login alert]', e.message))
    
    res.json({ 
      token: accessToken, 
      csrfToken,
      admin: { id: admin._id, email: admin.email, role: admin.role } 
    })
  } catch (err) {
    console.error('[Login]', err.message)
    res.status(500).json({ message: 'Login failed — please try again' })
  }
}

/* ── POST /api/admin/verify-2fa ── */
exports.verifyTwoFactor = async (req, res) => {
  try {
    const { token, code } = req.body
    if (!token || !code) return res.status(400).json({ message: 'Token and code required' })
    const entry = await otpStore.get(token)
    if (!entry) return res.status(400).json({ message: 'Session expired — please login again' })
    const admin = await Admin.findById(entry.adminId).select('+totpSecret')
    if (!admin) return res.status(401).json({ message: 'Admin not found' })

    if (entry.type === 'totp') {
      const totp = new OTPLib.TOTP({ secret: OTPLib.Secret.fromBase32(admin.totpSecret), digits: 6, period: 30, algorithm: 'SHA1' })
      const cleanCode = code.replace(/\s/g, '')
      if (totp.validate({ token: cleanCode, window: 1 }) === null)
        return res.status(400).json({ message: 'Invalid authenticator code. Check your device clock.' })
      // Replay prevention: same code cannot be used twice within the 90s window
      const windowKey = `${entry.adminId}_${Math.floor(Date.now() / 30000)}_${cleanCode}`
      const reserved = await otpStore.reserve(`totp-replay:${windowKey}`, {
        adminId: entry.adminId,
        type: 'totp-replay',
      }, 2 * 60 * 1000)
      if (!reserved)
        return res.status(400).json({ message: 'Code already used — wait for the next code' })
    } else {
      if (!codesMatch(entry.codeHash, code))
        return res.status(400).json({ message: 'Invalid verification code' })
    }

    await otpStore.delete(token)
    admin.lastLogin = new Date()
    await admin.save()

    const { accessToken, csrfToken } = await issueSession(req, res, admin)

    const meta = buildRequestMeta(req)
    sendMail({ to: admin.email, subject: '🔐 Admin Login Detected — Lokesh Portfolio', html: loginAlertEmail(meta) })
      .catch(e => console.error('[Login alert 2FA]', e.message))
    
    res.json({ 
      token: accessToken, 
      csrfToken,
      admin: { id: admin._id, email: admin.email, role: admin.role, totpEnabled: admin.totpEnabled } 
    })
  } catch (err) {
    console.error('[Verify2FA]', err.message)
    res.status(500).json({ message: 'Verification failed — please try again' })
  }
}

/* ── POST /api/admin/logout ── */
// SECURITY: Revokes only the current durable refresh session.
exports.logout = async (req, res) => {
  clearRefreshCookie(req, res)
  clearCsrfCookie(req, res)

  if (!req.authSession || !validateCsrf(req, req.authSession)) {
    return res.status(403).json({ message: 'Invalid CSRF token' })
  }
  
  req.authSession.revokedAt = new Date()
  req.authSession.revokedReason = 'logout'
  await req.authSession.save()

  const meta = buildRequestMeta(req)
  sendMail({ to: req.admin.email, subject: 'Admin Logout — Lokesh Portfolio', html: logoutAlertEmail(meta) })
    .catch(e => console.error('[Logout alert]', e.message))
  res.json({ message: 'Logged out successfully' })
}

/* ── POST /api/admin/refresh-token ── */
// SECURITY: Rotates the session. Detects theft if an old refresh token is reused.
exports.refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken
  if (!token) return res.status(401).json({ message: 'Session expired' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'lokesh-portfolio-admin',
      audience: 'lokesh-portfolio-admin'
    })

    if (!decoded.sid) return res.status(401).json({ message: 'Invalid refresh session' })

    const now = new Date()
    const session = await RefreshSession.findOne({
      sessionId: decoded.sid,
      admin: decoded.id,
      revokedAt: null,
      expiresAt: { $gt: now },
    })
    if (!session) {
      clearRefreshCookie(req, res)
      clearCsrfCookie(req, res)
      return res.status(401).json({ message: 'Session expired' })
    }

    if (!validateCsrf(req, session)) {
      return res.status(403).json({ message: 'Invalid CSRF token' })
    }

    const admin = await Admin.findById(decoded.id)
    if (!admin) return res.status(401).json({ message: 'Admin account not found' })

    const csrfToken = crypto.randomBytes(32).toString('hex')
    const newRefreshToken = signRefreshToken(admin._id, session.sessionId)
    const updatedSession = await RefreshSession.findOneAndUpdate(
      {
        _id: session._id,
        refreshTokenHash: hashToken(token),
        revokedAt: null,
        expiresAt: { $gt: now },
      },
      {
        $set: {
          refreshTokenHash: hashToken(newRefreshToken),
          csrfTokenHash: hashToken(csrfToken),
          lastUsedAt: now,
          expiresAt: new Date(Date.now() + REFRESH_TOKEN_MS),
        },
      },
      { new: true }
    )

    if (!updatedSession) {
      session.revokedAt = new Date()
      session.revokedReason = 'refresh_reuse_detected'
      await session.save()
      clearRefreshCookie(req, res)
      clearCsrfCookie(req, res)
      return res.status(401).json({ message: 'Security breach detected â€” please login again' })
    }

    const newAccessToken = signAccessToken(admin._id, admin.tokenVersion, session.sessionId)
    setRefreshCookie(req, res, newRefreshToken)
    setCsrfCookie(req, res, csrfToken)

    return res.json({ token: newAccessToken, csrfToken })

    // THEFT DETECTION: If token version doesn't match, this token has already been rotated.
    // Someone might be trying to reuse a stolen refresh token.
    if (false) {
      console.warn(`[Security] Refresh token reuse detected for ${admin.email}. Invalidating all sessions.`)
      // legacy global refresh-token version removed
      await admin.save()
      clearRefreshCookie(req, res)
      return res.status(401).json({ message: 'Security breach detected — please login again' })
    }

    // ROTATION: Issue new versions of BOTH tokens
    // legacy global refresh-token version removed
    await admin.save()

    const legacyAccessToken  = signAccessToken(admin._id, admin.tokenVersion, session.sessionId)
    const legacyRefreshToken = signRefreshToken(admin._id, session.sessionId)
    setRefreshCookie(req, res, legacyRefreshToken)

    res.json({ token: legacyAccessToken })
  } catch (err) {
    clearRefreshCookie(req, res)
    clearCsrfCookie(req, res)
    return res.status(401).json({ message: 'Invalid refresh session' })
  }
}

/* ── GET /api/admin/me ── */
exports.getMe = (req, res) =>
  res.json({ admin: { id: req.admin._id, email: req.admin.email, role: req.admin.role, totpEnabled: req.admin.totpEnabled } })

/* ── POST /api/admin/setup-totp ── */
exports.setupTotp = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id)


    await otpStore.deleteForAdmin(admin._id, 'totp-setup')

    const secret = new OTPLib.Secret({ size: 20 })
    const totp = new OTPLib.TOTP({
      issuer: 'Lokesh Portfolio Admin',
      label: admin.email,
      secret,
      digits: 6, period: 30, algorithm: 'SHA1',
    })

    const qrDataUrl = await QRCode.toDataURL(totp.toString(), { width: 256, margin: 2 })
    const setupToken = crypto.randomBytes(32).toString('hex')

    await otpStore.set(setupToken, { adminId: String(admin._id), secret: secret.base32, type: 'totp-setup' })

    res.json({ qrDataUrl, setupToken })
  } catch (err) {
    console.error('[SetupTOTP]', err.message)
    res.status(500).json({ message: 'TOTP setup failed' })
  }
}

/* ── POST /api/admin/enable-totp ── */
exports.enableTotp = async (req, res) => {
  try {
    const { code, setupToken } = req.body
    const entry = await otpStore.get(setupToken)
    if (!entry || entry.type !== 'totp-setup')
      return res.status(400).json({ message: 'Setup session expired — please start over' })
    const totp = new OTPLib.TOTP({ secret: OTPLib.Secret.fromBase32(entry.secret), digits: 6, period: 30, algorithm: 'SHA1' })
    if (totp.validate({ token: code.replace(/\s/g, ''), window: 1 }) === null)
      return res.status(400).json({ message: 'Invalid code — check your authenticator app' })
    const admin = await Admin.findById(req.admin._id)
    admin.totpSecret = entry.secret
    admin.totpEnabled = true
    await admin.save()
    await otpStore.delete(setupToken)
    res.json({ message: 'Google Authenticator enabled successfully' })
  } catch (err) {
    console.error('[EnableTOTP]', err.message)
    res.status(500).json({ message: 'Enable TOTP failed' })
  }
}

/* ── DELETE /api/admin/disable-totp ── */
exports.disableTotp = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id)
    admin.totpSecret = null
    admin.totpEnabled = false
    await admin.save()
    res.json({ message: 'Authenticator disabled. Email OTP is now active.' })
  } catch (err) { res.status(500).json({ message: 'Disable TOTP failed' }) }
}

/* ── PUT /api/admin/portfolio/:section ── */
exports.updateSection = async (req, res) => {
  try {
    const { section } = req.params
    const ALLOWED = new Set(['hero', 'stats', 'about', 'education', 'achievements', 'experience', 'projects', 'skills', 'coreStack', 'sections'])
    if (!ALLOWED.has(section))
      return res.status(400).json({ message: `Unknown section: ${section}` })

    const cleanPayload = stripMongoFields(req.body)

    // SECURITY: Recursively validate ALL strings in the payload for unsafe protocols (XSS)
    const protocolCheck = recursivelyValidateUrls(cleanPayload)
    if (!protocolCheck.ok) return res.status(422).json({ message: protocolCheck.msg })

    // SECURITY: Magic-byte validation for images (Hero or Projects)
    if (section === 'hero' && cleanPayload?.image) {
      const imgCheck = validateBase64Image(cleanPayload.image)
      if (!imgCheck.ok) return res.status(422).json({ message: imgCheck.msg })
    }
    if (section === 'projects' && Array.isArray(cleanPayload)) {
      for (const p of cleanPayload) {
        if (p.image) {
          const imgCheck = validateBase64Image(p.image)
          if (!imgCheck.ok) return res.status(422).json({ message: imgCheck.msg })
        }
      }
    }

    // Atomic update using $set to prevent race conditions (Finding B-01)
    const updatedPortfolio = await Portfolio.findOneAndUpdate(
      {},
      { $set: { [section]: cleanPayload } },
      { new: true, upsert: true, runValidators: true }
    ).lean()

    res.json({ message: 'Updated successfully', [section]: updatedPortfolio[section] })
  } catch (err) {
    console.error('[UpdateSection]', err.message)
    res.status(500).json({ message: 'Update failed — please try again' })
  }
}

/* ── PUT /api/admin/password ── */
// SECURITY: Changes admin password and increments tokenVersion to invalidate all active sessions globally.
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, otpToken, otpCode } = req.body
    const admin = await Admin.findById(req.admin._id).select('+password')
    
    if (!(await admin.comparePassword(currentPassword)))
      return res.status(400).json({ message: 'Current password is incorrect' })

    const entry = await otpStore.get(otpToken)
    if (!entry || entry.type !== 'password-reset' || entry.adminId !== String(req.admin._id))
      return res.status(400).json({ message: 'Verification code expired â€” request a new one' })
    if (!codesMatch(entry.codeHash, otpCode))
      return res.status(400).json({ message: 'Invalid verification code' })

    admin.password = newPassword
    admin.tokenVersion = (admin.tokenVersion || 0) + 1
    await admin.save()
    await otpStore.delete(otpToken)
    await revokeAdminSessions(admin._id, 'password_changed')
    clearRefreshCookie(req, res)
    clearCsrfCookie(req, res)
    const { jti, exp } = req.tokenDecoded || {}
    if (jti && exp) await blocklist.revoke(jti, exp)
    res.json({ message: 'Password changed. Please login again.' })
  } catch (err) { res.status(500).json({ message: 'Password change failed' }) }
}

/* ── POST /api/admin/forgot-password ── */
exports.forgotPassword = async (req, res) => {
  // Always respond with the same message whether email exists or not (prevent enumeration)
  const GENERIC = 'If that email matches an admin account, a reset code has been sent.'
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required' })

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() })
    if (!admin) {
      // Return a dummy token so response shape is identical — prevents account enumeration
      const dummyToken = require('crypto').randomBytes(32).toString('hex')
      return res.json({ message: GENERIC, token: dummyToken })
    }

    const code = crypto.randomInt(100000, 999999).toString()
    const token = require('crypto').randomBytes(32).toString('hex')

    // Store with 10-minute TTL
    await otpStore.set(token, { codeHash: hashToken(code), adminId: String(admin._id), type: 'password-reset' }, 10 * 60 * 1000)

    const { resetPasswordEmail } = require('../utils/emailTemplates')
    await sendMail({
      to: admin.email,
      subject: '🔑 Reset Your Admin Password — Lokesh Portfolio',
      html: resetPasswordEmail(code),
    }).catch(e => console.error('[ForgotPassword] email failed:', e.message))

    // Return token so frontend can identify the session in the next step
    res.json({ message: GENERIC, token })
  } catch (err) {
    console.error('[ForgotPassword]', err.message)
    res.status(500).json({ message: 'Failed to process request — please try again' })
  }
}

/* ── POST /api/admin/reset-password ── */
exports.resetPassword = async (req, res) => {
  try {
    const { token, code, newPassword } = req.body
    if (!token || !code || !newPassword)
      return res.status(400).json({ message: 'Token, code, and new password are required' })

    const entry = await otpStore.get(token)
    if (!entry || entry.type !== 'password-reset')
      return res.status(400).json({ message: 'Reset session expired — please start again' })

    if (!codesMatch(entry.codeHash, code))
      return res.status(400).json({ message: 'Invalid code — please check and try again' })

    // Password strength validated here (same rules as changePassword)
    if (newPassword.length < 12)
      return res.status(422).json({ message: 'Password must be at least 12 characters' })
    if (!/[A-Z]/.test(newPassword))
      return res.status(422).json({ message: 'Password must contain an uppercase letter' })
    if (!/[a-z]/.test(newPassword))
      return res.status(422).json({ message: 'Password must contain a lowercase letter' })
    if (!/[0-9]/.test(newPassword))
      return res.status(422).json({ message: 'Password must contain a number' })
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(newPassword))
      return res.status(422).json({ message: 'Password must contain a special character' })

    const admin = await Admin.findById(entry.adminId).select('+password')
    if (!admin) return res.status(404).json({ message: 'Admin not found' })

    admin.password = newPassword
    admin.tokenVersion = (admin.tokenVersion || 0) + 1
    await admin.save()
    await revokeAdminSessions(admin._id, 'password_reset')

    // Consume the token to prevent replay
    await otpStore.delete(token)

    res.json({ message: 'Password reset successfully. Please log in with your new password.' })
  } catch (err) {
    console.error('[ResetPassword]', err.message)
    res.status(500).json({ message: 'Reset failed — please try again' })
  }
}
