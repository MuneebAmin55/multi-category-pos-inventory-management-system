/**
 * @file validators/transaction.validator.js
 * @description express-validator validation rules for POS cart calculation and checkout operations.
 */

const { body, param, query } = require('express-validator');
const { ALL_PAYMENT_METHODS } = require('../constants/paymentMethods.constant');

const validateTransactionIdParam = [
  param('id').isUUID(4).withMessage('Transaction ID must be a valid UUIDv4'),
];

const validateCartCalculation = [
  body('items').isArray({ min: 1 }).withMessage('Cart items must be a non-empty array'),

  body('items.*.productId')
    .notEmpty()
    .withMessage('Each item must have a valid productId')
    .isUUID(4)
    .withMessage('productId must be a valid UUIDv4'),

  body('items.*.quantity')
    .notEmpty()
    .withMessage('Each item must have a quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be an integer >= 1'),

  body('taxRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('taxRate must be a non-negative number'),
];

const validateCheckout = [
  body('items').isArray({ min: 1 }).withMessage('Cart items must be a non-empty array'),

  body('items.*.productId')
    .notEmpty()
    .withMessage('Each item must have a valid productId')
    .isUUID(4)
    .withMessage('productId must be a valid UUIDv4'),

  body('items.*.quantity')
    .notEmpty()
    .withMessage('Each item must have a quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be an integer >= 1'),

  body('paymentMethod')
    .optional()
    .isIn(ALL_PAYMENT_METHODS)
    .withMessage(`Payment method must be one of: ${ALL_PAYMENT_METHODS.join(', ')}`),

  body('taxRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('taxRate must be a non-negative number'),
];

const validateTransactionQuery = [
  query('startDate').optional().isISO8601().withMessage('startDate must be a valid ISO date'),

  query('endDate').optional().isISO8601().withMessage('endDate must be a valid ISO date'),

  query('cashierId').optional().isUUID(4).withMessage('cashierId must be a valid UUIDv4'),

  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

module.exports = {
  validateTransactionIdParam,
  validateCartCalculation,
  validateCheckout,
  validateTransactionQuery,
};
