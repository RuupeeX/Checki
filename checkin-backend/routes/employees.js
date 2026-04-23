const router = require('express').Router();
const ctrl   = require('../controllers/employeeController');
const { auth, adminOnly } = require('../middleware/auth');
const { requireFields, sanitizeBody, validateEmail, validateId, validatePagination } = require('../middleware/validate');

router.get('/',
  auth, adminOnly,
  validatePagination,
  ctrl.getAll
);

router.get('/stats/departments', auth, adminOnly, ctrl.departmentStats);

router.get('/:id', auth, validateId, ctrl.getById);

router.post('/',
  auth, adminOnly,
  sanitizeBody('email', 'name', 'job_title', 'phone'),
  requireFields('email', 'name'),
  validateEmail,
  ctrl.create
);

router.put('/:id',
  auth, adminOnly,
  validateId,
  sanitizeBody('email', 'name', 'job_title', 'phone'),
  validateEmail,
  ctrl.update
);

router.delete('/:id', auth, adminOnly, validateId, ctrl.remove);

module.exports = router;