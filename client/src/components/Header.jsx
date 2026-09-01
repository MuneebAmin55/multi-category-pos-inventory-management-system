/**
 * @file src/components/Header.jsx
 * @description Top header bar with user info and logout button.
 */

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, selectUser } from '@/features/auth/authSlice';
import { ROLE_LABELS } from '@/constants/roles';
import { HiOutlineLogout, HiOutlineBell } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
      {/* Left: Page Context */}
      <div>
        <p className="text-sm text-slate-500">Welcome back,</p>
        <p className="text-sm font-semibold text-slate-800">{user?.name || 'User'}</p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Role Badge */}
        <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
          {ROLE_LABELS[user?.role] || user?.role}
        </span>

        {/* Notification Bell */}
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <HiOutlineBell className="w-5 h-5" />
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <HiOutlineLogout className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
