/**
 * @file models/FragileDetail.js
 * @description Sequelize model for Fragile product specific extension attributes.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const FragileDetail = sequelize.define(
  'FragileDetail',
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
    handlingNote: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isFragile: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'fragile_details',
    timestamps: true,
    underscored: true,
  }
);

module.exports = FragileDetail;
