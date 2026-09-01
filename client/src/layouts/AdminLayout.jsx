/**
 * @file src/layouts/AdminLayout.jsx
 * @description Dedicated layout for System Administrators with comprehensive system access.
 */

import BaseLayout from '@/components/layout/BaseLayout';
import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineShoppingCart,
  HiOutlineDocumentText,
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlineCog,
} from 'react-icons/hi';

const ADMIN_NAV_ITEMS = [
  {
    label: 'Dashboard',
    shortLabel: 'Home',
    path: '/',
    exact: true,
    icon: HiOutlineHome,
  },
  {
    label: 'Inventory',
    shortLabel: 'Stock',
    path: '/inventory',
    icon: HiOutlineCube,
  },
  {
    label: 'POS / Billing',
    shortLabel: 'POS',
    path: '/pos',
    icon: HiOutlineShoppingCart,
  },
  {
    label: 'Transactions',
    shortLabel: 'Sales',
    path: '/transactions',
    icon: HiOutlineDocumentText,
  },
  {
    label: 'Reports',
    shortLabel: 'Reports',
    path: '/reports',
    icon: HiOutlineChartBar,
  },
  {
    label: 'User Management',
    shortLabel: 'Users',
    path: '/users',
    icon: HiOutlineUsers,
  },
  {
    label: 'Settings',
    shortLabel: 'Settings',
    path: '/settings',
    icon: HiOutlineCog,
  },
];

const AdminLayout = () => {
  return (
    <BaseLayout
      navItems={ADMIN_NAV_ITEMS}
      brandTitle="Mart POS"
      roleSubtitle="Superuser Console"
      badgeText="Admin"
      badgeColor="bg-purple-500/20 text-purple-300 border-purple-400/30"
      terminalTitle="Admin Headquarters"
    />
  );
};

export default AdminLayout;
