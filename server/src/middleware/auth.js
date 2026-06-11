/**
 * Middleware: require authenticated session.
 */
function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Authentication required' });
}

/**
 * Middleware: require PRO tier.
 * Must be used after requireAuth.
 */
function requirePro(req, res, next) {
  if (req.user && req.user.tier === 'PRO') {
    return next();
  }
  return res.status(403).json({ error: 'PRO subscription required' });
}

module.exports = { requireAuth, requirePro };
