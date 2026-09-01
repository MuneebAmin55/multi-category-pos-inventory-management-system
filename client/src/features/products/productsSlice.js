/**
 * @file src/features/products/productsSlice.js
 * @description Redux slice for Product Catalog and Multi-Category Inventory management.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  listProducts,
  createProduct,
  updateProduct,
  updateProductStock,
  deleteProduct,
  getLowStockAlerts,
} from '@/services/productService';

export const fetchProductsThunk = createAsyncThunk(
  'products/fetchProducts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await listProducts(params);
      return {
        products: response.data,
        pagination: response.pagination,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load products');
    }
  }
);

export const createProductThunk = createAsyncThunk(
  'products/createProduct',
  async (formDataOrObject, { rejectWithValue }) => {
    try {
      const response = await createProduct(formDataOrObject);
      return response.data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create product');
    }
  }
);

export const updateProductThunk = createAsyncThunk(
  'products/updateProduct',
  async ({ id, formDataOrObject }, { rejectWithValue }) => {
    try {
      const response = await updateProduct(id, formDataOrObject);
      return response.data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product');
    }
  }
);

export const updateProductStockThunk = createAsyncThunk(
  'products/updateStock',
  async ({ id, stockData }, { rejectWithValue }) => {
    try {
      const response = await updateProductStock(id, stockData);
      return { id, stock: response.data.stock };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update stock');
    }
  }
);

export const deleteProductThunk = createAsyncThunk(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await deleteProduct(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to deactivate product');
    }
  }
);

export const fetchLowStockAlertsThunk = createAsyncThunk(
  'products/fetchLowStockAlerts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await getLowStockAlerts(params);
      return {
        products: response.data,
        pagination: response.pagination,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load low stock alerts');
    }
  }
);

const initialState = {
  products: [],
  lowStockAlerts: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
  filters: {
    search: '',
    category: '',
    lowStock: '',
    isActive: 'true',
  },
  selectedProduct: null,
  isLoading: false,
  isActionLoading: false,
  error: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProductFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setProductPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    clearProductError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProductsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchProductsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Product
      .addCase(createProductThunk.pending, (state) => {
        state.isActionLoading = true;
      })
      .addCase(createProductThunk.fulfilled, (state, action) => {
        state.isActionLoading = false;
        state.products.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createProductThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload;
      })

      // Update Product
      .addCase(updateProductThunk.pending, (state) => {
        state.isActionLoading = true;
      })
      .addCase(updateProductThunk.fulfilled, (state, action) => {
        state.isActionLoading = false;
        const index = state.products.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(updateProductThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload;
      })

      // Update Stock
      .addCase(updateProductStockThunk.fulfilled, (state, action) => {
        const { id, stock } = action.payload;
        const product = state.products.find((p) => p.id === id);
        if (product) {
          product.quantityInStock = stock.newQuantity;
        }
      })

      // Delete Product (soft deactivate)
      .addCase(deleteProductThunk.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p.id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })

      // Low Stock Alerts
      .addCase(fetchLowStockAlertsThunk.fulfilled, (state, action) => {
        state.lowStockAlerts = action.payload.products;
      });
  },
});

export const { setProductFilters, setProductPage, setSelectedProduct, clearProductError } =
  productsSlice.actions;

export const selectProductsState = (state) => state.products;
export default productsSlice.reducer;
