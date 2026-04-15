// SECURITY: NoSQL Injection Sanitizer — Recursively removes keys starting with $ or containing .
// Ensures both object and array request bodies are safe from operator injection attacks.
function sanitizeValue(val) {
  if (val === null || val === undefined) return val
  if (typeof val === 'string') return val
  if (Array.isArray(val)) return val.map(sanitizeValue)  // preserve arrays
  if (typeof val === 'object') return sanitizeObject(val)
  return val
}

function sanitizeObject(obj) {
  // CRITICAL: Never call this on arrays — arrays are handled by sanitizeValue
  if (Array.isArray(obj)) return obj.map(sanitizeValue)
  const clean = {}
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      console.warn(`[Security] NoSQL operator blocked in key: "${key}"`)
      continue
    }
    clean[key] = sanitizeValue(obj[key])
  }
  return clean
}

module.exports = function mongoSanitizeMiddleware(req, _res, next) {
  if (req.body !== null && req.body !== undefined) {
    // Handle both array bodies (e.g. coreStack: ['React','Node'])
    // and object bodies (e.g. hero: {name:'Lokesh',...})
    if (Array.isArray(req.body)) {
      req.body = req.body.map(sanitizeValue)
    } else if (typeof req.body === 'object') {
      req.body = sanitizeObject(req.body)
    }
  }
  next()
}
