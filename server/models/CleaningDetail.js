/**
 * @file models/CleaningDetail.js
 * @description Sequelize model for Cleaning / Chemical product specific extension attributes.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const CleaningDetail = sequelize.define(
  'CleaningDetail',
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
    isHazardous: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    safetyNote: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'cleaning_details',
    timestamps: true,
    underscored: true,
  }
);

module.exports = CleaningDetail;
