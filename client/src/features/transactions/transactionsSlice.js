/**
 * @file src/features/transactions/transactionsSlice.js
 * @description Redux slice for Store Transactions Audit and Invoices, supporting both Store-wide ledger and Cashier personal sales ledger.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { listTransactions, getMySales, getTransactionById } from '@/services/transactionService';

export const fetchTransactionsThunk = createAsyncThunk(
  'transactions/fetchTransactions',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const userRole = state.auth?.user?.role;
      const isCashier = userRole === 'cashier' || params.isCashierOnly;

      // Use getMySales for cashiers to prevent 403 Forbidden
      const response = isCashier ? await getMySales(params) : await listTransactions(params);

      return {
        transactions: response.data,
        pagination: response.pagination,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load transactions');
    }
  }
);

export const fetchTransactionDetailsThunk = createAsyncThunk(
  'transactions/fetchDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getTransactionById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load transaction details');
    }
  }
);

const initialState = {
  transactions: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
  filters: {
    startDate: '',
    endDate: '',
    paymentMethod: '',
  },
  selectedTransaction: null,
  isLoading: false,
  isDetailsLoading: false,
  error: null,
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactionFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setTransactionPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearSelectedTransaction: (state) => {
      state.selectedTransaction = null;
    },
    clearTransactionsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactionsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactionsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.transactions;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchTransactionsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch single transaction details for receipt modal
      .addCase(fetchTransactionDetailsThunk.pending, (state) => {
        state.isDetailsLoading = true;
      })
      .addCase(fetchTransactionDetailsThunk.fulfilled, (state, action) => {
        state.isDetailsLoading = false;
        state.selectedTransaction = action.payload;
      })
      .addCase(fetchTransactionDetailsThunk.rejected, (state, action) => {
        state.isDetailsLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setTransactionFilters,
  setTransactionPage,
  clearSelectedTransaction,
  clearTransactionsError,
} = transactionsSlice.actions;

export const selectTransactionsState = (state) => state.transactions;
export default transactionsSlice.reducer;
