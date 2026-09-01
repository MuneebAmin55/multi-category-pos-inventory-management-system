/**
 * @file controllers/auth.controller.js
 * @description Authentication controller handling HTTP endpoints for registration, login, and user profile.
 */

const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route POST /api/auth/register
 * @desc Register a new user account
 * @access Public (or Admin in production)
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const result = await authService.registerUser({ name, email, password, role });

  return ApiResponse.created(res, 'User registered successfully', result);
});

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and issue JWT
 * @access Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser({ email, password });

  return ApiResponse.success(res, 'Login successful', result);
});

/**
 * @route GET /api/auth/me
 * @desc Get currently authenticated user profile
 * @access Private (JWT Required)
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserProfile(req.user.id);

  return ApiResponse.success(res, 'User profile fetched successfully', { user });
});

module.exports = {
  register,
  login,
  getMe,
};
