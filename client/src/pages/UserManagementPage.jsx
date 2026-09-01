/**
 * @file src/pages/UserManagementPage.jsx
 * @description Admin Staff & User Management: List, Search, Role Filters, Status Toggle, and Add/Edit Modals.
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';

import {
  fetchUsersThunk,
  createUserThunk,
  updateUserThunk,
  toggleUserStatusThunk,
  setFilters,
  setPage,
  selectUsersState,
} from '@/features/users/usersSlice';
import { ROLES, ROLE_LABELS, ALL_ROLES } from '@/constants/roles';
import { RoleBadge } from '@/components/common/Badge';
import SearchInput from '@/components/common/SearchInput';
import Pagination from '@/components/common/Pagination';
import Modal from '@/components/common/Modal';
import { TableSkeleton } from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import ConfirmDialog from '@/components/common/ConfirmDialog';

import {
  HiOutlineUserAdd,
  HiOutlinePencilAlt,
  HiOutlineRefresh,
  HiOutlineCheck,
  HiOutlineBan,
} from 'react-icons/hi';

// Validation Schemas
const createUserSchema = yup.object().shape({
  name: yup.string().required('Full Name is required').min(2, 'Must be at least 2 characters'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  role: yup.string().oneOf(ALL_ROLES, 'Invalid role').required('Role is required'),
});

const updateUserSchema = yup.object().shape({
  name: yup.string().required('Full Name is required').min(2, 'Must be at least 2 characters'),
  role: yup.string().oneOf(ALL_ROLES, 'Invalid role').required('Role is required'),
  password: yup
    .string()
    .transform((curr, orig) => (orig === '' ? undefined : curr))
    .min(6, 'Password must be at least 6 characters')
    .optional(),
});

const UserManagementPage = () => {
  const dispatch = useDispatch();
  const { users, pagination, filters, isLoading, isActionLoading } = useSelector(selectUsersState);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);

  // Forms
  const createForm = useForm({
    resolver: yupResolver(createUserSchema),
    defaultValues: { name: '', email: '', password: '', role: ROLES.CASHIER },
  });

  const editForm = useForm({
    resolver: yupResolver(updateUserSchema),
    defaultValues: { name: '', role: ROLES.CASHIER, password: '' },
  });

  const loadUsers = () => {
    dispatch(
      fetchUsersThunk({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        role: filters.role,
        isActive: filters.isActive,
      })
    );
  };

  useEffect(() => {
    loadUsers();
  }, [dispatch, pagination.page, filters.search, filters.role, filters.isActive]);

  // Handlers
  const handleSearchChange = (val) => {
    dispatch(setFilters({ search: val }));
  };

  const handleRoleFilterChange = (e) => {
    dispatch(setFilters({ role: e.target.value }));
  };

  const handleStatusFilterChange = (e) => {
    dispatch(setFilters({ isActive: e.target.value }));
  };

  const handleToggleStatus = (user) => {
    setUserToToggle(user);
    setIsStatusConfirmOpen(true);
  };

  const handleConfirmStatusToggle = async () => {
    if (!userToToggle) return;
    const nextStatus = !userToToggle.isActive;
    const result = await dispatch(
      toggleUserStatusThunk({ id: userToToggle.id, isActive: nextStatus })
    );

    if (toggleUserStatusThunk.fulfilled.match(result)) {
      toast.success(
        `Staff account ${userToToggle.name} is now ${nextStatus ? 'Activated' : 'Deactivated'}`
      );
      setIsStatusConfirmOpen(false);
      setUserToToggle(null);
    } else {
      toast.error(result.payload || 'Failed to update account status');
    }
  };

  const handleCreateSubmit = async (data) => {
    const result = await dispatch(createUserThunk(data));
    if (createUserThunk.fulfilled.match(result)) {
      toast.success(`User '${data.name}' registered successfully!`);
      setIsCreateModalOpen(false);
      createForm.reset();
    } else {
      toast.error(result.payload || 'Failed to create user');
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    editForm.reset({
      name: user.name,
      role: user.role,
      password: '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (data) => {
    const payload = { name: data.name, role: data.role };
    if (data.password && data.password.trim()) {
      payload.password = data.password;
    }

    const result = await dispatch(updateUserThunk({ id: editingUser.id, userData: payload }));

    if (updateUserThunk.fulfilled.match(result)) {
      toast.success(`User '${data.name}' updated successfully!`);
      setIsEditModalOpen(false);
      setEditingUser(null);
    } else {
      toast.error(result.payload || 'Failed to update user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Staff &amp; User Accounts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage system access, assign roles, and activate or deactivate employee credentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadUsers}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
            aria-label="Refresh users"
          >
            <HiOutlineRefresh className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              createForm.reset();
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 transition-all"
          >
            <HiOutlineUserAdd className="w-5 h-5" />
            <span>Create New Staff</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <SearchInput
          value={filters.search}
          onChange={handleSearchChange}
          onClear={() => handleSearchChange('')}
          placeholder="Search by name or email..."
        />

        {/* Role Filter */}
        <div className="w-full sm:w-48">
          <select
            value={filters.role}
            onChange={handleRoleFilterChange}
            className="w-full py-2 px-3 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">All Roles</option>
            <option value={ROLES.ADMIN}>Administrator</option>
            <option value={ROLES.INVENTORY_MANAGER}>Inventory Manager</option>
            <option value={ROLES.CASHIER}>Cashier</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-40">
          <select
            value={filters.isActive}
            onChange={handleStatusFilterChange}
            className="w-full py-2 px-3 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created Date</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-0">
                    <TableSkeleton rows={5} cols={5} />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-0">
                    <EmptyState
                      title="No Staff Accounts Found"
                      description="No users match your active search or role criteria."
                      actionLabel={
                        filters.search || filters.role || filters.isActive
                          ? 'Clear Filters'
                          : undefined
                      }
                      onAction={() => dispatch(setFilters({ search: '', role: '', isActive: '' }))}
                    />
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* User Info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm leading-tight">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4">
                      <RoleBadge role={user.role} />
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                          user.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                        }`}
                        title="Click to toggle active status"
                      >
                        {user.isActive ? (
                          <>
                            <HiOutlineCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <HiOutlineBan className="w-3.5 h-3.5 text-rose-600" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Created Date */}
                    <td className="px-5 py-4 text-slate-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit User"
                      >
                        <HiOutlinePencilAlt className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={(page) => dispatch(setPage(page))}
        />
      </div>

      {/* CREATE USER MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Staff Account"
        subtitle="Provision employee access with role-based permissions."
      >
        <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              {...createForm.register('name')}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
            {createForm.formState.errors.name && (
              <p className="text-xs text-rose-500 mt-1">
                {createForm.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              placeholder="john@martpos.com"
              {...createForm.register('email')}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
            {createForm.formState.errors.email && (
              <p className="text-xs text-rose-500 mt-1">
                {createForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              {...createForm.register('password')}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
            {createForm.formState.errors.password && (
              <p className="text-xs text-rose-500 mt-1">
                {createForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">System Role *</label>
            <select
              {...createForm.register('role')}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            >
              <option value={ROLES.CASHIER}>Cashier (POS Checkout &amp; Shift Sales)</option>
              <option value={ROLES.INVENTORY_MANAGER}>
                Inventory Manager (Products &amp; Stock Audits)
              </option>
              <option value={ROLES.ADMIN}>Administrator (Full Access)</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isActionLoading}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isActionLoading && (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              )}
              <span>Create Account</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT USER MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Staff: ${editingUser?.name}`}
        subtitle="Update employee information, change role permissions, or reset password."
      >
        <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              {...editForm.register('name')}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
            {editForm.formState.errors.name && (
              <p className="text-xs text-rose-500 mt-1">{editForm.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Role Permission *
            </label>
            <select
              {...editForm.register('role')}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            >
              <option value={ROLES.CASHIER}>Cashier (POS Checkout &amp; Shift Sales)</option>
              <option value={ROLES.INVENTORY_MANAGER}>
                Inventory Manager (Products &amp; Stock Audits)
              </option>
              <option value={ROLES.ADMIN}>Administrator (Full Access)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reset Password (Optional)
            </label>
            <input
              type="password"
              placeholder="Leave blank to keep existing password"
              {...editForm.register('password')}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
            {editForm.formState.errors.password && (
              <p className="text-xs text-rose-500 mt-1">
                {editForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isActionLoading}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isActionLoading && (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </Modal>
      {/* STATUS TOGGLE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={isStatusConfirmOpen}
        onClose={() => {
          setIsStatusConfirmOpen(false);
          setUserToToggle(null);
        }}
        onConfirm={handleConfirmStatusToggle}
        title={userToToggle?.isActive ? 'Deactivate Staff Account?' : 'Activate Staff Account?'}
        message={`Are you sure you want to ${userToToggle?.isActive ? 'deactivate' : 'activate'} access for ${userToToggle?.name} (${userToToggle?.email})?`}
        confirmLabel={userToToggle?.isActive ? 'Deactivate Account' : 'Activate Account'}
        severity={userToToggle?.isActive ? 'danger' : 'info'}
        isLoading={isActionLoading}
      />
    </div>
  );
};

export default UserManagementPage;
