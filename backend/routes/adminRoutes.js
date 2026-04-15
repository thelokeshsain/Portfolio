/**
 * Admin Routes — v15
 * Added: forgot-password and reset-password (OTP flow, no auth required)
 */
const router = require('express').Router()
const auth   = require('../middleware/auth')
const { loginLimiter, twoFALimiter, refreshLimiter, make } = require('../middleware/rateLimit')
const { loginRules, passwordRules, forgotPasswordRules, resetPasswordRules } = require('../middleware/validate')
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

// Protected (auth required)
router.post  ('/logout',            auth,                         adminController.logout)
router.get   ('/me',                auth,                         adminController.getMe)
router.post  ('/setup-totp',        auth,                         adminController.setupTotp)
router.post  ('/enable-totp',       auth,                         adminController.enableTotp)
router.delete('/disable-totp',      auth,                         adminController.disableTotp)
router.put   ('/portfolio/:section', auth,                        adminController.updateSection)
router.put   ('/password',           auth, passwordRules,         adminController.changePassword)

// Contact management
router.get   ('/contacts',          auth,                         contactController.getContacts)
router.put   ('/contacts/:id/read', auth,                         contactController.markRead)
router.delete('/contacts/:id',      auth,                         contactController.deleteContact)
router.delete('/contacts',          auth,                         contactController.deleteAllRead)

module.exports = router