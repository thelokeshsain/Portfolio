// SECURITY: Transient OTP Store — Handles multi-factor authentication codes and reset tokens.
// Uses a size-capped Map with automatic TTL-based cleanup to prevent memory exhaustion (DoS).
const MAX_SIZE   = 501
const CLEANUP_MS = 5 * 60 * 1000

class OTPStore {
  constructor() {
    this._store = new Map()
    this._cleanupTimer = setInterval(() => this._cleanup(), CLEANUP_MS)
    if (this._cleanupTimer.unref) this._cleanupTimer.unref()
  }

  set(token, value, ttlMs = 10 * 60 * 1000) {
    if (this._store.size >= MAX_SIZE) {
      this._cleanup()
      if (this._store.size >= MAX_SIZE) {
        throw new Error('Verification service at capacity — please try again shortly')
      }
    }
    this._store.set(token, { ...value, expiresAt: Date.now() + ttlMs })
  }

  get(token) {
    const entry = this._store.get(token)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this._store.delete(token)
      return null
    }
    return entry
  }

  delete(token) {
    this._store.delete(token)
  }

  _cleanup() {
    const now = Date.now()
    for (const [key, val] of this._store.entries()) {
      if (now > val.expiresAt) this._store.delete(key)
    }
  }

  destroy() {
    clearInterval(this._cleanupTimer)
    this._store.clear()
  }
}

// NOTE: In multi-instance production environments, this should be replaced with Redis.
// Legacy in-memory implementation kept only for migration context; exports below use MongoDB.

const OtpToken = require('../models/OtpToken')
const hashToken = require('./tokenHash')

class DatabaseOTPStore {
  async set(token, value, ttlMs = 10 * 60 * 1000) {
    const expiresAt = new Date(Date.now() + ttlMs)
    const { adminId, type = 'generic', ...payload } = value || {}

    await OtpToken.findOneAndUpdate(
      { tokenHash: hashToken(token) },
      {
        tokenHash: hashToken(token),
        admin: adminId || null,
        type,
        payload,
        expiresAt,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  }

  async reserve(token, value, ttlMs = 10 * 60 * 1000) {
    const expiresAt = new Date(Date.now() + ttlMs)
    const { adminId, type = 'generic', ...payload } = value || {}

    try {
      await OtpToken.create({
        tokenHash: hashToken(token),
        admin: adminId || null,
        type,
        payload,
        expiresAt,
      })
      return true
    } catch (err) {
      if (err?.code === 11000) return false
      throw err
    }
  }

  async get(token) {
    const entry = await OtpToken.findOne({
      tokenHash: hashToken(token),
      expiresAt: { $gt: new Date() },
    }).lean()

    if (!entry) return null
    return {
      ...(entry.payload || {}),
      type: entry.type,
      adminId: entry.admin ? String(entry.admin) : undefined,
      expiresAt: entry.expiresAt,
    }
  }

  async delete(token) {
    await OtpToken.deleteOne({ tokenHash: hashToken(token) })
  }

  async deleteForAdmin(adminId, type) {
    await OtpToken.deleteMany({ admin: adminId, ...(type && { type }) })
  }
}

module.exports = new DatabaseOTPStore()
