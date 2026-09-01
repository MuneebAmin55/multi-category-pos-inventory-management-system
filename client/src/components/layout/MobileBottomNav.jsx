/**
 * @file src/components/layout/MobileBottomNav.jsx
 * @description Mobile bottom navigation bar for quick touch actions on mobile and tablet devices.
 */

import { NavLink } from 'react-router-dom';

const MobileBottomNav = ({ navItems = [] }) => {
  // Take the first 4-5 primary items for the bottom bar
  const quickItems = navItems.slice(0, 5);

  if (quickItems.length === 0) return null;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-lg shadow-slate-900/5 flex items-center justify-around"
    >
      {quickItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact !== false}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 relative min-w-[56px] ${
                isActive
                  ? 'text-blue-600 font-semibold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {Icon && (
                  <div className="relative">
                    <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-blue-600' : ''}`} />
                    {item.badge && (
                      <span className="absolute -top-1 -right-2 flex h-3.5 min-w-3.5 px-0.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px]">
                  {item.shortLabel || item.label}
                </span>
                {isActive && <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" />}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
