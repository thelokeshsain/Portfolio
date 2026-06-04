/**
 * Admin Routes — v15
 * Added: forgot-password and reset-password (OTP flow, no auth required)
 */
const router = require('express').Router()
const auth   = require('../middleware/auth')
const csrf   = require('../middleware/csrf')
const { loginLimiter, twoFALimiter, refreshLimiter, make } = require('../middleware/rateLimit')
const { loginRules, forgotPasswordRules, resetPasswordRules, changePasswordOtpRules } = require('../middleware/validate')
const adminController   = require('../controllers/adminController')
const contactController = require('../controllers/contactController')

// Strict rate limit for password reset (3 attempts per 15 min)
const resetLimiter = make(15, 3, 'Too many reset attempts. Please wait 15 minutes.')

// Public (no auth)
router.post  ('/login',             loginLimiter,  loginRules,          adminController.login)
router.post  ('/verify-2fa',        twoFALimiter,                       adminController.verifyTwoFactor)
router.post  ('/refresh-token',     refreshLimiter,                     adminController.refreshToken)
router.post  ('/forgot-password',   resetLimiter,  forgotPasswordRules, adminController.forgotPassword)
router.post  ('/reset-password',    resetLimiter,  resetPasswordRules,  adminController.resetPassword)

// Apply authentication and CSRF protection to all subsequent routes
router.use(auth)
router.use(csrf)

// Protected (auth required, CSRF enforced for write methods)
router.post  ('/logout',            adminController.logout)
router.get   ('/me',                adminController.getMe)
router.post  ('/setup-totp',        adminController.setupTotp)
router.post  ('/enable-totp',       adminController.enableTotp)
router.delete('/disable-totp',      adminController.disableTotp)
router.put   ('/portfolio/:section', adminController.updateSection)
router.put   ('/password',           changePasswordOtpRules,         adminController.changePassword)

// Contact management
router.get   ('/contacts',          contactController.getContacts)
router.put   ('/contacts/:id/read', contactController.markRead)
router.delete('/contacts/:id',      contactController.deleteContact)
router.delete('/contacts',          contactController.deleteAllRead)

module.exports = router