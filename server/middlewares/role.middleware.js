/**
 * @file middlewares/role.middleware.js
 * @description Role-based authorization middleware (RBAC).
 */

const ApiError = require('../utils/apiError');
const { ROLES } = require('../constants/roles.constant');

/**
 * Middleware factory restricting route access to specific roles.
 * @param  {...string} allowedRoles - List of authorized roles
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required before role check.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}]. Current role: '${req.user.role}'`
        )
      );
    }

    next();
  };
};

// Convenient pre-configured role shortcuts
const isAdmin = authorize(ROLES.ADMIN);
const isInventoryManager = authorize(ROLES.ADMIN, ROLES.INVENTORY_MANAGER);
const isCashier = authorize(ROLES.ADMIN, ROLES.CASHIER);

module.exports = {
  authorize,
  isAdmin,
  isInventoryManager,
  isCashier,
};
