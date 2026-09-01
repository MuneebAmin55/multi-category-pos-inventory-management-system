/**
 * @file constants/categories.constant.js
 * @description System product categories and category classification definitions.
 */

const CATEGORIES = {
  FRAGILE: 'Fragile',
  COLD: 'Cold',
  TECH: 'Tech',
  CLEANING: 'Cleaning',
  GENERAL: 'General',
};

const ALL_CATEGORIES = Object.values(CATEGORIES);

module.exports = {
  CATEGORIES,
  ALL_CATEGORIES,
};
