/**
 * @file src/services/api.js
 * @description Centralized Axios instance with request/response interceptors.
 * - Request: Attaches JWT Bearer token from localStorage.
 * - Response: Catches 401 errors and triggers global logout.
 */

import axios from 'axios';
import { store } from '@/app/store';
import { logout } from '@/features/auth/authSlice';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ── Request Interceptor ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        // Token expired or invalid — force logout
        store.dispatch(logout());
        toast.error('Session expired. Please login again.');
      }
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timed out. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

export default api;
