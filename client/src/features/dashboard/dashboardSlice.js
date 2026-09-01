/**
 * @file src/features/dashboard/dashboardSlice.js
 * @description Redux slice for Admin Dashboard overview KPIs and charts.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAdminDashboardSummary } from '@/services/statsService';
import { listTransactions } from '@/services/transactionService';

export const fetchAdminDashboardThunk = createAsyncThunk(
  'dashboard/fetchAdminSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAdminDashboardSummary();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load dashboard summary');
    }
  }
);

export const fetchRecentTransactionsThunk = createAsyncThunk(
  'dashboard/fetchRecentTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await listTransactions({ limit: 5, page: 1 });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load recent transactions');
    }
  }
);

const initialState = {
  summary: null,
  recentTransactions: [],
  isLoading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboardThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminDashboardThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.summary = action.payload;
      })
      .addCase(fetchAdminDashboardThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchRecentTransactionsThunk.fulfilled, (state, action) => {
        state.recentTransactions = action.payload;
      });
  },
});

export const { clearDashboardError } = dashboardSlice.actions;
export const selectDashboard = (state) => state.dashboard;
export default dashboardSlice.reducer;
