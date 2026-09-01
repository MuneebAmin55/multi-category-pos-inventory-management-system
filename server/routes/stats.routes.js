/**
 * @file routes/stats.routes.js
 * @description API route definitions for business analytics, dashboards, and inventory reports.
 */

const express = require('express');
const router = express.Router();

const statsController = require('../controllers/stats.controller');
const { query } = require('express-validator');
const validate = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { isAdmin, isInventoryManager } = require('../middlewares/role.middleware');

// All stats routes require valid JWT authentication
router.use(authenticate);

// ============================================================================
// Admin-Only Endpoints
// ============================================================================

// Full admin KPI dashboard (today + all-time revenue, staff counts, 7-day chart)
router.get('/admin/summary', isAdmin, statsController.getAdminDashboardSummary);

// Detailed today's sales report with cashier and payment breakdowns
router.get('/sales/today', isAdmin, statsController.getTodaysSalesReport);

// ============================================================================
// Admin + Inventory Manager Endpoints
// ============================================================================

// Inventory dashboard (category breakdown, low-stock, expiry alerts)
router.get('/inventory/summary', isInventoryManager, statsController.getInventoryDashboardStats);

// Detailed low-stock report grouped by category with severity
router.get('/inventory/low-stock', isInventoryManager, statsController.getLowStockReport);

// Top-selling products with period and limit filters
router.get(
  '/top-products',
  isInventoryManager,
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('limit must be an integer between 1 and 50'),
    query('period')
      .optional()
      .isIn(['today', '7days', '30days', 'all'])
      .withMessage('period must be one of: today, 7days, 30days, all'),
  ],
  validate,
  statsController.getTopSellingProducts
);

module.exports = router;
