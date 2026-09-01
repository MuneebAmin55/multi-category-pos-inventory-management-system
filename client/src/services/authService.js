/**
 * @file src/services/authService.js
 * @description API service layer for authentication endpoints.
 */

import api from './api';
import { AUTH_ENDPOINTS } from '@/constants/apiEndpoints';

/**
 * Login user with email and password.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ user: object, token: string }>}
 */
export const loginUser = async (credentials) => {
  const response = await api.post(AUTH_ENDPOINTS.LOGIN, credentials);
  return response.data;
};

/**
 * Register a new user (admin flow).
 * @param {{ name: string, email: string, password: string, role: string }} userData
 * @returns {Promise<{ user: object, token: string }>}
 */
export const registerUser = async (userData) => {
  const response = await api.post(AUTH_ENDPOINTS.REGISTER, userData);
  return response.data;
};

/**
 * Fetch currently authenticated user's profile.
 * @returns {Promise<{ user: object }>}
 */
export const getMe = async () => {
  const response = await api.get(AUTH_ENDPOINTS.ME);
  return response.data;
};
