const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');
const { stats } = require('../controllers/statsController');

router.use(auth);
router.get('/', authorize('admin','manager','agent'), stats);

module.exports = router;
