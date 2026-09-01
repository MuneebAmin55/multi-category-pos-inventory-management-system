/**
 * @file routes/user.routes.js
 * @description API route definitions for Admin staff management.
 */

const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const {
  validateCreateUser,
  validateUpdateUser,
  validateRoleUpdate,
  validateStatusUpdate,
  validateUserQuery,
  validateUserIdParam,
} = require('../validators/user.validator');
const validate = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

// Protect all user management endpoints with Authentication + Admin Role Middleware
router.use(authenticate, isAdmin);

// List & Search users
router.get('/', validateUserQuery, validate, userController.getAllUsers);

// Create user
router.post('/', validateCreateUser, validate, userController.createUser);

// Get single user by ID
router.get('/:id', validateUserIdParam, validate, userController.getUserById);

// Update user details
router.put('/:id', validateUpdateUser, validate, userController.updateUser);

// Update / Assign user role
router.patch('/:id/role', validateRoleUpdate, validate, userController.updateUserRole);

// Activate / Deactivate user status
router.patch('/:id/status', validateStatusUpdate, validate, userController.toggleUserStatus);

module.exports = router;
