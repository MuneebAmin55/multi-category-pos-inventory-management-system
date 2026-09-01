/**
 * @file helpers/expiryChecker.helper.js
 * @description Helper utility to inspect Cold/Perishable item dates and auto-flag items expiring within 3 days.
 */

/**
 * Check if a given date string/Date object is expiring within the specified number of days.
 * @param {string|Date} dateStr - Target expiration date (YYYY-MM-DD)
 * @param {number} thresholdDays - Number of days threshold (default: 3)
 * @returns {boolean}
 */
const isExpiringWithinDays = (dateStr, thresholdDays = 3) => {
  if (!dateStr) return false;

  const expiryDate = new Date(dateStr);
  const today = new Date();

  // Set both to midnight for pure day difference calculation
  expiryDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Expiring soon if diffDays is between 0 and thresholdDays (or already expired: diffDays < 0)
  return diffDays <= thresholdDays;
};

/**
 * Enriches product objects with an `isExpiringSoon` and `isExpired` flag.
 * @param {Object} product - Product JSON or Sequelize instance
 * @returns {Object} Enriched product object
 */
const enrichProductExpiryInfo = (product) => {
  const plainProduct = typeof product.toJSON === 'function' ? product.toJSON() : { ...product };

  if (
    plainProduct.category === 'Cold' &&
    plainProduct.coldDetail &&
    plainProduct.coldDetail.expiryDate
  ) {
    const expiryDate = new Date(plainProduct.coldDetail.expiryDate);
    const today = new Date();
    expiryDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    plainProduct.coldDetail.isExpiringSoon = diffDays <= 3 && diffDays >= 0;
    plainProduct.coldDetail.isExpired = diffDays < 0;
    plainProduct.coldDetail.daysUntilExpiry = diffDays;
  }

  return plainProduct;
};

module.exports = {
  isExpiringWithinDays,
  enrichProductExpiryInfo,
};
