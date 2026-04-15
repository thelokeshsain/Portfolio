const router = require('express').Router()
const { getPortfolio } = require('../controllers/portfolioController')
router.get('/', getPortfolio)
module.exports = router
