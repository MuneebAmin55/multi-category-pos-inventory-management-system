/**
 * @file controllers/product.controller.js
 * @description Controller handling product catalog CRUD, search, stock updates, and low-stock queries.
 */

const productService = require('../services/product.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route GET /api/products
 * @desc Get products with search, category, lowStock filter, and pagination
 * @access Private (All roles: Admin, Inventory Manager, Cashier)
 */
const getAllProducts = asyncHandler(async (req, res) => {
  const { search, category, lowStock, expiringSoon, isActive, page, limit } = req.query;
  const result = await productService.listProducts({
    search,
    category,
    lowStock,
    expiringSoon,
    isActive,
    page,
    limit,
  });

  return ApiResponse.success(
    res,
    'Products retrieved successfully',
    result.products,
    result.pagination
  );
});

/**
 * @route GET /api/products/:id
 * @desc Get single product details by UUID
 * @access Private (All roles)
 */
const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);

  return ApiResponse.success(res, 'Product details retrieved successfully', { product });
});

/**
 * @route GET /api/products/sku/:sku
 * @desc Fast lookup by SKU / Barcode (used by scanner/POS and stock checks)
 * @access Private (All roles)
 */
const getProductBySku = asyncHandler(async (req, res) => {
  const product = await productService.getProductBySku(req.params.sku);

  return ApiResponse.success(res, 'Product lookup successful', { product });
});

/**
 * @route POST /api/products
 * @desc Create new product with category details and image upload
 * @access Private (Admin, Inventory Manager)
 */
const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body, req.file);

  return ApiResponse.created(res, 'Product created successfully', { product });
});

/**
 * @route PUT /api/products/:id
 * @desc Update existing product details and category attributes
 * @access Private (Admin, Inventory Manager)
 */
const updateProduct = asyncHandler(async (req, res) => {
  const updatedProduct = await productService.updateProduct(req.params.id, req.body, req.file);

  return ApiResponse.success(res, 'Product updated successfully', { product: updatedProduct });
});

/**
 * @route PATCH /api/products/:id/stock
 * @desc Adjust or set stock quantity directly
 * @access Private (Admin, Inventory Manager)
 */
const updateProductStock = asyncHandler(async (req, res) => {
  const stockResult = await productService.updateProductStock(req.params.id, req.body);

  return ApiResponse.success(res, 'Product stock updated successfully', { stock: stockResult });
});

/**
 * @route DELETE /api/products/:id
 * @desc Deactivate / soft-delete product
 * @access Private (Admin, Inventory Manager)
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const result = await productService.deleteProduct(req.params.id);

  return ApiResponse.success(res, 'Product deactivated successfully', result);
});

/**
 * @route GET /api/products/alerts/low-stock
 * @desc Retrieve all products at or below their reorder threshold
 * @access Private (Admin, Inventory Manager)
 */
const getLowStockAlerts = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await productService.getLowStockProducts({ page, limit });

  return ApiResponse.success(
    res,
    'Low-stock alerts retrieved successfully',
    result.products,
    result.pagination
  );
});

module.exports = {
  getAllProducts,
  getProductById,
  getProductBySku,
  createProduct,
  updateProduct,
  updateProductStock,
  deleteProduct,
  getLowStockAlerts,
};
