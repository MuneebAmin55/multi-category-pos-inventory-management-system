/**
 * @file src/components/layout/ResponsiveSidebar.jsx
 * @description Responsive sidebar supporting desktop dock and mobile slide-out drawer.
 */

import { NavLink } from 'react-router-dom';
import { HiOutlineX } from 'react-icons/hi';

const ResponsiveSidebar = ({
  isOpen = false,
  onClose,
  navItems = [],
  brandTitle = 'Mart POS',
  roleSubtitle = 'Management Console',
  badgeText = 'Admin',
  badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-400/30',
}) => {
  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-slate-900 text-white w-64 select-none">
      {/* Top Section: Brand & Nav */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <svg
                className="w-5 h-5 text-white"
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
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white">{brandTitle}</span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${badgeColor}`}
                >
                  {badgeText}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium truncate max-w-[130px]">
                {roleSubtitle}
              </span>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close sidebar"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <div className="p-3 space-y-1">
          <div className="px-3 pt-2 pb-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Navigation Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact !== false}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      {Icon && (
                        <Icon
                          className={`w-5 h-5 transition-transform duration-150 group-hover:scale-110 ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                          }`}
                        />
                      )}
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-white/10 text-slate-300 group-hover:bg-white/20'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Bottom Status Card */}
      <div className="p-3 border-t border-white/10 flex-shrink-0">
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-200">System Online</span>
              <span className="text-[9px] text-slate-400">PostgreSQL &bull; JWT Sync</span>
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-black/30">
            v1.0
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex md:flex-shrink-0 z-30 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Out Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Slide-out Panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full shadow-2xl z-10 transform transition-transform duration-300 animate-slide-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default ResponsiveSidebar;
