// server/routes/auth.routes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user (Employee or Admin) and get JWT token
 * @access  Public
 */
router.post('/login', authController.login);

module.exports = router;