/**
 * @file controllers/pos.controller.js
 * @description Controller handling POS scanning, live cart pricing, and checkout operations.
 */

const posService = require('../services/pos.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route GET /api/pos/lookup/:sku
 * @desc Scan-style instant lookup for POS scanner input
 * @access Private (All roles: Cashier, Admin, Manager)
 */
const scanLookup = asyncHandler(async (req, res) => {
  const product = await posService.scanLookup(req.params.sku);

  return ApiResponse.success(res, 'Item found in catalog', { product });
});

/**
 * @route POST /api/pos/calculate
 * @desc Validate live stock and calculate running cart totals (subtotal, tax, grand total)
 * @access Private (All roles)
 */
const calculateCart = asyncHandler(async (req, res) => {
  const { items, taxRate } = req.body;
  const result = await posService.calculateCart(items, taxRate);

  return ApiResponse.success(res, 'Cart calculations completed', result);
});

/**
 * @route POST /api/pos/checkout
 * @desc Process checkout, create transaction, deduct stock, and return receipt
 * @access Private (Cashier, Admin)
 */
const processCheckout = asyncHandler(async (req, res) => {
  const { items, paymentMethod, taxRate } = req.body;
  const cashierId = req.user.id;

  const result = await posService.processCheckout({
    cashierId,
    items,
    paymentMethod,
    taxRate,
  });

  return ApiResponse.created(res, 'Checkout completed successfully', result);
});

module.exports = {
  scanLookup,
  calculateCart,
  processCheckout,
};
