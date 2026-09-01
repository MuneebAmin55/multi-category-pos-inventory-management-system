/**
 * @file src/components/layout/Breadcrumb.jsx
 * @description Dynamic breadcrumb navigation that resolves route paths to readable labels.
 */

import { Link, useLocation } from 'react-router-dom';
import { HiOutlineChevronRight, HiOutlineHome } from 'react-icons/hi';

const ROUTE_LABELS = {
  '': 'Home',
  dashboard: 'Dashboard',
  inventory: 'Inventory Management',
  products: 'Products',
  categories: 'Categories',
  pos: 'POS & Billing Terminal',
  transactions: 'Transaction History',
  reports: 'Reports & Analytics',
  users: 'User Management',
  settings: 'Store Settings',
  'my-sales': 'My Shift Sales',
  'low-stock': 'Low Stock Alerts',
};

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs sm:text-sm text-slate-500">
      <ol className="inline-flex items-center space-x-1 sm:space-x-2">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="inline-flex items-center text-slate-500 hover:text-blue-600 transition-colors duration-150 font-medium"
          >
            <HiOutlineHome className="w-4 h-4 mr-1 text-slate-400" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </li>

        {pathnames.map((segment, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const label = ROUTE_LABELS[segment] || decodeURIComponent(segment);

          return (
            <li key={routeTo} className="inline-flex items-center">
              <HiOutlineChevronRight className="w-3.5 h-3.5 text-slate-400 mx-1 flex-shrink-0" />
              {isLast ? (
                <span className="font-semibold text-slate-800 capitalize truncate max-w-[150px] sm:max-w-none">
                  {label}
                </span>
              ) : (
                <Link
                  to={routeTo}
                  className="text-slate-500 hover:text-blue-600 transition-colors duration-150 capitalize font-medium truncate max-w-[120px] sm:max-w-none"
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
