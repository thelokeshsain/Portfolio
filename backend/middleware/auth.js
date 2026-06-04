const jwt      = require('jsonwebtoken')
const Admin    = require('../models/Admin')
const RefreshSession = require('../models/RefreshSession')
const blocklist = require('../utils/tokenBlocklist')

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || ''
    if (!authHeader.startsWith('Bearer '))
      return res.status(401).json({ message: 'Authorization header missing or malformed' })

    const token = authHeader.slice(7)
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256'],
        issuer:     'lokesh-portfolio-admin',
        audience:   'lokesh-portfolio-admin',
      })
    } catch (err) {
      const msg = err.name === 'TokenExpiredError'
        ? 'Session expired — please login again'
        : 'Invalid token'
      return res.status(401).json({ message: msg })
    }

    if (decoded.jti && await blocklist.isRevoked(decoded.jti))
      return res.status(401).json({ message: 'Token has been revoked — please login again' })

    const session = await RefreshSession.findOne({
      sessionId: decoded.sid,
      admin: decoded.id,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    }).populate('admin')

    if (!session || !session.admin)
      return res.status(401).json({ message: 'Session expired — please login again' })

    const admin = session.admin

    // Version check: allows global invalidation on password change
    if (decoded.v !== admin.tokenVersion)
      return res.status(401).json({ message: 'Session invalidated — please login again' })

    req.admin        = admin
    req.tokenDecoded = decoded
    req.authSession  = session
    next()
  } catch (err) {
    console.error('Auth middleware error:', err.message)
    res.status(500).json({ message: 'Authentication error' })
  }
}
