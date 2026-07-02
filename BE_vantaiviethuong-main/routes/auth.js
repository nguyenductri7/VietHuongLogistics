const express = require('express');
const router = express.Router();
const { login, getMe, changePassword } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', authMiddleware, getMe);

router.post('/change-password', authMiddleware, changePassword);

module.exports = router;
