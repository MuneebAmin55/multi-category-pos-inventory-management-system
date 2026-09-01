/**
 * @file controllers/stats.controller.js
 * @description Controller handling analytics and reporting HTTP endpoints.
 */

const statsService = require('../services/stats.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route GET /api/stats/admin/summary
 * @desc Admin dashboard - full KPI summary: today vs all-time revenue, inventory counts, 7-day chart
 * @access Private (Admin only)
 */
const getAdminDashboardSummary = asyncHandler(async (req, res) => {
  const data = await statsService.getAdminDashboardSummary();
  return ApiResponse.success(res, 'Admin dashboard statistics retrieved successfully', data);
});

/**
 * @route GET /api/stats/inventory/summary
 * @desc Inventory Manager dashboard - product counts, category breakdown, low-stock, expiry alerts
 * @access Private (Admin, Inventory Manager)
 */
const getInventoryDashboardStats = asyncHandler(async (req, res) => {
  const data = await statsService.getInventoryDashboardStats();
  return ApiResponse.success(res, 'Inventory dashboard statistics retrieved successfully', data);
});

/**
 * @route GET /api/stats/top-products
 * @desc Top-selling products by quantity sold and gross revenue
 * @access Private (Admin, Inventory Manager)
 * @query {number} limit - Number of products to return (default: 10, max: 50)
 * @query {string} period - 'today' | '7days' | '30days' | 'all' (default: 'all')
 */
const getTopSellingProducts = asyncHandler(async (req, res) => {
  const { limit, period } = req.query;
  const data = await statsService.getTopSellingProducts(limit, period);
  return ApiResponse.success(res, 'Top-selling products retrieved successfully', data);
});

/**
 * @route GET /api/stats/sales/today
 * @desc Detailed report of all transactions processed today with cashier and payment breakdowns
 * @access Private (Admin only)
 */
const getTodaysSalesReport = asyncHandler(async (req, res) => {
  const data = await statsService.getTodaysSalesReport();
  return ApiResponse.success(res, "Today's sales report retrieved successfully", data);
});

/**
 * @route GET /api/stats/inventory/low-stock
 * @desc Detailed low-stock report grouped by category with out-of-stock severity flags
 * @access Private (Admin, Inventory Manager)
 */
const getLowStockReport = asyncHandler(async (req, res) => {
  const data = await statsService.getLowStockReport();
  return ApiResponse.success(res, 'Low-stock report retrieved successfully', data);
});

module.exports = {
  getAdminDashboardSummary,
  getInventoryDashboardStats,
  getTopSellingProducts,
  getTodaysSalesReport,
  getLowStockReport,
};
