const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');
const { createAction, listActions } = require('../controllers/recoveryController');
const validate = require('../middleware/validate');
const { recoverySchema } = require('../utils/validate');

router.use(auth);
router.post('/', authorize('admin','manager','agent'), validate(recoverySchema), createAction);
router.get('/', authorize('admin', 'manager', 'agent'), listActions);

module.exports = router;
