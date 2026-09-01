/**
 * @file models/TransactionItem.js
 * @description Sequelize model definition for individual line items within a sales transaction.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const TransactionItem = sequelize.define(
  'TransactionItem',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    transactionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'transactions',
        key: 'id',
      },
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    productNameSnapshot: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    skuSnapshot: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: { args: [0], msg: 'Unit price cannot be negative' },
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: { args: [1], msg: 'Line item quantity must be at least 1' },
      },
    },
    lineTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: { args: [0], msg: 'Line total cannot be negative' },
      },
    },
  },
  {
    tableName: 'transaction_items',
    timestamps: true,
    underscored: true,
  }
);

module.exports = TransactionItem;
