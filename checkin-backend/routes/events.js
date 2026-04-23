const router = require('express').Router();
const ctrl   = require('../controllers/eventController');
const { auth } = require('../middleware/auth');
const { requireFields, sanitizeBody, allowedValues, validateId, validateDate } = require('../middleware/validate');
const { EVENT_TYPES } = require('../config/constants');

router.get('/',
  auth,
  validateDate('from', 'query'),
  validateDate('to', 'query'),
  ctrl.getAll
);

router.post('/',
  auth,
  sanitizeBody('title', 'type'),
  requireFields('title', 'date'),
  validateDate('date', 'body'),
  allowedValues('type', EVENT_TYPES),
  ctrl.create
);

router.put('/:id',
  auth,
  validateId,
  sanitizeBody('title', 'type'),
  validateDate('date', 'body'),
  allowedValues('type', EVENT_TYPES),
  ctrl.update
);

router.delete('/:id', auth, validateId, ctrl.remove);

module.exports = router;