/**
 * @file src/components/layout/UserProfileDropdown.jsx
 * @description User avatar, profile summary dropdown, role badge, and logout action.
 */

import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, selectUser } from '@/features/auth/authSlice';
import { ROLE_LABELS, ROLES } from '@/constants/roles';
import {
  HiOutlineLogout,
  HiOutlineChevronDown,
  HiOutlineUserCircle,
  HiOutlineShieldCheck,
  HiOutlineKey,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const UserProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login', { replace: true });
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case ROLES.INVENTORY_MANAGER:
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case ROLES.CASHIER:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getAvatarGradient = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return 'from-purple-600 to-indigo-600';
      case ROLES.INVENTORY_MANAGER:
        return 'from-amber-500 to-orange-600';
      case ROLES.CASHIER:
        return 'from-emerald-500 to-teal-600';
      default:
        return 'from-blue-600 to-indigo-600';
    }
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <div
          className={`w-8 h-8 rounded-xl bg-gradient-to-br ${getAvatarGradient(
            user?.role
          )} flex items-center justify-center text-white text-xs font-bold shadow-sm`}
        >
          {initials}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
            {user?.name || 'User'}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {ROLE_LABELS[user?.role] || user?.role || 'Staff'}
          </span>
        </div>
        <HiOutlineChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Profile Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200/80 shadow-2xl z-50 overflow-hidden transform transition-all">
          {/* User Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarGradient(
                  user?.role
                )} flex items-center justify-center text-white text-sm font-bold shadow-md`}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {user?.name || 'User Account'}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.email || 'user@martpos.com'}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getRoleBadgeStyle(
                  user?.role
                )}`}
              >
                <HiOutlineShieldCheck className="w-3.5 h-3.5 mr-1" />
                {ROLE_LABELS[user?.role] || user?.role}
              </span>
              <span className="inline-flex items-center text-[11px] text-emerald-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                Active
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-2 space-y-1">
            <div className="px-3 py-2 text-xs text-slate-500 flex items-center gap-2">
              <HiOutlineKey className="w-4 h-4 text-slate-400" />
              <span>Session: JWT Secured</span>
            </div>
            <div className="px-3 py-2 text-xs text-slate-500 flex items-center gap-2">
              <HiOutlineUserCircle className="w-4 h-4 text-slate-400" />
              <span className="truncate">ID: {user?.id?.slice(0, 13) || 'Local'}...</span>
            </div>
          </div>

          {/* Logout Action */}
          <div className="p-2 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-colors"
            >
              <HiOutlineLogout className="w-4 h-4" />
              <span>Sign out of session</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
