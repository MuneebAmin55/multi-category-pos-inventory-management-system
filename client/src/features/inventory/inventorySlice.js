/**
 * @file src/features/inventory/inventorySlice.js
 * @description Redux slice for specialized Inventory Management operations (Dashboard stats, Product Details, SKU search, Low-Stock lists).
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getInventoryDashboardStats, getLowStockReport } from '@/services/statsService';
import { getProductById, getProductBySku, updateProductStock } from '@/services/productService';

export const fetchInventoryDashboardStatsThunk = createAsyncThunk(
  'inventory/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getInventoryDashboardStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load inventory dashboard stats'
      );
    }
  }
);

export const fetchProductDetailsThunk = createAsyncThunk(
  'inventory/fetchProductDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getProductById(id);
      return response.data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load product details');
    }
  }
);

export const lookupProductBySkuThunk = createAsyncThunk(
  'inventory/lookupBySku',
  async (sku, { rejectWithValue }) => {
    try {
      const response = await getProductBySku(sku);
      return response.data.product;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || `No active product found with SKU '${sku}'`
      );
    }
  }
);

export const fetchLowStockReportThunk = createAsyncThunk(
  'inventory/fetchLowStockReport',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getLowStockReport();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load low stock audit');
    }
  }
);

export const adjustStockThunk = createAsyncThunk(
  'inventory/adjustStock',
  async ({ id, stockData }, { rejectWithValue }) => {
    try {
      const response = await updateProductStock(id, stockData);
      return { id, stock: response.data.stock };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to adjust stock');
    }
  }
);

const initialState = {
  dashboardStats: null,
  currentProduct: null,
  searchedProduct: null,
  lowStockReport: null,
  isLoading: false,
  isLookupLoading: false,
  isActionLoading: false,
  error: null,
  lookupError: null,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearSearchedProduct: (state) => {
      state.searchedProduct = null;
      state.lookupError = null;
    },
    clearInventoryError: (state) => {
      state.error = null;
      state.lookupError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard Stats
      .addCase(fetchInventoryDashboardStatsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInventoryDashboardStatsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchInventoryDashboardStatsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Product Details
      .addCase(fetchProductDetailsThunk.pending, (state) => {
        state.isLoading = true;
        state.currentProduct = null;
        state.error = null;
      })
      .addCase(fetchProductDetailsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductDetailsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Lookup By SKU
      .addCase(lookupProductBySkuThunk.pending, (state) => {
        state.isLookupLoading = true;
        state.searchedProduct = null;
        state.lookupError = null;
      })
      .addCase(lookupProductBySkuThunk.fulfilled, (state, action) => {
        state.isLookupLoading = false;
        state.searchedProduct = action.payload;
      })
      .addCase(lookupProductBySkuThunk.rejected, (state, action) => {
        state.isLookupLoading = false;
        state.lookupError = action.payload;
      })

      // Low Stock Report
      .addCase(fetchLowStockReportThunk.fulfilled, (state, action) => {
        state.lowStockReport = action.payload;
      })

      // Stock Adjustment
      .addCase(adjustStockThunk.fulfilled, (state, action) => {
        const { id, stock } = action.payload;
        if (state.currentProduct && state.currentProduct.id === id) {
          state.currentProduct.quantityInStock = stock.newQuantity;
        }
        if (state.searchedProduct && state.searchedProduct.id === id) {
          state.searchedProduct.quantityInStock = stock.newQuantity;
        }
      });
  },
});

export const { clearCurrentProduct, clearSearchedProduct, clearInventoryError } =
  inventorySlice.actions;

export const selectInventoryState = (state) => state.inventory;
export default inventorySlice.reducer;
