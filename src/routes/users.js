const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');
const { createUser, listUsers, updateUser, deleteUser } = require('../controllers/userController');
const validate = require('../middleware/validate');
const { userSchema } = require('../utils/validate');

router.use(auth);
router.post('/', authorize('admin'), validate(userSchema), createUser);
router.get('/', authorize('admin'), listUsers);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
