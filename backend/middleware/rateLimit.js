/**
 * Rate Limiting Middleware
 * Fix H-05: proxy-aware keyGenerator
 * Exports `make` so callers can create custom limiters
 */
const rateLimit = require('express-rate-limit')

const make = (windowMinutes, max, message) => rateLimit({
  windowMs:        windowMinutes * 60 * 1000,
  max,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { message },
  // SECURITY: Rely on default behavior (req.ip) calibrated by app.set('trust proxy', 1) in server.js
  // This is the most secure and reliable pattern for Render/v8.x
  skipSuccessfulRequests: false,
})

const twoFALimiter     = make(15, 5,   'Too many verification attempts. Please wait 15 minutes.')
const loginLimiter     = make(15, 10,  'Too many login attempts. Please wait 15 minutes.')
const refreshLimiter   = make(15, 5,   'Too many session refresh attempts. Please wait 15 minutes.')
const contactLimiter   = make(15, 3,   'Too many messages sent. Please wait 15 minutes.')
const generalLimiter   = make(15, 100, 'Too many requests. Please slow down.')

module.exports = { make, loginLimiter, twoFALimiter, refreshLimiter, contactLimiter, generalLimiter }