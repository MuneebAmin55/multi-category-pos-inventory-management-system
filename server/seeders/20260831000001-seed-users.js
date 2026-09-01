/**
 * @file seeders/20260831000001-seed-users.js
 * @description Seeder script for initial demo staff users across Admin, Inventory Manager, and Cashier roles.
 */

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const users = [
      {
        id: uuidv4(),
        name: 'Admin User',
        email: 'admin@pos.local',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Inventory Manager',
        email: 'manager@pos.local',
        password: await bcrypt.hash('manager123', 10),
        role: 'inventory_staff',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'John Cashier',
        email: 'john@pos.local',
        password: await bcrypt.hash('cashier123', 10),
        role: 'cashier',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Sarah Cashier',
        email: 'sarah@pos.local',
        password: await bcrypt.hash('cashier123', 10),
        role: 'cashier',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('users', users, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      email: {
        [require('sequelize').Op.in]: ['admin@pos.local', 'manager@pos.local', 'john@pos.local', 'sarah@pos.local'],
      },
    }, {});
  },
};
