/**
 * @file controllers/transaction.controller.js
 * @description Controller handling invoice history, cashier "My Sales", and receipt lookup.
 */

const transactionService = require('../services/transaction.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route GET /api/transactions/my-sales
 * @desc Get personal transaction history for the authenticated cashier
 * @access Private (Cashier, Admin, Manager)
 */
const getMySales = asyncHandler(async (req, res) => {
  const { startDate, endDate, page, limit } = req.query;
  const result = await transactionService.getCashierSales(req.user.id, {
    startDate,
    endDate,
    page,
    limit,
  });

  return ApiResponse.success(
    res,
    'Cashier sales history retrieved successfully',
    result.transactions,
    result.pagination
  );
});

/**
 * @route GET /api/transactions
 * @desc Get store-wide transaction history with filters
 * @access Private (Admin, Inventory Manager)
 */
const getAllTransactions = asyncHandler(async (req, res) => {
  const { cashierId, startDate, endDate, page, limit } = req.query;
  const result = await transactionService.getAllStoreTransactions({
    cashierId,
    startDate,
    endDate,
    page,
    limit,
  });

  return ApiResponse.success(
    res,
    'Store transactions retrieved successfully',
    result.transactions,
    result.pagination
  );
});

/**
 * @route GET /api/transactions/:id
 * @desc Get specific transaction receipt / invoice details
 * @access Private (All roles)
 */
const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await transactionService.getTransactionById(req.params.id, req.user);

  return ApiResponse.success(res, 'Transaction retrieved successfully', { transaction });
});

module.exports = {
  getMySales,
  getAllTransactions,
  getTransactionById,
};
