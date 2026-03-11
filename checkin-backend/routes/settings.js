const router = require('express').Router();
const ctrl = require('../controllers/settingsController');
const { auth } = require('../middleware/auth');

router.get('/',              auth, ctrl.get);
router.put('/',              auth, ctrl.update);
router.put('/profile',       auth, ctrl.updateProfile);
router.put('/password',      auth, ctrl.updatePassword);

module.exports = router;