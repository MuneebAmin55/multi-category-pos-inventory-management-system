/**
 * @file src/components/layout/Navbar.jsx
 * @description Top navigation bar containing mobile hamburger toggle, breadcrumb, status tags, notifications, and profile.
 */

import { HiOutlineMenuAlt2 } from 'react-icons/hi';
import Breadcrumb from './Breadcrumb';
import NotificationsDropdown from './NotificationsDropdown';
import UserProfileDropdown from './UserProfileDropdown';

const Navbar = ({ onToggleMobileSidebar, terminalTitle = 'Mart POS' }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-20 sticky top-0">
      {/* Left: Mobile Toggle + Breadcrumbs */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          aria-label="Toggle mobile menu"
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 md:hidden focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <HiOutlineMenuAlt2 className="w-5 h-5" />
        </button>

        <div className="flex flex-col justify-center min-w-0">
          <Breadcrumb />
        </div>
      </div>

      {/* Right: Quick Status + Notifications + User Dropdown */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        {/* Terminal/Store Tag */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200/60">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{terminalTitle}</span>
        </div>

        {/* Notifications Popover */}
        <NotificationsDropdown />

        <div className="h-6 w-px bg-slate-200 mx-0.5 sm:mx-1" />

        {/* User Profile & Logout Dropdown */}
        <UserProfileDropdown />
      </div>
    </header>
  );
};

export default Navbar;
