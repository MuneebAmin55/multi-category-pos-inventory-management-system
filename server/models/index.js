/**
 * @file models/index.js
 * @description Central model registry and database entity association orchestrator.
 */

const sequelize = require('../database/connection');
const User = require('./User');
const Product = require('./Product');
const FragileDetail = require('./FragileDetail');
const ColdDetail = require('./ColdDetail');
const TechDetail = require('./TechDetail');
const CleaningDetail = require('./CleaningDetail');
const Transaction = require('./Transaction');
const TransactionItem = require('./TransactionItem');

// ============================================================================
// 1. Product <-> Category Extension Associations (1:1)
// ============================================================================

// Fragile Details
Product.hasOne(FragileDetail, {
  foreignKey: 'productId',
  as: 'fragileDetail',
  onDelete: 'CASCADE',
});
FragileDetail.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
});

// Cold / Perishable Details
Product.hasOne(ColdDetail, {
  foreignKey: 'productId',
  as: 'coldDetail',
  onDelete: 'CASCADE',
});
ColdDetail.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
});

// Tech Details
Product.hasOne(TechDetail, {
  foreignKey: 'productId',
  as: 'techDetail',
  onDelete: 'CASCADE',
});
TechDetail.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
});

// Cleaning Details
Product.hasOne(CleaningDetail, {
  foreignKey: 'productId',
  as: 'cleaningDetail',
  onDelete: 'CASCADE',
});
CleaningDetail.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
});

// ============================================================================
// 2. User <-> Transaction Associations (1:N)
// ============================================================================
User.hasMany(Transaction, {
  foreignKey: 'cashierId',
  as: 'transactions',
  onDelete: 'RESTRICT',
});
Transaction.belongsTo(User, {
  foreignKey: 'cashierId',
  as: 'cashier',
});

// ============================================================================
// 3. Transaction <-> TransactionItem Associations (1:N)
// ============================================================================
Transaction.hasMany(TransactionItem, {
  foreignKey: 'transactionId',
  as: 'items',
  onDelete: 'CASCADE',
});
TransactionItem.belongsTo(Transaction, {
  foreignKey: 'transactionId',
  as: 'transaction',
});

// ============================================================================
// 4. Product <-> TransactionItem Associations (1:N)
// ============================================================================
Product.hasMany(TransactionItem, {
  foreignKey: 'productId',
  as: 'transactionItems',
  onDelete: 'RESTRICT',
});
TransactionItem.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
});

const db = {
  sequelize,
  User,
  Product,
  FragileDetail,
  ColdDetail,
  TechDetail,
  CleaningDetail,
  Transaction,
  TransactionItem,
};

module.exports = db;
