/**
 * @file constants/paymentMethods.constant.js
 * @description POS payment method enumerations and accepted payment options.
 */

const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  UPI_DIGITAL: 'upi_digital',
};

const ALL_PAYMENT_METHODS = Object.values(PAYMENT_METHODS);

module.exports = {
  PAYMENT_METHODS,
  ALL_PAYMENT_METHODS,
};
