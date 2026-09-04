/**
 * @file constants/roles.constant.js
 * @description System user roles and RBAC hierarchy constants.
 */

const ROLES = {
  ADMIN: 'admin',
  INVENTORY_MANAGER: 'inventory_manager',
  CASHIER: 'cashier',
};

// Roles allowed for new user registration (Admin role cannot be registered)
const REGISTRABLE_ROLES = [ROLES.INVENTORY_MANAGER, ROLES.CASHIER];

const ALL_ROLES = Object.values(ROLES);

module.exports = {
  ROLES,
  ALL_ROLES,
  REGISTRABLE_ROLES,
};
