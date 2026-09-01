/**
 * @file src/components/common/Badge.jsx
 * @description Role, Category, and Stock Status badges.
 */

import { CATEGORIES } from '@/constants/categories';
import { ROLES, ROLE_LABELS } from '@/constants/roles';

export const CategoryBadge = ({ category }) => {
  switch (category) {
    case CATEGORIES.FRAGILE:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          Fragile
        </span>
      );
    case CATEGORIES.COLD:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
          Cold / Perishable
        </span>
      );
    case CATEGORIES.TECH:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          Tech / Hardware
        </span>
      );
    case CATEGORIES.CLEANING:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Cleaning / Hazmat
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          {category || 'General'}
        </span>
      );
  }
};

export const RoleBadge = ({ role }) => {
  switch (role) {
    case ROLES.ADMIN:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
          {ROLE_LABELS[role] || 'Admin'}
        </span>
      );
    case ROLES.INVENTORY_MANAGER:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          {ROLE_LABELS[role] || 'Inventory Manager'}
        </span>
      );
    case ROLES.CASHIER:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          {ROLE_LABELS[role] || 'Cashier'}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          {role}
        </span>
      );
  }
};

export const StockBadge = ({ quantity, threshold }) => {
  if (quantity <= 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
        Out of Stock (0)
      </span>
    );
  }

  if (quantity <= threshold) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
        Low Stock ({quantity})
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      In Stock ({quantity})
    </span>
  );
};
