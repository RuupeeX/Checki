const router = require('express').Router();
const ctrl   = require('../controllers/reportController');
const { auth, adminOnly } = require('../middleware/auth');
const { requireFields, sanitizeBody, allowedValues, validateId, validatePagination } = require('../middleware/validate');
const { REPORT_STATUSES } = require('../config/constants');

router.get('/',    auth, validatePagination, ctrl.getAll);
router.get('/stats', auth, ctrl.stats);

router.post('/',
  auth,
  sanitizeBody('type', 'description', 'reason'),
  requireFields('type', 'date'),
  ctrl.create
);

router.patch('/:id/status',
  auth, adminOnly,
  validateId,
  requireFields('status'),
  allowedValues('status', REPORT_STATUSES),
  ctrl.updateStatus
);

router.delete('/:id', auth, validateId, ctrl.remove);

module.exports = router;