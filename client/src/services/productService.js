/**
 * @file src/services/productService.js
 * @description API service calls for Product Catalog and Inventory endpoints.
 */

import api from './api';
import { PRODUCT_ENDPOINTS } from '@/constants/apiEndpoints';

export const listProducts = async (params = {}) => {
  const response = await api.get(PRODUCT_ENDPOINTS.BASE, { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(PRODUCT_ENDPOINTS.BY_ID(id));
  return response.data;
};

export const getProductBySku = async (sku) => {
  const response = await api.get(`${PRODUCT_ENDPOINTS.BASE}/sku/${sku}`);
  return response.data;
};

export const getLowStockAlerts = async (params = {}) => {
  const response = await api.get(`${PRODUCT_ENDPOINTS.BASE}/alerts/low-stock`, { params });
  return response.data;
};

export const createProduct = async (formDataOrObject) => {
  // If formDataOrObject is an instance of FormData, send with proper header
  const isFormData = formDataOrObject instanceof FormData;
  const response = await api.post(PRODUCT_ENDPOINTS.BASE, formDataOrObject, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
};

export const updateProduct = async (id, formDataOrObject) => {
  const isFormData = formDataOrObject instanceof FormData;
  const response = await api.put(PRODUCT_ENDPOINTS.BY_ID(id), formDataOrObject, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
};

export const updateProductStock = async (id, stockData) => {
  const response = await api.patch(`${PRODUCT_ENDPOINTS.BASE}/${id}/stock`, stockData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(PRODUCT_ENDPOINTS.BY_ID(id));
  return response.data;
};
