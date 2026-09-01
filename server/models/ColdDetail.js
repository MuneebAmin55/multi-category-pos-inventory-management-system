/**
 * @file models/ColdDetail.js
 * @description Sequelize model for Cold / Perishable product specific extension attributes.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const ColdDetail = sequelize.define(
  'ColdDetail',
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
    expiryDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: { msg: 'Must be a valid date' },
        notEmpty: { msg: 'Expiry date is required for Cold/Perishable items' },
      },
    },
    storageTemp: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Storage temperature is required (e.g. -18°C)' },
      },
    },
  },
  {
    tableName: 'cold_details',
    timestamps: true,
    underscored: true,
  }
);

module.exports = ColdDetail;
