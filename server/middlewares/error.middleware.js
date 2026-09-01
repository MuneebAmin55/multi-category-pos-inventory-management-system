/**
 * @file middlewares/error.middleware.js
 * @description Centralized application error handling middleware.
 */

const ApiError = require('../utils/apiError');
const logger = require('../utils/logger');
const HTTP_STATUS = require('../constants/httpStatus.constant');

const errorHandler = (err, req, res, _next) => {
  let error = err;

  // Handle Sequelize Validation Errors
  if (err.name === 'SequelizeValidationError') {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
      value: e.value,
    }));
    error = ApiError.badRequest('Database validation error', formattedErrors);
  }

  // Handle Sequelize Unique Constraint Violations
  else if (err.name === 'SequelizeUniqueConstraintError') {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
      value: e.value,
    }));
    error = new ApiError(HTTP_STATUS.CONFLICT, 'Unique constraint violation', formattedErrors);
  }

  // Handle Sequelize Foreign Key Violations
  else if (err.name === 'SequelizeForeignKeyConstraintError') {
    error = ApiError.badRequest('Referenced entity does not exist or cannot be modified');
  }

  // Handle JWT Malformed / Signature Errors
  else if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid authentication token');
  }

  // Handle JWT Expired Error
  else if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Authentication token has expired. Please login again.');
  }

  // Handle Generic / Non-ApiError Instances
  else if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, [], false, err.stack);
  }

  // Log error
  if (!error.isOperational) {
    logger.error(`[UNHANDLED ERROR] ${req.method} ${req.originalUrl}:`, error);
  } else {
    logger.warn(`[OPERATIONAL ERROR] ${req.method} ${req.originalUrl}: ${error.message}`);
  }

  const responsePayload = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  res.status(error.statusCode).json(responsePayload);
};

module.exports = errorHandler;
