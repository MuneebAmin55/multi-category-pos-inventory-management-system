/**
 * @file models/Transaction.js
 * @description Sequelize model definition for completed POS sales transactions (invoices).
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const { PAYMENT_METHODS, ALL_PAYMENT_METHODS } = require('../constants/paymentMethods.constant');

const Transaction = sequelize.define(
  'Transaction',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    invoiceNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        msg: 'Invoice number must be unique',
      },
      validate: {
        notEmpty: { msg: 'Invoice number is required' },
      },
    },
    cashierId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: { args: [0], msg: 'Subtotal cannot be negative' },
      },
    },
    taxRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 5.0, // Flat 5% tax rate
      validate: {
        isDecimal: true,
        min: { args: [0], msg: 'Tax rate cannot be negative' },
      },
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: { args: [0], msg: 'Tax amount cannot be negative' },
      },
    },
    grandTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: { args: [0], msg: 'Grand total cannot be negative' },
      },
    },
    paymentMethod: {
      type: DataTypes.ENUM(...ALL_PAYMENT_METHODS),
      allowNull: false,
      defaultValue: PAYMENT_METHODS.CASH,
      validate: {
        isIn: {
          args: [ALL_PAYMENT_METHODS],
          msg: `Payment method must be one of: ${ALL_PAYMENT_METHODS.join(', ')}`,
        },
      },
    },
  },
  {
    tableName: 'transactions',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Transaction;
