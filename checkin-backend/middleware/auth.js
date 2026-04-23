const jwt = require('jsonwebtoken');
const { ERRORS } = require('../config/constants');

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: ERRORS.NO_TOKEN });
  }

  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: ERRORS.INVALID_TOKEN });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: ERRORS.ADMIN_ONLY });
  }
  next();
}

module.exports = { auth, adminOnly };