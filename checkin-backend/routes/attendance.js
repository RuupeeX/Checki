const router = require('express').Router();
const ctrl = require('../controllers/attendanceController');
const { auth, adminOnly } = require('../middleware/auth');

router.post('/check-in',     auth, ctrl.checkIn);
router.post('/check-out',    auth, ctrl.checkOut);
router.post('/break/start',  auth, ctrl.startBreak);
router.post('/break/end',    auth, ctrl.endBreak);
router.get('/today',         auth, ctrl.getToday);
router.get('/history',       auth, ctrl.getHistory);
router.get('/weekly-stats',  auth, adminOnly, ctrl.weeklyStats);

module.exports = router;