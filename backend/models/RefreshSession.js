const mongoose = require('mongoose')

const refreshSessionSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
    index: true,
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  refreshTokenHash: {
    type: String,
    required: true,
    unique: true,
  },
  csrfTokenHash: {
    type: String,
    required: true,
  },
  ip: {
    type: String,
    maxlength: 45,
  },
  userAgent: {
    type: String,
    maxlength: 500,
  },
  browser: {
    type: String,
    maxlength: 100,
  },
  device: {
    type: String,
    maxlength: 50,
  },
  lastUsedAt: {
    type: Date,
    default: Date.now,
  },
  revokedAt: {
    type: Date,
    default: null,
    index: true,
  },
  revokedReason: {
    type: String,
    maxlength: 100,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 },
  },
}, { timestamps: true })

refreshSessionSchema.index({ admin: 1, revokedAt: 1 })

module.exports = mongoose.model('RefreshSession', refreshSessionSchema)
