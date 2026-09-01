/**
 * @file src/layouts/RoleBasedLayout.jsx
 * @description Dynamic layout switcher that automatically renders AdminLayout, InventoryManagerLayout, or CashierLayout based on the active user role.
 */

import { useSelector } from 'react-redux';
import { selectUserRole } from '@/features/auth/authSlice';
import { ROLES } from '@/constants/roles';

import AdminLayout from './AdminLayout';
import InventoryManagerLayout from './InventoryManagerLayout';
import CashierLayout from './CashierLayout';

const RoleBasedLayout = () => {
  const role = useSelector(selectUserRole);

  switch (role) {
    case ROLES.ADMIN:
      return <AdminLayout />;
    case ROLES.INVENTORY_MANAGER:
      return <InventoryManagerLayout />;
    case ROLES.CASHIER:
      return <CashierLayout />;
    default:
      return <AdminLayout />;
  }
};

export default RoleBasedLayout;
