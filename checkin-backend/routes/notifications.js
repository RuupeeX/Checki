const router = require('express').Router();
const ctrl   = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');
const { validateId } = require('../middleware/validate');

router.get('/',            auth, ctrl.getAll);
router.patch('/read-all',  auth, ctrl.markAllRead);
router.patch('/:id/read',  auth, validateId, ctrl.markRead);

module.exports = router;