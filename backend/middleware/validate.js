// SECURITY: Centralized input validation and sanitization using express-validator.
// Blocks XSS pseudo-protocols and enforces strong password policies.
const { body, param, validationResult } = require('express-validator')

const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: errors.array()[0].msg })
    }
    next()
  },
]

// Safe URL validator — blocks javascript:, data:, and relative URLs
function isSafeUrl(val) {
  if (!val) return true // optional field
  try {
    const u = new URL(val)
    return ['http:', 'https:'].includes(u.protocol)
  } catch {
    return false
  }
}

// Contact form
const contactRules = validate([
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters')
    .escape(),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .isLength({ max: 254 }).withMessage('Email too long')
    .normalizeEmail(),
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Message must be 10–2000 characters')
    .escape(),
])

// Login
const loginRules = validate([
  body('email').trim().notEmpty().isEmail().normalizeEmail(),
  body('password').notEmpty().isLength({ max: 128 }),
])

// Fix H-04: stronger password — min 12, uppercase, lowercase, number, special char
const passwordRules = validate([
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword')
    .isLength({ min: 12, max: 128 }).withMessage('Password must be 12–128 characters')
    .matches(/[A-Z]/).withMessage('Must contain an uppercase letter')
    .matches(/[a-z]/).withMessage('Must contain a lowercase letter')
    .matches(/[0-9]/).withMessage('Must contain a number')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/).withMessage('Must contain a special character'),
])

// Fix QA-03: Validate hero URL fields — reject javascript:/data: schemes
const heroUrlRules = validate([
  body('github').optional({ nullable: true }).custom(isSafeUrl).withMessage('GitHub URL must use http:// or https://'),
  body('linkedin').optional({ nullable: true }).custom(isSafeUrl).withMessage('LinkedIn URL must use http:// or https://'),
  body('resumeUrl').optional({ nullable: true }).custom(isSafeUrl).withMessage('Resume URL must use http:// or https://'),
])

// Project URL validation
const projectUrlRules = validate([
  body('*.link').optional({ nullable: true }).custom(isSafeUrl).withMessage('Live URL must use http:// or https://'),
  body('*.github').optional({ nullable: true }).custom(isSafeUrl).withMessage('GitHub URL must use http:// or https://'),
])

// Forgot password (request OTP)
const forgotPasswordRules = validate([
  body('email').trim().notEmpty().isEmail().normalizeEmail(),
])

// Reset password (verify OTP + new password)
const resetPasswordRules = validate([
  body('token').notEmpty().isHexadecimal().isLength({ min: 64, max: 64 }),
  body('code').notEmpty().isString().isLength({ min: 6, max: 6 }),
  body('newPassword')
    .isLength({ min: 12, max: 128 }).withMessage('Password must be 12–128 characters')
    .matches(/[A-Z]/).withMessage('Must contain an uppercase letter')
    .matches(/[a-z]/).withMessage('Must contain a lowercase letter')
    .matches(/[0-9]/).withMessage('Must contain a number')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/).withMessage('Must contain a special character'),
])

module.exports = { 
  contactRules, 
  loginRules, 
  passwordRules, 
  heroUrlRules, 
  projectUrlRules, 
  forgotPasswordRules,
  resetPasswordRules,
  isSafeUrl 
}
