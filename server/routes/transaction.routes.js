/**
 * @file routes/transaction.routes.js
 * @description API route definitions for sales transactions, invoice history, and cashier personal sales ledger.
 */

const express = require('express');
const router = express.Router();

const transactionController = require('../controllers/transaction.controller');
const {
  validateTransactionIdParam,
  validateTransactionQuery,
} = require('../validators/transaction.validator');
const validate = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { isInventoryManager } = require('../middlewares/role.middleware');

// All transaction routes require valid JWT authentication
router.use(authenticate);

// ============================================================================
// Cashier "My Sales" - Personal transaction ledger (All authenticated users)
// ============================================================================
router.get('/my-sales', validateTransactionQuery, validate, transactionController.getMySales);

// ============================================================================
// Store-Wide Transactions (Admin & Inventory Manager only)
// ============================================================================
router.get(
  '/',
  isInventoryManager,
  validateTransactionQuery,
  validate,
  transactionController.getAllTransactions
);

// ============================================================================
// Single Invoice / Receipt Lookup (All authenticated roles)
// ============================================================================
router.get('/:id', validateTransactionIdParam, validate, transactionController.getTransactionById);

module.exports = router;
