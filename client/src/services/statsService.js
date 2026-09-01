/**
 * @file src/services/statsService.js
 * @description API service calls for Admin & Inventory Dashboard summaries, Sales, Low-Stock, and Top-Selling product reports.
 */

import api from './api';
import { STATS_ENDPOINTS } from '@/constants/apiEndpoints';

export const getAdminDashboardSummary = async () => {
  const response = await api.get(STATS_ENDPOINTS.ADMIN_SUMMARY);
  return response.data;
};

export const getInventoryDashboardStats = async () => {
  const response = await api.get(STATS_ENDPOINTS.INVENTORY_SUMMARY);
  return response.data;
};

export const getLowStockReport = async () => {
  const response = await api.get(STATS_ENDPOINTS.LOW_STOCK);
  return response.data;
};

export const getTopSellingProducts = async (params = {}) => {
  const response = await api.get(STATS_ENDPOINTS.TOP_PRODUCTS, { params });
  return response.data;
};

export const getTodaysSalesReport = async () => {
  const response = await api.get(STATS_ENDPOINTS.SALES_TODAY);
  return response.data;
};
