const crypto = require('crypto')

module.exports = function tokenHash(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex')
}
