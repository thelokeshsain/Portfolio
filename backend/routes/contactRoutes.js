const router = require('express').Router()
const { contactLimiter } = require('../middleware/rateLimit')
const { contactRules }   = require('../middleware/validate')
const contactController = require('../controllers/contactController')

router.post('/', contactLimiter, contactRules, contactController.submit)  // Issue #5: validation applied
module.exports = router
