/**
 * @file validators/product.validator.js
 * @description express-validator validation rules for Product CRUD and category-specific details.
 */

const { body, param, query } = require('express-validator');
const { ALL_CATEGORIES, CATEGORIES } = require('../constants/categories.constant');

const validateProductIdParam = [
  param('id').isUUID(4).withMessage('Product ID must be a valid UUIDv4'),
];

const validateSkuParam = [
  param('sku').trim().notEmpty().withMessage('SKU / Barcode parameter is required'),
];

const validateCreateProduct = [
  body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU / Barcode is required')
    .isLength({ min: 2, max: 64 })
    .withMessage('SKU must be between 2 and 64 characters'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Product name must be between 2 and 255 characters'),

  body('description').optional().trim(),

  body('category')
    .notEmpty()
    .withMessage('Product category is required')
    .isIn(ALL_CATEGORIES)
    .withMessage(`Category must be one of: ${ALL_CATEGORIES.join(', ')}`),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number greater than 0'),

  body('quantityInStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity in stock must be an integer >= 0'),

  body('reorderThreshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Reorder threshold must be an integer >= 0'),

  // Conditional Category-Specific Fields Validation
  // 1. Fragile Category Validation
  body('handlingNote').if(body('category').equals(CATEGORIES.FRAGILE)).optional().trim(),

  body('isFragile')
    .if(body('category').equals(CATEGORIES.FRAGILE))
    .optional()
    .isBoolean()
    .withMessage('isFragile must be a boolean value'),

  // 2. Cold / Perishable Category Validation
  body('expiryDate')
    .if(body('category').equals(CATEGORIES.COLD))
    .notEmpty()
    .withMessage('Expiry date is required for Cold/Perishable products')
    .isISO8601()
    .withMessage('Expiry date must be a valid date in YYYY-MM-DD format'),

  body('storageTemp')
    .if(body('category').equals(CATEGORIES.COLD))
    .trim()
    .notEmpty()
    .withMessage('Storage temperature is required for Cold/Perishable products (e.g. -18°C)'),

  // 3. Tech / Electronics Category Validation
  body('warrantyPeriod')
    .if(body('category').equals(CATEGORIES.TECH))
    .optional()
    .isInt({ min: 0 })
    .withMessage('Warranty period must be an integer >= 0 (in months)'),

  body('serialNumber')
    .if(body('category').equals(CATEGORIES.TECH))
    .trim()
    .notEmpty()
    .withMessage('Serial number is required for Tech/Electronics products'),

  // 4. Cleaning Products Category Validation
  body('isHazardous')
    .if(body('category').equals(CATEGORIES.CLEANING))
    .optional()
    .isBoolean()
    .withMessage('isHazardous must be a boolean value'),

  body('safetyNote').if(body('category').equals(CATEGORIES.CLEANING)).optional().trim(),
];

const validateUpdateProduct = [
  ...validateProductIdParam,

  body('sku')
    .optional()
    .trim()
    .isLength({ min: 2, max: 64 })
    .withMessage('SKU must be between 2 and 64 characters'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Product name must be between 2 and 255 characters'),

  body('description').optional().trim(),

  body('category')
    .optional()
    .isIn(ALL_CATEGORIES)
    .withMessage(`Category must be one of: ${ALL_CATEGORIES.join(', ')}`),

  body('price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number greater than 0'),

  body('quantityInStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity in stock must be an integer >= 0'),

  body('reorderThreshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Reorder threshold must be an integer >= 0'),

  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean value'),

  // Category specific optional updates
  body('expiryDate').optional().isISO8601().withMessage('Expiry date must be in YYYY-MM-DD format'),

  body('warrantyPeriod')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Warranty period must be an integer >= 0'),
];

const validateStockUpdate = [
  ...validateProductIdParam,

  body('quantityInStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity in stock must be a non-negative integer'),

  body('adjustment')
    .optional()
    .isInt()
    .withMessage('Adjustment must be an integer (positive to add, negative to subtract)'),

  body().custom((value, { req }) => {
    if (req.body.quantityInStock === undefined && req.body.adjustment === undefined) {
      throw new Error(
        'Either quantityInStock (absolute) or adjustment (relative) must be provided.'
      );
    }
    return true;
  }),
];

const validateProductQuery = [
  query('search').optional().trim(),

  query('category')
    .optional()
    .isIn(ALL_CATEGORIES)
    .withMessage(`Category filter must be one of: ${ALL_CATEGORIES.join(', ')}`),

  query('lowStock')
    .optional()
    .isBoolean()
    .withMessage('lowStock filter must be boolean (true/false)'),

  query('expiringSoon')
    .optional()
    .isBoolean()
    .withMessage('expiringSoon filter must be boolean (true/false)'),

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
  validateProductIdParam,
  validateSkuParam,
  validateCreateProduct,
  validateUpdateProduct,
  validateStockUpdate,
  validateProductQuery,
};
