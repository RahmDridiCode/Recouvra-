const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');
const { createPayment, listPayments, updatePayment } = require('../controllers/paymentController');
const validate = require('../middleware/validate');
const { paymentSchema, paymentUpdateSchema } = require('../utils/validate');

router.use(auth);
router.post('/', authorize('admin','manager','agent'), validate(paymentSchema), createPayment);
router.get('/', authorize('admin', 'manager', 'agent'), listPayments);
router.put('/:id', authorize('admin', 'manager', 'agent'), validate(paymentUpdateSchema), updatePayment);

module.exports = router;
