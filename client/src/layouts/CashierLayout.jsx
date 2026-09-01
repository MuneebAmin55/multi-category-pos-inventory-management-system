/**
 * @file src/layouts/CashierLayout.jsx
 * @description Dedicated layout tailored for Cashiers focused on rapid point-of-sale checkout and shift transaction logs.
 */

import BaseLayout from '@/components/layout/BaseLayout';
import { HiOutlineShoppingCart, HiOutlineDocumentText, HiOutlineHome } from 'react-icons/hi';

const CASHIER_NAV_ITEMS = [
  {
    label: 'POS Billing',
    shortLabel: 'POS',
    path: '/pos',
    icon: HiOutlineShoppingCart,
  },
  {
    label: 'My Transactions',
    shortLabel: 'Sales',
    path: '/transactions',
    icon: HiOutlineDocumentText,
  },
  {
    label: 'Shift Summary',
    shortLabel: 'Shift',
    path: '/',
    exact: true,
    icon: HiOutlineHome,
  },
];

const CashierLayout = () => {
  return (
    <BaseLayout
      navItems={CASHIER_NAV_ITEMS}
      brandTitle="Mart POS"
      roleSubtitle="Fast Checkout Terminal"
      badgeText="Cashier"
      badgeColor="bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
      terminalTitle="POS Terminal #01 (Active)"
    />
  );
};

export default CashierLayout;
