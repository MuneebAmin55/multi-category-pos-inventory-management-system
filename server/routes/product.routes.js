/**
 * @file routes/product.routes.js
 * @description API route definitions for products, category attributes, and inventory control.
 */

const express = require('express');
const router = express.Router();

const productController = require('../controllers/product.controller');
const {
  validateCreateProduct,
  validateUpdateProduct,
  validateStockUpdate,
  validateProductQuery,
  validateProductIdParam,
  validateSkuParam,
} = require('../validators/product.validator');
const validate = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { isInventoryManager } = require('../middlewares/role.middleware');
const { uploadSingleImage } = require('../middlewares/upload.middleware');

// All product routes require valid authentication
router.use(authenticate);

// ============================================================================
// Public / Read Endpoints (Accessible by Admin, Inventory Manager, Cashier)
// ============================================================================

// List & search products with filtering & pagination
router.get('/', validateProductQuery, validate, productController.getAllProducts);

// Fast SKU / Barcode lookup
router.get('/sku/:sku', validateSkuParam, validate, productController.getProductBySku);

// Low-stock alerts list (Admin & Manager only)
router.get(
  '/alerts/low-stock',
  isInventoryManager,
  validateProductQuery,
  validate,
  productController.getLowStockAlerts
);

// Get single product by UUID
router.get('/:id', validateProductIdParam, validate, productController.getProductById);

// ============================================================================
// Management Endpoints (Restricted to Admin & Inventory Manager)
// ============================================================================

// Create new product (with optional image upload)
router.post(
  '/',
  isInventoryManager,
  uploadSingleImage('image'),
  validateCreateProduct,
  validate,
  productController.createProduct
);

// Update existing product details & category extensions (with optional image upload)
router.put(
  '/:id',
  isInventoryManager,
  uploadSingleImage('image'),
  validateUpdateProduct,
  validate,
  productController.updateProduct
);

// Adjust or set product stock quantity
router.patch(
  '/:id/stock',
  isInventoryManager,
  validateStockUpdate,
  validate,
  productController.updateProductStock
);

// Deactivate / Soft delete product
router.delete(
  '/:id',
  isInventoryManager,
  validateProductIdParam,
  validate,
  productController.deleteProduct
);

module.exports = router;
