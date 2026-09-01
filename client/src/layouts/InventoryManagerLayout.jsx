/**
 * @file src/layouts/InventoryManagerLayout.jsx
 * @description Dedicated layout tailored for Inventory Managers (warehouse, stock, and expiry controls).
 */

import BaseLayout from '@/components/layout/BaseLayout';
import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineDocumentText,
  HiOutlineChartBar,
} from 'react-icons/hi';

const INVENTORY_NAV_ITEMS = [
  {
    label: 'Dashboard',
    shortLabel: 'Home',
    path: '/',
    exact: true,
    icon: HiOutlineHome,
  },
  {
    label: 'Inventory & Stock',
    shortLabel: 'Stock',
    path: '/inventory',
    icon: HiOutlineCube,
  },
  {
    label: 'Stock Audits / Sales',
    shortLabel: 'Sales',
    path: '/transactions',
    icon: HiOutlineDocumentText,
  },
  {
    label: 'Inventory Reports',
    shortLabel: 'Reports',
    path: '/reports',
    icon: HiOutlineChartBar,
  },
];

const InventoryManagerLayout = () => {
  return (
    <BaseLayout
      navItems={INVENTORY_NAV_ITEMS}
      brandTitle="Mart POS"
      roleSubtitle="Warehouse & Stock Console"
      badgeText="Manager"
      badgeColor="bg-amber-500/20 text-amber-300 border-amber-400/30"
      terminalTitle="Warehouse Terminal #1"
    />
  );
};

export default InventoryManagerLayout;
