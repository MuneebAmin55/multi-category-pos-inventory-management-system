/**
 * @file src/features/users/usersSlice.js
 * @description Redux slice for Staff & User Management in Admin panel.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { listUsers, createUser, updateUser, toggleUserStatus } from '@/services/userService';

export const fetchUsersThunk = createAsyncThunk(
  'users/fetchUsers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await listUsers(params);
      return {
        users: response.data,
        pagination: response.pagination,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load users');
    }
  }
);

export const createUserThunk = createAsyncThunk(
  'users/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await createUser(userData);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create user');
    }
  }
);

export const updateUserThunk = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await updateUser(id, userData);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
  }
);

export const toggleUserStatusThunk = createAsyncThunk(
  'users/toggleStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await toggleUserStatus(id, isActive);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user status');
    }
  }
);

const initialState = {
  users: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
  filters: {
    search: '',
    role: '',
    isActive: '',
  },
  selectedUser: null,
  isLoading: false,
  isActionLoading: false,
  error: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page on filter change
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearUsersError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsersThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsersThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchUsersThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create User
      .addCase(createUserThunk.pending, (state) => {
        state.isActionLoading = true;
      })
      .addCase(createUserThunk.fulfilled, (state, action) => {
        state.isActionLoading = false;
        state.users.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createUserThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload;
      })

      // Update User
      .addCase(updateUserThunk.pending, (state) => {
        state.isActionLoading = true;
      })
      .addCase(updateUserThunk.fulfilled, (state, action) => {
        state.isActionLoading = false;
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUserThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload;
      })

      // Toggle Status
      .addCase(toggleUserStatusThunk.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      });
  },
});

export const { setFilters, setPage, setSelectedUser, clearUsersError } = usersSlice.actions;
export const selectUsersState = (state) => state.users;
export default usersSlice.reducer;
