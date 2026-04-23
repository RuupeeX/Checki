const router = require('express').Router();
const ctrl   = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { requireFields, sanitizeBody, validateEmail } = require('../middleware/validate');

router.post('/login',
  sanitizeBody('email', 'password'),
  requireFields('email', 'password'),
  validateEmail,
  ctrl.login
);

router.post('/register',
  sanitizeBody('email', 'name', 'password'),
  requireFields('email', 'name', 'password'),
  validateEmail,
  ctrl.register
);

router.get('/me', auth, ctrl.me);

module.exports = router;