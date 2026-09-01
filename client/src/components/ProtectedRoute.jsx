/**
 * @file src/components/ProtectedRoute.jsx
 * @description Guards routes from unauthenticated users, checks for existing token on mount.
 */

import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getMeThunk, selectIsAuthenticated } from '@/features/auth/authSlice';

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();

  const { isAuthenticated, token, isLoading } = useSelector((state) => state.auth);

  // On mount, if we have a token but no user profile, rehydrate from backend
  useEffect(() => {
    if (token && !isAuthenticated) {
      dispatch(getMeThunk());
    }
  }, [token, isAuthenticated, dispatch]);

  // Show loading spinner while rehydrating
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-slate-500 text-sm">Verifying session…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
