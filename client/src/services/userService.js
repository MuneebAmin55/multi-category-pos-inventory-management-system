/**
 * @file src/services/userService.js
 * @description API service calls for User & Staff Management endpoints.
 */

import api from './api';
import { USER_ENDPOINTS } from '@/constants/apiEndpoints';

export const listUsers = async (params = {}) => {
  const response = await api.get(USER_ENDPOINTS.BASE, { params });
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(USER_ENDPOINTS.BY_ID(id));
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post(USER_ENDPOINTS.BASE, userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(USER_ENDPOINTS.BY_ID(id), userData);
  return response.data;
};

export const updateUserRole = async (id, role) => {
  const response = await api.patch(`${USER_ENDPOINTS.BASE}/${id}/role`, { role });
  return response.data;
};

export const toggleUserStatus = async (id, isActive) => {
  const response = await api.patch(USER_ENDPOINTS.TOGGLE_STATUS(id), { isActive });
  return response.data;
};
