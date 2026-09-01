/**
 * @file constants/roles.constant.js
 * @description System user roles and RBAC hierarchy constants.
 */

const ROLES = {
  ADMIN: 'admin',
  INVENTORY_MANAGER: 'inventory_manager',
  CASHIER: 'cashier',
};

const ALL_ROLES = Object.values(ROLES);

module.exports = {
  ROLES,
  ALL_ROLES,
};
