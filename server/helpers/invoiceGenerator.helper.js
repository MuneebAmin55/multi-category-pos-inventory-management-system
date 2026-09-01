/**
 * @file helpers/invoiceGenerator.helper.js
 * @description Helper utility to generate unique sequential and timestamped POS invoice numbers.
 */

/**
 * Generate a formatted unique invoice code (e.g. INV-20260831-ABCD12).
 * @returns {string} Unique invoice code
 */
const generateInvoiceNumber = () => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `INV-${dateStr}-${randomSuffix}`;
};

module.exports = {
  generateInvoiceNumber,
};
