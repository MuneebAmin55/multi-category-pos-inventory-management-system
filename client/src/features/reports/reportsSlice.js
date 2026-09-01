/**
 * @file src/features/reports/reportsSlice.js
 * @description Redux Toolkit slice for Analytics & Business Reports:
 *   - Dashboard Analytics (7-Day Revenue Trend Chart, KPIs)
 *   - Today's Sales Breakdown (Payment methods, Cashiers, Line items)
 *   - Low-Stock & Deficit Audit
 *   - Top-Selling Bestsellers with multi-period filters
 *   - Multi-Category Inventory Distribution & Cold Expiry Timeline
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getTodaysSalesReport,
  getLowStockReport,
  getTopSellingProducts,
  getInventoryDashboardStats,
  getAdminDashboardSummary,
} from '@/services/statsService';

export const fetchAdminSummaryThunk = createAsyncThunk(
  'reports/fetchAdminSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAdminDashboardSummary();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load executive summary');
    }
  }
);

export const fetchTodaysSalesReportThunk = createAsyncThunk(
  'reports/fetchTodaysSales',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getTodaysSalesReport();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load today sales report');
    }
  }
);

export const fetchLowStockReportThunk = createAsyncThunk(
  'reports/fetchLowStockReport',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getLowStockReport();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load low stock report');
    }
  }
);

export const fetchTopProductsThunk = createAsyncThunk(
  'reports/fetchTopProducts',
  async (params = { period: 'all', limit: 15 }, { rejectWithValue }) => {
    try {
      const response = await getTopSellingProducts(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load top products');
    }
  }
);

export const fetchInventoryStatsThunk = createAsyncThunk(
  'reports/fetchInventoryStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getInventoryDashboardStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load inventory stats');
    }
  }
);

const initialState = {
  adminSummary: null,
  todaysSales: null,
  lowStockReport: null,
  topProducts: null,
  inventoryStats: null,
  activeReportTab: 'dashboard_analytics', // 'dashboard_analytics' | 'sales_report' | 'inventory_report' | 'low_stock' | 'top_products'
  topProductsPeriod: 'all', // 'today' | '7days' | '30days' | 'all'
  isLoading: false,
  error: null,
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setActiveReportTab: (state, action) => {
      state.activeReportTab = action.payload;
    },
    setTopProductsPeriod: (state, action) => {
      state.topProductsPeriod = action.payload;
    },
    clearReportsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Admin Summary
      .addCase(fetchAdminSummaryThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminSummaryThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adminSummary = action.payload;
      })
      .addCase(fetchAdminSummaryThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Today's Sales
      .addCase(fetchTodaysSalesReportThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTodaysSalesReportThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.todaysSales = action.payload;
      })
      .addCase(fetchTodaysSalesReportThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Low Stock
      .addCase(fetchLowStockReportThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLowStockReportThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lowStockReport = action.payload;
      })
      .addCase(fetchLowStockReportThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Top Products
      .addCase(fetchTopProductsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTopProductsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.topProducts = action.payload;
      })
      .addCase(fetchTopProductsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Inventory Stats
      .addCase(fetchInventoryStatsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInventoryStatsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inventoryStats = action.payload;
      })
      .addCase(fetchInventoryStatsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setActiveReportTab, setTopProductsPeriod, clearReportsError } = reportsSlice.actions;

export const selectReportsState = (state) => state.reports;
export default reportsSlice.reducer;
