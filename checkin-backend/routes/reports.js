const router = require('express').Router();
const ctrl = require('../controllers/reportController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/',              auth, ctrl.getAll);
router.get('/stats',         auth, ctrl.stats);
router.post('/',             auth, ctrl.create);
router.patch('/:id/status',  auth, adminOnly, ctrl.updateStatus);
router.delete('/:id',       auth, ctrl.remove);

module.exports = router;