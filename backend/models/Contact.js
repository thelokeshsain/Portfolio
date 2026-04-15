/**
 * Contact Model
 * Fix #16: indexes for pagination
 * Fix NM-02: TTL index for data retention (90 days)
 */
const mongoose = require('mongoose')

const contactSchema = new mongoose.Schema({
  name:      { type: String, required: true, maxlength: 100 },
  email:     { type: String, required: true, maxlength: 254 },
  message:   { type: String, required: true, maxlength: 2000 },
  ip:        { type: String, maxlength: 45 },
  userAgent: { type: String, maxlength: 500 },
  browser:   { type: String, maxlength: 100 },
  device:    { type: String, enum: ['Mobile', 'Desktop', 'Unknown'], default: 'Unknown' },
  read:      { type: Boolean, default: false },
}, { timestamps: true })

contactSchema.index({ createdAt: -1 })
contactSchema.index({ email: 1 })
// Auto-delete messages after 90 days (GDPR data retention)
contactSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 3600 })

module.exports = mongoose.model('Contact', contactSchema)
