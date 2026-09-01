/**
 * @file src/app/rootReducer.js
 * @description Combines all feature slice reducers into the centralized root reducer.
 */

import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import usersReducer from '@/features/users/usersSlice';
import productsReducer from '@/features/products/productsSlice';
import inventoryReducer from '@/features/inventory/inventorySlice';
import transactionsReducer from '@/features/transactions/transactionsSlice';
import reportsReducer from '@/features/reports/reportsSlice';
import dashboardReducer from '@/features/dashboard/dashboardSlice';
import cartReducer from '@/features/cart/cartSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  users: usersReducer,
  products: productsReducer,
  inventory: inventoryReducer,
  transactions: transactionsReducer,
  reports: reportsReducer,
  dashboard: dashboardReducer,
  cart: cartReducer,
});

export default rootReducer;
