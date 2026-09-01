/**
 * @file routes/auth.routes.js
 * @description API route definitions for authentication and profile management.
 */

const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../validators/auth.validator');
const validate = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');

// Public Authentication Routes
router.post('/register', validateRegister, validate, authController.register);
router.post('/login', validateLogin, validate, authController.login);

// Protected Authentication Routes
router.get('/me', authenticate, authController.getMe);

module.exports = router;
