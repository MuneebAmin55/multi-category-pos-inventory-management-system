/**
 * @file services/user.service.js
 * @description Service layer managing staff accounts, search queries, role assignments, and activation states.
 */

const { Op } = require('sequelize');
const { User } = require('../models');
const ApiError = require('../utils/apiError');
const { ROLES } = require('../constants/roles.constant');

/**
 * List all users with optional search, role filter, active status, and pagination.
 */
const listUsers = async ({ search = '', role, isActive, page = 1, limit = 10 }) => {
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const offset = (pageNum - 1) * limitNum;

  const where = {};

  // Case-insensitive search on name or email
  if (search && search.trim() !== '') {
    const trimmedSearch = search.trim();
    where[Op.or] = [
      { name: { [Op.iLike]: `%${trimmedSearch}%` } },
      { email: { [Op.iLike]: `%${trimmedSearch}%` } },
    ];
  }

  // Filter by role
  if (role) {
    where.role = role;
  }

  // Filter by active status
  if (isActive !== undefined && isActive !== '') {
    where.isActive = isActive === 'true' || isActive === true;
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    limit: limitNum,
    offset,
    order: [['createdAt', 'DESC']],
    attributes: { exclude: ['password'] },
  });

  return {
    users: rows,
    pagination: {
      total: count,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(count / limitNum) || 1,
    },
  };
};

/**
 * Retrieve user by ID.
 */
const getUserById = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] },
  });

  if (!user) {
    throw ApiError.notFound(`User with ID '${userId}' not found.`);
  }

  return user;
};

/**
 * Create a new user account.
 */
const createUser = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw ApiError.conflict('An account with this email address already exists.');
  }

  const newUser = await User.create({
    name,
    email,
    password,
    role: role || ROLES.CASHIER,
    isActive: true,
  });

  return newUser.toJSON();
};

/**
 * Update general user details.
 */
const updateUser = async (userId, updateData) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw ApiError.notFound(`User with ID '${userId}' not found.`);
  }

  // If email is changing, check uniqueness
  if (updateData.email && updateData.email !== user.email) {
    const existing = await User.findOne({ where: { email: updateData.email } });
    if (existing) {
      throw ApiError.conflict('An account with this email address already exists.');
    }
    user.email = updateData.email;
  }

  if (updateData.name) user.name = updateData.name;
  if (updateData.password) user.password = updateData.password;
  if (updateData.role) user.role = updateData.role;
  if (updateData.isActive !== undefined) user.isActive = updateData.isActive;

  await user.save();

  return user.toJSON();
};

/**
 * Assign / Update a user's role.
 */
const updateUserRole = async (userId, newRole, currentAdminId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw ApiError.notFound(`User with ID '${userId}' not found.`);
  }

  // Prevent an admin from accidentally demoting their own account
  if (user.id === currentAdminId && newRole !== ROLES.ADMIN) {
    throw ApiError.badRequest('Administrators cannot demote their own account.');
  }

  user.role = newRole;
  await user.save();

  return user.toJSON();
};

/**
 * Activate or Deactivate a user's account.
 */
const toggleUserStatus = async (userId, isActive, currentAdminId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw ApiError.notFound(`User with ID '${userId}' not found.`);
  }

  // Prevent an admin from deactivating themselves
  if (user.id === currentAdminId && !isActive) {
    throw ApiError.badRequest('Administrators cannot deactivate their own account.');
  }

  user.isActive = isActive;
  await user.save();

  return user.toJSON();
};

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserRole,
  toggleUserStatus,
};
