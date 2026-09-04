/**
 * @file src/routes/index.jsx
 * @description Centralized React Router configuration with dynamic lazy loading (React.lazy + Suspense)
 *   and Role-Based Access Control (RBAC) guards for optimal performance and chunk splitting.
 */

import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

// Layouts
import MainLayout from '@/layouts/MainLayout';

// Route Guards
import ProtectedRoute from '@/components/ProtectedRoute';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';

// Loading Skeleton Fallback
import { PageLoaderSkeleton } from '@/components/common/Skeleton';

// Constants
import { ROLES } from '@/constants/roles';

// ── Lazy-Loaded Application Pages ──
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegistrationPage = lazy(() => import('@/pages/RegistrationPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const POSPage = lazy(() => import('@/pages/pos/POSPage'));
const UserManagementPage = lazy(() => import('@/pages/UserManagementPage'));
const ProductManagementPage = lazy(() => import('@/pages/ProductManagementPage'));
const CategoriesPage = lazy(() => import('@/pages/CategoriesPage'));
const TransactionsPage = lazy(() => import('@/pages/TransactionsPage'));
const ReportsPage = lazy(() => import('@/pages/ReportsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

// Inventory Sub-Pages
const InventoryDashboardPage = lazy(() => import('@/pages/inventory/InventoryDashboardPage'));
const AddProductPage = lazy(() => import('@/pages/inventory/AddProductPage'));
const EditProductPage = lazy(() => import('@/pages/inventory/EditProductPage'));
const ProductDetailsPage = lazy(() => import('@/pages/inventory/ProductDetailsPage'));
const LowStockPage = lazy(() => import('@/pages/inventory/LowStockPage'));
const SearchPage = lazy(() => import('@/pages/inventory/SearchPage'));

/** Helper wrapper for lazy loaded page components */
const LazyPage = ({ Component }) => (
  <Suspense fallback={<PageLoaderSkeleton />}>
    <Component />
  </Suspense>
);

// ============================================================================
// Router Configuration
// ============================================================================

const router = createBrowserRouter([
  // ── Public Authentication ──
  {
    path: '/login',
    element: <LazyPage Component={LoginPage} />,
  },

  {
    path: '/register',
    element: <LazyPage Component={RegistrationPage} />,
  },

  // ── Protected Application Shell ──
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      // 1. Main Dashboard — Accessible by All Roles (Role-customized view)
      {
        index: true,
        element: <LazyPage Component={DashboardPage} />,
      },

      // 2. ── POS Terminal & Billing — Cashier & Admin ─────────────────────────
      {
        path: 'pos',
        element: (
          <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.CASHIER]}>
            <LazyPage Component={POSPage} />
          </RoleProtectedRoute>
        ),
      },

      // 3. ── Inventory Manager Section ──────────────────────────────────────
      {
        path: 'inventory',
        element: (
          <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.INVENTORY_MANAGER]}>
            <LazyPage Component={InventoryDashboardPage} />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'inventory/products',
        element: (
          <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.INVENTORY_MANAGER]}>
            <LazyPage Component={ProductManagementPage} />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'inventory/add',
        element: (
          <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.INVENTORY_MANAGER]}>
            <LazyPage Component={AddProductPage} />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'inventory/edit/:id',
        element: (
          <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.INVENTORY_MANAGER]}>
            <LazyPage Component={EditProductPage} />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'inventory/low-stock',
        element: (
          <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.INVENTORY_MANAGER]}>
            <LazyPage Component={LowStockPage} />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'inventory/search',
        element: (
          <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.INVENTORY_MANAGER]}>
            <LazyPage Component={SearchPage} />
          </RoleProtectedRoute>
        ),
      },
      {
        path: 'inventory/:id',
        element: (
          <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.INVENTORY_MANAGER]}>
            <LazyPage Component={ProductDetailsPage} />
          </RoleProtectedRoute>
        ),
      },

      // 4. Multi-Category Specifications — Admin & Inventory Manager
      {
        path: 'categories',
        element: (
          <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.INVENTORY_MANAGER]}>
            <LazyPage Component={CategoriesPage} />
          </RoleProtectedRoute>
        ),
      },

      // 5. Transactions Audit & Invoices — All Roles
      {
        path: 'transactions',
        element: <LazyPage Component={TransactionsPage} />,
      },

      // 6. Reports & Business Intelligence — Admin & Inventory Manager
      {
        path: 'reports',
        element: (
          <RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.INVENTORY_MANAGER]}>
            <LazyPage Component={ReportsPage} />
          </RoleProtectedRoute>
        ),
      },

      // 7. User & Staff Management — Admin Only
      {
        path: 'users',
        element: (
          <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <LazyPage Component={UserManagementPage} />
          </RoleProtectedRoute>
        ),
      },

      // 8. Store Settings — Admin Only
      {
        path: 'settings',
        element: (
          <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <LazyPage Component={SettingsPage} />
          </RoleProtectedRoute>
        ),
      },
    ],
  },

  // ── 404 Catch-All ──
  {
    path: '*',
    element: <LazyPage Component={NotFoundPage} />,
  },
]);

export default router;
