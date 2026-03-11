const router = require('express').Router();
const ctrl = require('../controllers/employeeController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/',               auth, adminOnly, ctrl.getAll);
router.get('/stats/departments', auth, adminOnly, ctrl.departmentStats);
router.get('/:id',            auth, ctrl.getById);
router.post('/',              auth, adminOnly, ctrl.create);
router.put('/:id',           auth, adminOnly, ctrl.update);
router.delete('/:id',        auth, adminOnly, ctrl.remove);

module.exports = router;