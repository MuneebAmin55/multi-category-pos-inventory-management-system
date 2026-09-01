/**
 * @file validators/user.validator.js
 * @description express-validator validation rules for Admin user management endpoints.
 */

const { body, param, query } = require('express-validator');
const { ALL_ROLES } = require('../constants/roles.constant');

const validateUserIdParam = [param('id').isUUID(4).withMessage('User ID must be a valid UUIDv4')];

const validateCreateUser = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(ALL_ROLES)
    .withMessage(`Role must be one of: ${ALL_ROLES.join(', ')}`),
];

const validateUpdateUser = [
  ...validateUserIdParam,

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  body('role')
    .optional()
    .isIn(ALL_ROLES)
    .withMessage(`Role must be one of: ${ALL_ROLES.join(', ')}`),

  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean value'),
];

const validateRoleUpdate = [
  ...validateUserIdParam,

  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(ALL_ROLES)
    .withMessage(`Role must be one of: ${ALL_ROLES.join(', ')}`),
];

const validateStatusUpdate = [
  ...validateUserIdParam,

  body('isActive')
    .notEmpty()
    .withMessage('isActive status is required')
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

const validateUserQuery = [
  query('search').optional().trim(),

  query('role')
    .optional()
    .isIn(ALL_ROLES)
    .withMessage(`Role filter must be one of: ${ALL_ROLES.join(', ')}`),

  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive filter must be boolean (true/false)'),

  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

module.exports = {
  validateUserIdParam,
  validateCreateUser,
  validateUpdateUser,
  validateRoleUpdate,
  validateStatusUpdate,
  validateUserQuery,
};
