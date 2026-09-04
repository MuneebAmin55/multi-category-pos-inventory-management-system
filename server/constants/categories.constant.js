/**
 * @file constants/categories.constant.js
 * @description System product categories and category classification definitions.
 * NOTE: Values are lowercase to match PostgreSQL ENUM type definitions.
 */

const CATEGORIES = {
  FRAGILE: 'fragile',
  COLD: 'cold',
  TECH: 'tech',
  CLEANING: 'cleaning',
  GENERAL: 'general',
};

const ALL_CATEGORIES = Object.values(CATEGORIES);

module.exports = {
  CATEGORIES,
  ALL_CATEGORIES,
};
