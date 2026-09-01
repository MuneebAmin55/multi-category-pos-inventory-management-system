/**
 * @file controllers/user.controller.js
 * @description Controller handling Admin user management HTTP requests.
 */

const userService = require('../services/user.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route GET /api/users
 * @desc List and search users with pagination and filters
 * @access Private (Admin only)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { search, role, isActive, page, limit } = req.query;
  const result = await userService.listUsers({ search, role, isActive, page, limit });

  return ApiResponse.success(res, 'Users retrieved successfully', result.users, result.pagination);
});

/**
 * @route GET /api/users/:id
 * @desc Get user profile by ID
 * @access Private (Admin only)
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  return ApiResponse.success(res, 'User retrieved successfully', { user });
});

/**
 * @route POST /api/users
 * @desc Create new user account with role
 * @access Private (Admin only)
 */
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const newUser = await userService.createUser({ name, email, password, role });

  return ApiResponse.created(res, 'User created successfully', { user: newUser });
});

/**
 * @route PUT /api/users/:id
 * @desc Update user details
 * @access Private (Admin only)
 */
const updateUser = asyncHandler(async (req, res) => {
  const updatedUser = await userService.updateUser(req.params.id, req.body);

  return ApiResponse.success(res, 'User updated successfully', { user: updatedUser });
});

/**
 * @route PATCH /api/users/:id/role
 * @desc Update / assign user role
 * @access Private (Admin only)
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const updatedUser = await userService.updateUserRole(req.params.id, role, req.user.id);

  return ApiResponse.success(res, 'User role updated successfully', { user: updatedUser });
});

/**
 * @route PATCH /api/users/:id/status
 * @desc Toggle user active/deactivated status
 * @access Private (Admin only)
 */
const toggleUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const updatedUser = await userService.toggleUserStatus(req.params.id, isActive, req.user.id);

  const statusText = isActive ? 'activated' : 'deactivated';
  return ApiResponse.success(res, `User account ${statusText} successfully`, { user: updatedUser });
});

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserRole,
  toggleUserStatus,
};
