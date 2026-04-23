const router = require('express').Router();
const ctrl   = require('../controllers/settingsController');
const { auth } = require('../middleware/auth');
const { requireFields, sanitizeBody, validateEmail } = require('../middleware/validate');

router.get('/', auth, ctrl.get);

router.put('/', auth, ctrl.update);

router.put('/profile',
  auth,
  sanitizeBody('name', 'email', 'job_title', 'phone'),
  validateEmail,
  ctrl.updateProfile
);

router.put('/password',
  auth,
  requireFields('current_password', 'new_password'),
  ctrl.updatePassword
);

module.exports = router;