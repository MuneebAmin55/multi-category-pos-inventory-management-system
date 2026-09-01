/**
 * @file src/features/auth/authSlice.js
 * @description Redux slice for authentication state, async thunks for login/logout/getMe.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginUser as loginAPI, getMe as getMeAPI } from '@/services/authService';

// ============================================================================
// Async Thunks
// ============================================================================

/**
 * Login thunk — calls POST /api/auth/login, stores token + user.
 */
export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginAPI(credentials);
      // Backend responds with { success, message, data: { user, token } }
      const { user, token } = response.data;

      // Persist token in localStorage for Axios interceptor
      localStorage.setItem('token', token);

      return { user, token };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Login failed. Please try again.';
      return rejectWithValue(message);
    }
  }
);

/**
 * GetMe thunk — calls GET /api/auth/me to rehydrate user profile from token.
 */
export const getMeThunk = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      if (!auth.token) {
        return rejectWithValue('No token available');
      }
      const response = await getMeAPI();
      return response.data.user;
    } catch (error) {
      // If token is invalid/expired, clear it
      localStorage.removeItem('token');
      const message = error.response?.data?.message || 'Session expired. Please login again.';
      return rejectWithValue(message);
    }
  }
);

// ============================================================================
// Slice
// ============================================================================

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Manually set credentials (useful for direct token injection).
     */
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },

    /**
     * Logout — clears all auth state and localStorage.
     */
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
    },

    /**
     * Clear any auth errors (e.g., when user navigates away from login).
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Login ──
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })

      // ── GetMe ──
      .addCase(getMeThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMeThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getMeThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      });
  },
});

export const { setCredentials, logout, clearError } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserRole = (state) => state.auth.user?.role;

export default authSlice.reducer;
