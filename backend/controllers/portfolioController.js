// Portfolio Controller — Provides public access to portfolio data.
// Sensitive personal contact details (like phone number) are explicitly excluded.
const Portfolio = require('../models/Portfolio')

exports.getPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne().select('-__v').lean()
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found. Run: npm run seed' })
    }

    // Issue #24: Remove phone from public response — it's a personal contact detail
    // Phone is only visible directly to users who contact via email/form
    if (portfolio.hero) {
      const { phone: _phone, ...heroPublic } = portfolio.hero
      portfolio.hero = heroPublic
    }

    res.json(portfolio)
  } catch (err) {
    console.error('[Portfolio]', err.message)
    res.status(500).json({ message: 'Failed to load portfolio data' })
  }
}
