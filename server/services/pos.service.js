/**
 * @file services/pos.service.js
 * @description Core service handling real-time POS scanning, live cart pricing, stock validation, and atomic checkout transactions.
 */

const {
  sequelize,
  Product,
  Transaction,
  TransactionItem,
  User,
  FragileDetail,
  ColdDetail,
  TechDetail,
  CleaningDetail,
} = require('../models');
const { calculateTotals, DEFAULT_TAX_RATE } = require('../helpers/taxCalculator.helper');
const { generateInvoiceNumber } = require('../helpers/invoiceGenerator.helper');
const { enrichProductExpiryInfo } = require('../helpers/expiryChecker.helper');
const { PAYMENT_METHODS } = require('../constants/paymentMethods.constant');
const ApiError = require('../utils/apiError');

/**
 * Scan-style rapid lookup by SKU for POS screen.
 */
const scanLookup = async (sku) => {
  const product = await Product.findOne({
    where: { sku: sku.trim(), isActive: true },
    include: [
      { model: FragileDetail, as: 'fragileDetail' },
      { model: ColdDetail, as: 'coldDetail' },
      { model: TechDetail, as: 'techDetail' },
      { model: CleaningDetail, as: 'cleaningDetail' },
    ],
  });

  if (!product) {
    throw ApiError.notFound(`Product with SKU '${sku}' not found or is inactive.`);
  }

  if (product.quantityInStock <= 0) {
    throw ApiError.badRequest(`'${product.name}' is currently OUT OF STOCK.`);
  }

  return enrichProductExpiryInfo(product);
};

/**
 * Calculate live cart totals against active database prices and check stock sufficiency.
 */
const calculateCart = async (cartItems = [], taxRate = DEFAULT_TAX_RATE) => {
  const enrichedItems = [];
  const stockErrors = [];

  for (const item of cartItems) {
    const product = await Product.findByPk(item.productId);

    if (!product || !product.isActive) {
      stockErrors.push({
        productId: item.productId,
        message: 'Product not found or is inactive',
      });
      continue;
    }

    const requestedQty = parseInt(item.quantity, 10);
    const unitPrice = parseFloat(product.price);
    const lineTotal = Math.round(unitPrice * requestedQty * 100) / 100;
    const isAvailable = product.quantityInStock >= requestedQty;

    if (!isAvailable) {
      stockErrors.push({
        productId: product.id,
        sku: product.sku,
        name: product.name,
        requestedQty,
        availableStock: product.quantityInStock,
        message: `Insufficient stock. Only ${product.quantityInStock} available.`,
      });
    }

    enrichedItems.push({
      productId: product.id,
      sku: product.sku,
      name: product.name,
      category: product.category,
      imageUrl: product.imageUrl,
      unitPrice,
      quantity: requestedQty,
      availableStock: product.quantityInStock,
      isAvailable,
      lineTotal,
    });
  }

  const totals = calculateTotals(enrichedItems, taxRate);

  return {
    items: enrichedItems,
    ...totals,
    hasStockErrors: stockErrors.length > 0,
    stockErrors,
  };
};

/**
 * Atomic checkout execution with row locking, stock decrements, invoice creation, and receipt generation.
 */
const processCheckout = async ({
  cashierId,
  items = [],
  paymentMethod = PAYMENT_METHODS.CASH,
  taxRate = DEFAULT_TAX_RATE,
}) => {
  if (!items || items.length === 0) {
    throw ApiError.badRequest('Cannot checkout with an empty cart.');
  }

  // Execute entire checkout inside a managed database transaction
  const receipt = await sequelize.transaction(async (t) => {
    const preparedLineItems = [];
    const stockViolations = [];

    for (const item of items) {
      const requestedQty = parseInt(item.quantity, 10);

      // Lock the product row for update to prevent concurrent race conditions
      const product = await Product.findByPk(item.productId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!product || !product.isActive) {
        throw ApiError.badRequest(`Product with ID '${item.productId}' is no longer available.`);
      }

      // Strict validation: cannot order more than current stock (no negative stock allowed)
      if (product.quantityInStock < requestedQty) {
        stockViolations.push(
          `'${product.name}' (SKU: ${product.sku}): requested ${requestedQty}, but only ${product.quantityInStock} in stock.`
        );
      }

      // Decrement stock in database
      product.quantityInStock -= requestedQty;
      await product.save({ transaction: t });

      const unitPrice = parseFloat(product.price);
      const lineTotal = Math.round(unitPrice * requestedQty * 100) / 100;

      preparedLineItems.push({
        productId: product.id,
        productNameSnapshot: product.name,
        skuSnapshot: product.sku,
        unitPrice,
        quantity: requestedQty,
        lineTotal,
      });
    }

    if (stockViolations.length > 0) {
      throw ApiError.badRequest(
        `Checkout aborted due to insufficient stock:\n- ${stockViolations.join('\n- ')}`
      );
    }

    // Calculate invoice totals
    const { subtotal, taxAmount, grandTotal } = calculateTotals(preparedLineItems, taxRate);
    const invoiceNumber = generateInvoiceNumber();

    // Create Transaction Header Record
    const transaction = await Transaction.create(
      {
        invoiceNumber,
        cashierId,
        subtotal,
        taxRate,
        taxAmount,
        grandTotal,
        paymentMethod,
      },
      { transaction: t }
    );

    // Create Transaction Items
    const lineItemRecords = preparedLineItems.map((item) => ({
      ...item,
      transactionId: transaction.id,
    }));

    await TransactionItem.bulkCreate(lineItemRecords, { transaction: t });

    return {
      transactionId: transaction.id,
      invoiceNumber: transaction.invoiceNumber,
      createdAt: transaction.createdAt,
      paymentMethod: transaction.paymentMethod,
      subtotal: transaction.subtotal,
      taxRate: transaction.taxRate,
      taxAmount: transaction.taxAmount,
      grandTotal: transaction.grandTotal,
      items: preparedLineItems,
    };
  });

  // Fetch cashier metadata for formatted receipt
  const cashier = await User.findByPk(cashierId, {
    attributes: ['id', 'name', 'email'],
  });

  return {
    receipt: {
      storeName: 'Mart POS & Retail',
      invoiceNumber: receipt.invoiceNumber,
      date: receipt.createdAt,
      cashier: cashier
        ? { id: cashier.id, name: cashier.name }
        : { id: cashierId, name: 'Cashier' },
      paymentMethod: receipt.paymentMethod,
      items: receipt.items,
      subtotal: receipt.subtotal,
      taxRate: receipt.taxRate,
      taxAmount: receipt.taxAmount,
      grandTotal: receipt.grandTotal,
      footerMessage:
        'Thank you for shopping with us! Please retain this receipt for warranty and returns.',
    },
  };
};

module.exports = {
  scanLookup,
  calculateCart,
  processCheckout,
};
