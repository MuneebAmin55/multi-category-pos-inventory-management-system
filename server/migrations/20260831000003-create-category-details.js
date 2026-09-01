/**
 * @file migrations/20260831000003-create-category-details.js
 * @description Migration script for creating the category extension tables ('fragile_details', 'cold_details', 'tech_details', 'cleaning_details') in PostgreSQL.
 */

const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    // Create fragile_details
    await queryInterface.createTable('fragile_details', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'products',
          key: 'id',
        },
      },
      handling_note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_fragile: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    // Create cold_details
    await queryInterface.createTable('cold_details', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'products',
          key: 'id',
        },
      },
      expiry_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      storage_temp: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    // Create tech_details
    await queryInterface.createTable('tech_details', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'products',
          key: 'id',
        },
      },
      warranty_period: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      serial_number: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    // Create cleaning_details
    await queryInterface.createTable('cleaning_details', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'products',
          key: 'id',
        },
      },
      is_hazardous: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      safety_note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('cleaning_details');
    await queryInterface.dropTable('tech_details');
    await queryInterface.dropTable('cold_details');
    await queryInterface.dropTable('fragile_details');
  },
};
