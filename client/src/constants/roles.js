/**
 * @file src/constants/roles.js
 * @description Frontend mirror of backend RBAC role constants.
 */

export const ROLES = {
  ADMIN: 'admin',
  INVENTORY_MANAGER: 'inventory_manager',
  CASHIER: 'cashier',
};

export const ALL_ROLES = Object.values(ROLES);

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.INVENTORY_MANAGER]: 'Inventory Manager',
  [ROLES.CASHIER]: 'Cashier',
};
