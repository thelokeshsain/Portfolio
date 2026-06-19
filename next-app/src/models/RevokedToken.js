const mongoose = require('mongoose')

const revokedTokenSchema = new mongoose.Schema({
  tokenHash: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 },
  },
}, { timestamps: true })

module.exports = mongoose.model('RevokedToken', revokedTokenSchema)
