// SECURITY: Token Blocklist — Manages revoked JWT IDs (JTI) claims.
// Prevents reuse of tokens after logout. Uses MongoDB with an in-memory cache layer for performance.

const RevokedToken = require("../models/RevokedToken");
const hashToken = require("./tokenHash");

class DatabaseTokenBlocklist {
  constructor() {
    this._localRevoked = new Map(); // jtiHash -> expiresAt (Date)
    this._localClean = new Map();   // jtiHash -> cachedUntil (timestamp)
    this._timer = setInterval(() => this._cleanup(), 5 * 60 * 1000);
    if (this._timer.unref) this._timer.unref();
  }

  async revoke(jti, expiresAt) {
    if (!jti || !expiresAt) return;
    const jtiHash = hashToken(jti);
    const expDate = new Date(expiresAt * 1000);

    // Save to database
    await RevokedToken.findOneAndUpdate(
      { tokenHash: jtiHash },
      { tokenHash: jtiHash, expiresAt: expDate },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Cache locally as revoked
    this._localRevoked.set(jtiHash, expDate);
    this._localClean.delete(jtiHash);
  }

  async isRevoked(jti) {
    if (!jti) return false;
    const jtiHash = hashToken(jti);

    // 1. Check local revoked cache
    const expDate = this._localRevoked.get(jtiHash);
    if (expDate) {
      if (new Date() > expDate) {
        this._localRevoked.delete(jtiHash);
        return false;
      }
      return true;
    }

    // 2. Check local clean cache (short-lived, 30s)
    const cleanUntil = this._localClean.get(jtiHash);
    if (cleanUntil && Date.now() < cleanUntil) {
      return false;
    }

    // 3. Fallback to database query
    const token = await RevokedToken.findOne({
      tokenHash: jtiHash,
      expiresAt: { $gt: new Date() },
    }).lean();

    if (token) {
      this._localRevoked.set(jtiHash, token.expiresAt);
      this._localClean.delete(jtiHash);
      return true;
    } else {
      this._localClean.set(jtiHash, Date.now() + 30 * 1000);
      return false;
    }
  }

  _cleanup() {
    const now = new Date();
    const nowMs = Date.now();

    for (const [hash, exp] of this._localRevoked.entries()) {
      if (now > exp) this._localRevoked.delete(hash);
    }
    for (const [hash, cleanUntil] of this._localClean.entries()) {
      if (nowMs > cleanUntil) this._localClean.delete(hash);
    }
  }
}

module.exports = new DatabaseTokenBlocklist();
