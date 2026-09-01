/**
 * @file src/constants/apiEndpoints.js
 * @description Centralized API endpoint paths for all backend routes.
 */

export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ME: '/auth/me',
};

export const USER_ENDPOINTS = {
  BASE: '/users',
  BY_ID: (id) => `/users/${id}`,
  TOGGLE_STATUS: (id) => `/users/${id}/toggle-status`,
};

export const PRODUCT_ENDPOINTS = {
  BASE: '/products',
  BY_ID: (id) => `/products/${id}`,
  LOW_STOCK: '/products/low-stock',
};

export const POS_ENDPOINTS = {
  LOOKUP: (sku) => `/pos/lookup/${sku}`,
  CALCULATE: '/pos/calculate',
  CHECKOUT: '/pos/checkout',
};

export const TRANSACTION_ENDPOINTS = {
  BASE: '/transactions',
  MY_SALES: '/transactions/my-sales',
  BY_ID: (id) => `/transactions/${id}`,
};

export const STATS_ENDPOINTS = {
  ADMIN_SUMMARY: '/stats/admin/summary',
  INVENTORY_SUMMARY: '/stats/inventory/summary',
  LOW_STOCK: '/stats/inventory/low-stock',
  TOP_PRODUCTS: '/stats/top-products',
  SALES_TODAY: '/stats/sales/today',
};
