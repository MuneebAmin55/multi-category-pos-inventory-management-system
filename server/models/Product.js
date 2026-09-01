/**
 * @file models/Product.js
 * @description Sequelize model definition for base Product entity.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const { CATEGORIES, ALL_CATEGORIES } = require('../constants/categories.constant');

const Product = sequelize.define(
  'Product',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    sku: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: {
        msg: 'A product with this SKU / Barcode already exists',
      },
      validate: {
        notEmpty: { msg: 'SKU / Barcode is required' },
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Product name cannot be empty' },
        len: { args: [2, 255], msg: 'Product name must be between 2 and 255 characters' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM(...ALL_CATEGORIES),
      allowNull: false,
      defaultValue: CATEGORIES.GENERAL,
      validate: {
        isIn: {
          args: [ALL_CATEGORIES],
          msg: `Category must be one of: ${ALL_CATEGORIES.join(', ')}`,
        },
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: { msg: 'Price must be a valid decimal number' },
        min: { args: [0.01], msg: 'Price must be at least 0.01' },
      },
    },
    quantityInStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: { msg: 'Quantity in stock must be an integer' },
        min: { args: [0], msg: 'Quantity in stock cannot be negative' },
      },
    },
    reorderThreshold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      validate: {
        isInt: { msg: 'Reorder threshold must be an integer' },
        min: { args: [0], msg: 'Reorder threshold cannot be negative' },
      },
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'products',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Product;
