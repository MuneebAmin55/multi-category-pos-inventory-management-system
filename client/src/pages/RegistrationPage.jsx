/**
 * @file src/pages/RegistrationPage.jsx
 * @description Full-featured registration page with form validation, role selection, and error handling.
 * Only Inventory Manager and Cashier roles are available for registration.
 */

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
} from 'react-icons/hi';

import { registerThunk, clearError } from '@/features/auth/authSlice';
import { ROLES } from '@/constants/roles';

// ── Validation Schema ──
const registrationSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .required('Full Name is required'),

  email: yup.string().email('Enter a valid email address').required('Email is required'),

  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number'),

  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),

  role: yup
    .string()
    .required('Please select a role')
    .oneOf(
      [ROLES.INVENTORY_MANAGER, ROLES.CASHIER],
      'You can only register as an Inventory Manager or Cashier'
    ),
});

// ── Registrable Roles (Admin excluded) ──
const REGISTRABLE_ROLES = [
  { value: ROLES.INVENTORY_MANAGER, label: 'Inventory Manager' },
  { value: ROLES.CASHIER, label: 'Cashier' },
];

const RegistrationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registrationSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: ROLES.CASHIER,
    },
  });

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data) => {
    dispatch(clearError());

    // Prepare registration data (remove confirmPassword before sending to API)
    const registrationData = {
      name: data.name,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      role: data.role,
    };

    const result = await dispatch(registerThunk(registrationData));

    if (registerThunk.fulfilled.match(result)) {
      toast.success(`Welcome, ${result.payload.user.name}! Registration successful.`);
      // Redirect to dashboard after successful registration
      setTimeout(() => navigate('/'), 1500);
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/25 mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Mart POS</h1>
          <p className="text-slate-400 mt-2 text-sm">Create your account to get started</p>
        </div>

        {/* Registration Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Register a new account</h2>

          {/* Server Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiOutlineUser className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="John Doe"
                  {...register('name')}
                  className={`block w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border text-white placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 ${
                    errors.name ? 'border-red-500' : 'border-white/10'
                  }`}
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiOutlineMail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="john@martpos.com"
                  {...register('email')}
                  className={`block w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border text-white placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 ${
                    errors.email ? 'border-red-500' : 'border-white/10'
                  }`}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiOutlineLockClosed className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`block w-full pl-10 pr-12 py-2.5 rounded-lg bg-white/5 border text-white placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 ${
                    errors.password ? 'border-red-500' : 'border-white/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <HiOutlineEyeOff className="h-5 w-5" />
                  ) : (
                    <HiOutlineEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiOutlineLockClosed className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  className={`block w-full pl-10 pr-12 py-2.5 rounded-lg bg-white/5 border text-white placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-white/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showConfirmPassword ? (
                    <HiOutlineEyeOff className="h-5 w-5" />
                  ) : (
                    <HiOutlineEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Role Selection Field */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-1.5">
                Role
              </label>
              <select
                id="role"
                {...register('role')}
                className={`block w-full px-4 py-2.5 rounded-lg bg-white/5 border text-white placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 ${
                  errors.role ? 'border-red-500' : 'border-white/10'
                }`}
              >
                {REGISTRABLE_ROLES.map((roleOption) => (
                  <option key={roleOption.value} value={roleOption.value}>
                    {roleOption.label}
                  </option>
                ))}
              </select>
              {errors.role && <p className="mt-1 text-xs text-red-400">{errors.role.message}</p>}
              <p className="mt-1 text-xs text-slate-500">
                Admin role cannot be assigned during registration.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                  Creating account…
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-slate-400 text-xs mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-green-400 hover:text-green-300 font-medium">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-6">
          &copy; {new Date().getFullYear()} Mart POS &amp; Retail. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default RegistrationPage;
