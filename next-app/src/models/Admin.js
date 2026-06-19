// SECURITY: Admin Model
// Handles authentication, 2FA states, and session versioning.
const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const adminSchema = new mongoose.Schema({
  email: {
    type:     String,
    required: true,
    unique:   true,
    lowercase: true,
    trim:      true,
    maxlength: 254,
  },
  password: {
    type:     String,
    required: true,
    select:   false,    // Never returned in queries unless explicitly selected
    minlength: 12,  // Matches passwordRules and forgotPassword validator
  },
  twoFactorEnabled: { type: Boolean, default: true },
  totpSecret:       { type: String, default: null, select: false },  // Never returned by default
  totpEnabled:      { type: Boolean, default: false },
  role:             { type: String, default: 'admin', enum: ['admin'] },
  lastLogin:        { type: Date },
  tokenVersion:     { type: Number, default: 0 },
}, { timestamps: true })

// unique:true in field definition already creates the index

// Hash password before save — only if modified
adminSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  // Validate password strength before hashing
  if (this.password.length < 12) throw new Error('Password must be at least 12 characters')
  this.password = await bcrypt.hash(this.password, 12)
})

adminSchema.methods.comparePassword = function (candidate) {
  return require('bcryptjs').compare(candidate, this.password)
}

module.exports = mongoose.model('Admin', adminSchema)
