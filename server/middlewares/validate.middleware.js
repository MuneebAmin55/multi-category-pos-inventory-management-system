/**
 * @file middlewares/validate.middleware.js
 * @description Middleware that inspects express-validator validation results and formats errors.
 */

const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));
    return next(ApiError.badRequest('Validation failed', formattedErrors));
  }
  return next();
};

module.exports = validate;
