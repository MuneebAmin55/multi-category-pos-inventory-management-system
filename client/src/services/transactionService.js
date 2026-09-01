/**
 * @file src/services/transactionService.js
 * @description API service calls for Transactions and Invoices.
 */

import api from './api';
import { TRANSACTION_ENDPOINTS, POS_ENDPOINTS } from '@/constants/apiEndpoints';

export const listTransactions = async (params = {}) => {
  const response = await api.get(TRANSACTION_ENDPOINTS.BASE, { params });
  return response.data;
};

export const getMySales = async (params = {}) => {
  const response = await api.get(TRANSACTION_ENDPOINTS.MY_SALES, { params });
  return response.data;
};

export const getTransactionById = async (id) => {
  const response = await api.get(TRANSACTION_ENDPOINTS.BY_ID(id));
  return response.data;
};

export const posLookup = async (sku) => {
  const response = await api.get(POS_ENDPOINTS.LOOKUP(sku));
  return response.data;
};

export const posCalculateCart = async (cartData) => {
  const response = await api.post(POS_ENDPOINTS.CALCULATE, cartData);
  return response.data;
};

export const posCheckout = async (checkoutData) => {
  const response = await api.post(POS_ENDPOINTS.CHECKOUT, checkoutData);
  return response.data;
};
