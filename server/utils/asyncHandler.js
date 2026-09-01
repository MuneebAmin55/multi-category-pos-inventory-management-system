/**
 * @file utils/asyncHandler.js
 * @description Higher-order wrapper catching exceptions in asynchronous Express route handlers.
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
