/**
 * @file src/components/Sidebar.jsx
 * @description Main navigation sidebar with role-based menu items.
 *   Inventory section is expandable with sub-links to all 8 Inventory Manager pages.
 */

import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '@/features/auth/authSlice';
import { ROLES } from '@/constants/roles';
import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineShoppingCart,
  HiOutlineDocumentText,
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlineCog,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineExclamationCircle,
  HiOutlineSparkles,
  HiOutlineViewGrid,
  HiOutlineChevronDown,
  HiOutlineChevronRight,
} from 'react-icons/hi';

// ─── Inventory sub-navigation items ─────────────────────────────────────────
const INVENTORY_SUB_ITEMS = [
  { label: 'Dashboard', path: '/inventory', icon: HiOutlineViewGrid, end: true },
  { label: 'Products', path: '/inventory/products', icon: HiOutlineCube, end: true },
  { label: 'Add Product', path: '/inventory/add', icon: HiOutlinePlus, end: true },
  { label: 'Low Stock', path: '/inventory/low-stock', icon: HiOutlineExclamationCircle, end: true },
  { label: 'Search', path: '/inventory/search', icon: HiOutlineSearch, end: true },
  { label: 'Categories', path: '/categories', icon: HiOutlineSparkles, end: true },
];

// ─── Top-level nav items ─────────────────────────────────────────────────────
const getNavItems = (role) => {
  const items = [
    {
      label: 'Dashboard',
      path: '/',
      icon: HiOutlineHome,
      roles: [ROLES.ADMIN, ROLES.INVENTORY_MANAGER, ROLES.CASHIER],
      end: true,
    },
    {
      label: 'POS / Billing',
      path: '/pos',
      icon: HiOutlineShoppingCart,
      roles: [ROLES.ADMIN, ROLES.CASHIER],
      end: true,
    },
    {
      label: 'Transactions',
      path: '/transactions',
      icon: HiOutlineDocumentText,
      roles: [ROLES.ADMIN, ROLES.INVENTORY_MANAGER, ROLES.CASHIER],
      end: true,
    },
    {
      label: 'Reports',
      path: '/reports',
      icon: HiOutlineChartBar,
      roles: [ROLES.ADMIN, ROLES.INVENTORY_MANAGER],
      end: true,
    },
    {
      label: 'User Management',
      path: '/users',
      icon: HiOutlineUsers,
      roles: [ROLES.ADMIN],
      end: true,
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: HiOutlineCog,
      roles: [ROLES.ADMIN],
      end: true,
    },
  ];

  return items.filter((item) => item.roles.includes(role));
};

// ─── Component ───────────────────────────────────────────────────────────────
const Sidebar = () => {
  const user = useSelector(selectUser);
  const location = useLocation();
  const navItems = getNavItems(user?.role);

  // Check if we're anywhere inside the inventory section to auto-expand
  const isInInventory =
    location.pathname.startsWith('/inventory') || location.pathname === '/categories';

  const [inventoryOpen, setInventoryOpen] = useState(isInInventory);

  const canAccessInventory = user?.role === ROLES.ADMIN || user?.role === ROLES.INVENTORY_MANAGER;

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-900 text-white hidden md:flex flex-col">
      {/* ── Brand ── */}
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight">Mart POS</span>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {/* Main Dashboard always first */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-blue-600/20 text-blue-400'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`
          }
        >
          <HiOutlineHome className="w-5 h-5 flex-shrink-0" />
          Dashboard
        </NavLink>

        {/* ── Inventory expandable section ── */}
        {canAccessInventory && (
          <div>
            <button
              id="sidebar-inventory-toggle"
              onClick={() => setInventoryOpen((prev) => !prev)}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isInInventory
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <HiOutlineCube className="w-5 h-5 flex-shrink-0" />
                <span>Inventory</span>
              </div>
              {inventoryOpen ? (
                <HiOutlineChevronDown className="w-4 h-4 flex-shrink-0 transition-transform" />
              ) : (
                <HiOutlineChevronRight className="w-4 h-4 flex-shrink-0 transition-transform" />
              )}
            </button>

            {/* Sub-items */}
            {inventoryOpen && (
              <div className="mt-0.5 ml-3 pl-3 border-l border-white/10 space-y-0.5">
                {INVENTORY_SUB_ITEMS.map((sub) => (
                  <NavLink
                    key={sub.path}
                    to={sub.path}
                    end={sub.end}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-blue-600/20 text-blue-300'
                          : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                      }`
                    }
                  >
                    <sub.icon className="w-4 h-4 flex-shrink-0" />
                    {sub.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Rest of nav items ── */}
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* ── User Info Footer ── */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-500 truncate capitalize">
              {user?.role?.replace('_', ' ') || 'Role'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
