/**
 * @file services/auth.service.js
 * @description Authentication service implementing user registration, credential verification, and JWT generation.
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { REGISTRABLE_ROLES, ROLES } = require('../constants/roles.constant');
const jwtConfig = require('../config/jwt.config');
const ApiError = require('../utils/apiError');

/**
 * Generate a signed JSON Web Token for an authenticated user.
 * @param {Object} user - Sequelize User instance
 * @returns {string} Signed JWT string
 */
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };

  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
    algorithm: jwtConfig.algorithm,
  });
};

/**
 * Register a new staff user.
 * @param {Object} userData - User registration attributes
 * @returns {Promise<{user: Object, token: string}>}
 */
const registerUser = async ({ name, email, password, role }) => {
  // ────────────────────────────────────────────────────────────────────
  // Security: Prevent Admin role registration
  // ────────────────────────────────────────────────────────────────────
  if (role === ROLES.ADMIN) {
    throw ApiError.forbidden(
      'Admin role cannot be assigned during registration. Admin users can only be created by administrators through the database.'
    );
  }

  // Validate role is in registrable roles
  if (!REGISTRABLE_ROLES.includes(role)) {
    throw ApiError.badRequest(
      `Invalid role. Only the following roles can be registered: ${REGISTRABLE_ROLES.join(', ')}`
    );
  }

  // Check if email already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw ApiError.conflict('An account with this email address already exists.');
  }

  // Create new user (password is automatically hashed via Sequelize beforeCreate hook)
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  const token = generateToken(user);

  return {
    user: user.toJSON(),
    token,
  };
};

/**
 * Authenticate user credentials and issue JWT.
 * @param {Object} credentials - User login credentials
 * @returns {Promise<{user: Object, token: string}>}
 */
const loginUser = async ({ email, password }) => {
  // Find user by email
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  // Verify if account is active
  if (!user.isActive) {
    throw ApiError.forbidden('Your account has been deactivated. Please contact an administrator.');
  }

  // Verify password using bcrypt comparison method
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  const token = generateToken(user);

  return {
    user: user.toJSON(),
    token,
  };
};

/**
 * Retrieve user profile by ID.
 * @param {string} userId - User UUID
 * @returns {Promise<Object>}
 */
const getUserProfile = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw ApiError.notFound('User account not found.');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Your account has been deactivated.');
  }

  return user.toJSON();
};

module.exports = {
  generateToken,
  registerUser,
  loginUser,
  getUserProfile,
};
