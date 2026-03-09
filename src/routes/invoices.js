const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');
const { createInvoice, listInvoices, updateInvoice, deleteInvoice } = require('../controllers/invoiceController');
const validate = require('../middleware/validate');
const { invoiceSchema } = require('../utils/validate');

router.use(auth);
router.post('/', authorize('admin','manager','agent'), validate(invoiceSchema), createInvoice);
router.get('/', authorize('admin','manager','agent'), listInvoices);
router.put('/:id', authorize('admin','manager'), validate(invoiceSchema), updateInvoice);
router.delete('/:id', authorize('admin'), deleteInvoice);

module.exports = router;
