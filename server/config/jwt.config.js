/**
 * @file config/jwt.config.js
 * @description JSON Web Token configuration settings.
 */

require('dotenv').config();

const jwtConfig = {
  secret: process.env.JWT_SECRET || 'dev_jwt_secret_fallback_key_pos_2026',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  algorithm: 'HS256',
};

module.exports = jwtConfig;
