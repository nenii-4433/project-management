const express = require('express');
const { login, getMe } = require('../controllers/authController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me (Protected)
router.get('/me', requireAuth, getMe);

module.exports = router;
