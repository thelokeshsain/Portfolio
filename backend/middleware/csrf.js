const crypto = require("crypto");

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

module.exports = (req, res, next) => {
  // GET, HEAD, OPTIONS are safe methods and don't need CSRF validation
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // If there's no authSession, we cannot validate CSRF (e.g. login / public endpoints)
  if (!req.authSession) {
    return next();
  }

  const headerToken = req.get("x-csrf-token");
  const cookieToken = req.cookies.csrfToken;

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    console.warn(`[SECURITY] CSRF verification failed: token mismatch or missing [Path: ${req.path}]`);
    return res.status(403).json({ message: "Invalid CSRF token" });
  }

  const expectedHash = req.authSession.csrfTokenHash;
  const actualHash = hashToken(headerToken);

  const a = Buffer.from(expectedHash);
  const b = Buffer.from(actualHash);

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    console.warn(`[SECURITY] CSRF verification failed: hash mismatch [Path: ${req.path}]`);
    return res.status(403).json({ message: "Invalid CSRF token" });
  }

  next();
};
