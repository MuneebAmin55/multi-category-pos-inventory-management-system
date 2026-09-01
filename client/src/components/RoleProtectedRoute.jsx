/**
 * @file src/components/RoleProtectedRoute.jsx
 * @description Guards routes based on user role. Redirects unauthorized users with a toast.
 */

import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '@/features/auth/authSlice';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const user = useSelector(selectUser);
  const hasToasted = useRef(false);

  const isAllowed = user && allowedRoles.includes(user.role);

  useEffect(() => {
    if (!isAllowed && !hasToasted.current) {
      toast.error('You do not have permission to access this page.');
      hasToasted.current = true;
    }
  }, [isAllowed]);

  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
