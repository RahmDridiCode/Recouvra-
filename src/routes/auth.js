const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const validate = require('../middleware/validate');
const { loginSchema } = require('../utils/validate');

router.post('/login', validate(loginSchema), login);

module.exports = router;
