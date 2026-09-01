/**
 * @file helpers/taxCalculator.helper.js
 * @description Helper utility for cart totals, line subtotals, and flat percentage tax calculation.
 */

const DEFAULT_TAX_RATE = 5.0; // 5.00% standard tax rate

/**
 * Calculate totals for a collection of cart items.
 * @param {Array<{unitPrice: number, quantity: number}>} items - Cart line items
 * @param {number} taxRate - Flat percentage tax rate (default: 5.0%)
 * @returns {{subtotal: number, taxRate: number, taxAmount: number, grandTotal: number}}
 */
const calculateTotals = (items = [], taxRate = DEFAULT_TAX_RATE) => {
  const numericTaxRate = parseFloat(taxRate) >= 0 ? parseFloat(taxRate) : DEFAULT_TAX_RATE;

  // Calculate subtotal from sum of line totals (unitPrice * quantity)
  const subtotal = items.reduce((sum, item) => {
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const quantity = parseInt(item.quantity, 10) || 0;
    const lineTotal = Math.round(unitPrice * quantity * 100) / 100;
    return sum + lineTotal;
  }, 0);

  const roundedSubtotal = Math.round(subtotal * 100) / 100;
  const taxAmount = Math.round(roundedSubtotal * (numericTaxRate / 100) * 100) / 100;
  const grandTotal = Math.round((roundedSubtotal + taxAmount) * 100) / 100;

  return {
    subtotal: roundedSubtotal,
    taxRate: numericTaxRate,
    taxAmount,
    grandTotal,
  };
};

module.exports = {
  DEFAULT_TAX_RATE,
  calculateTotals,
};
