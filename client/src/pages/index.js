/**
 * @file src/pages/index.js
 * @description Central barrel export for all application page views.
 */

export { default as LoginPage } from './LoginPage';
export { default as NotFoundPage } from './NotFoundPage';
export { default as DashboardPage } from './DashboardPage';
export { default as UserManagementPage } from './UserManagementPage';
export { default as ProductManagementPage } from './ProductManagementPage';
export { default as CategoriesPage } from './CategoriesPage';
export { default as TransactionsPage } from './TransactionsPage';
export { default as ReportsPage } from './ReportsPage';
export { default as SettingsPage } from './SettingsPage';

// POS Terminal & Cashier Billing
export { default as POSPage } from './pos/POSPage';

// Inventory Manager Sub-Pages
export { default as InventoryDashboardPage } from './inventory/InventoryDashboardPage';
export { default as AddProductPage } from './inventory/AddProductPage';
export { default as EditProductPage } from './inventory/EditProductPage';
export { default as ProductDetailsPage } from './inventory/ProductDetailsPage';
export { default as LowStockPage } from './inventory/LowStockPage';
export { default as SearchPage } from './inventory/SearchPage';
