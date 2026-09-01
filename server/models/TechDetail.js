/**
 * @file models/TechDetail.js
 * @description Sequelize model for Tech / Electronics product specific extension attributes.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const TechDetail = sequelize.define(
  'TechDetail',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    warrantyPeriod: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: { msg: 'Warranty period must be an integer (months)' },
        min: { args: [0], msg: 'Warranty period cannot be negative' },
      },
    },
    serialNumber: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        msg: 'A product with this serial number already exists',
      },
      validate: {
        notEmpty: { msg: 'Serial number is required for Tech products' },
      },
    },
  },
  {
    tableName: 'tech_details',
    timestamps: true,
    underscored: true,
  }
);

module.exports = TechDetail;
