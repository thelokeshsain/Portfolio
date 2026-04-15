// SECURITY: Token Blocklist — Manages revoked JWT IDs (JTI) claims.
// Prevents reuse of tokens after logout. In-memory storage for single-instance efficiency.
// For production multi-instance deployments, this should be migrated to Redis.

class TokenBlocklist {
  constructor() {
    this._revoked = new Map() // jti -> expiresAt
    this._timer   = setInterval(() => this._cleanup(), 15 * 60 * 1000)
    if (this._timer.unref) this._timer.unref()
  }

  revoke(jti, expiresAt) {
    this._revoked.set(jti, expiresAt)
  }

  isRevoked(jti) {
    const exp = this._revoked.get(jti)
    if (!exp) return false
    if (Date.now() / 1000 > exp) { this._revoked.delete(jti); return false }
    return true
  }

  _cleanup() {
    const now = Date.now() / 1000
    for (const [jti, exp] of this._revoked.entries()) {
      if (now > exp) this._revoked.delete(jti)
    }
  }
}

// Legacy in-memory implementation kept only for migration context; exports below use MongoDB.

const RevokedToken = require('../models/RevokedToken')
const hashToken = require('./tokenHash')

class DatabaseTokenBlocklist {
  async revoke(jti, expiresAt) {
    if (!jti || !expiresAt) return
    await RevokedToken.findOneAndUpdate(
      { tokenHash: hashToken(jti) },
      { tokenHash: hashToken(jti), expiresAt: new Date(expiresAt * 1000) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  }

  async isRevoked(jti) {
    if (!jti) return false
    const token = await RevokedToken.findOne({
      tokenHash: hashToken(jti),
      expiresAt: { $gt: new Date() },
    }).lean()
    return Boolean(token)
  }
}

module.exports = new DatabaseTokenBlocklist()
