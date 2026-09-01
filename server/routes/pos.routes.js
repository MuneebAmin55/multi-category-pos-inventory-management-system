/**
 * @file routes/pos.routes.js
 * @description API route definitions for real-time POS operations, scanning, and checkout.
 */

const express = require('express');
const router = express.Router();

const posController = require('../controllers/pos.controller');
const {
  validateCartCalculation,
  validateCheckout,
} = require('../validators/transaction.validator');
const { validateSkuParam } = require('../validators/product.validator');
const validate = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');

// All POS routes require valid JWT authentication
router.use(authenticate);

// Rapid SKU lookup for POS scanner input
router.get('/lookup/:sku', validateSkuParam, validate, posController.scanLookup);

// Validate stock & calculate live cart totals (Subtotal, Tax, Grand Total)
router.post('/calculate', validateCartCalculation, validate, posController.calculateCart);

// Process checkout, deduct stock, and generate receipt
router.post('/checkout', validateCheckout, validate, posController.processCheckout);

module.exports = router;
