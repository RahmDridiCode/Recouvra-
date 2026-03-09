const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');
const { createClient, listClients, updateClient, deleteClient } = require('../controllers/clientController');
const validate = require('../middleware/validate');
const { clientSchema } = require('../utils/validate');

router.use(auth);
router.post('/', authorize('admin'), validate(clientSchema), createClient);
router.get('/', authorize('admin','manager','agent'), listClients);
router.put('/:id', authorize('admin'), updateClient);
router.delete('/:id', authorize('admin'), deleteClient);

module.exports = router;
