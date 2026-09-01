/**
 * @file middlewares/auth.middleware.js
 * @description JWT authentication verification middleware.
 */

const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt.config');
const { User } = require('../models');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Authentication token missing or malformed.');
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, jwtConfig.secret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Authentication token has expired. Please login again.');
    }
    throw ApiError.unauthorized('Invalid authentication token.');
  }

  const user = await User.findByPk(decoded.id);

  if (!user) {
    throw ApiError.unauthorized('The user belonging to this token no longer exists.');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('User account has been deactivated.');
  }

  // Attach authenticated user to request context
  req.user = user.toJSON();
  next();
});

module.exports = {
  authenticate,
};
