/**
 * @file seeders/20260831000002-seed-products.js
 * @description Seeder script for initial demo products across Fragile, Cold, Tech, Cleaning, and General categories.
 */

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    const products = [
      // Fragile Products
      {
        id: uuidv4(),
        sku: 'FRAG-001',
        name: 'Glass Vase - Decorative',
        description: 'Beautiful decorative glass vase',
        category: 'fragile',
        price: 25.99,
        quantity_in_stock: 15,
        reorder_threshold: 5,
        image_url: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        sku: 'FRAG-002',
        name: 'Porcelain Dishes Set',
        description: 'Set of 12 porcelain dinner plates',
        category: 'fragile',
        price: 49.99,
        quantity_in_stock: 8,
        reorder_threshold: 3,
        image_url: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Cold Products
      {
        id: uuidv4(),
        sku: 'COLD-001',
        name: 'Organic Milk - 1L',
        description: 'Fresh organic whole milk',
        category: 'cold',
        price: 3.99,
        quantity_in_stock: 50,
        reorder_threshold: 20,
        image_url: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        sku: 'COLD-002',
        name: 'Yogurt - Plain 500g',
        description: 'Greek yogurt plain flavor',
        category: 'cold',
        price: 5.49,
        quantity_in_stock: 30,
        reorder_threshold: 15,
        image_url: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Tech Products
      {
        id: uuidv4(),
        sku: 'TECH-001',
        name: 'Wireless Bluetooth Headphones',
        description: 'Noise-cancelling wireless headphones',
        category: 'tech',
        price: 89.99,
        quantity_in_stock: 12,
        reorder_threshold: 5,
        image_url: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        sku: 'TECH-002',
        name: 'USB-C Fast Charger',
        description: '65W USB-C power adapter',
        category: 'tech',
        price: 34.99,
        quantity_in_stock: 25,
        reorder_threshold: 10,
        image_url: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Cleaning Products
      {
        id: uuidv4(),
        sku: 'CLEAN-001',
        name: 'All-Purpose Cleaner',
        description: 'Multi-surface cleaning spray 500ml',
        category: 'cleaning',
        price: 2.99,
        quantity_in_stock: 100,
        reorder_threshold: 30,
        image_url: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        sku: 'CLEAN-002',
        name: 'Disinfectant Wipes',
        description: 'Pack of 100 disinfectant wipes',
        category: 'cleaning',
        price: 4.99,
        quantity_in_stock: 45,
        reorder_threshold: 15,
        image_url: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // General Products
      {
        id: uuidv4(),
        sku: 'GEN-001',
        name: 'Notebook - Lined',
        description: 'A4 lined notebook 100 pages',
        category: 'general',
        price: 1.99,
        quantity_in_stock: 200,
        reorder_threshold: 50,
        image_url: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        sku: 'GEN-002',
        name: 'Pen Set - 10 pack',
        description: 'Assorted color ballpoint pens',
        category: 'general',
        price: 3.49,
        quantity_in_stock: 150,
        reorder_threshold: 40,
        image_url: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('products', products, {});

    // Get product IDs for seeding category details
    const fragileProducts = await queryInterface.sequelize.query(
      `SELECT id FROM products WHERE sku IN ('FRAG-001', 'FRAG-002')`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const coldProducts = await queryInterface.sequelize.query(
      `SELECT id FROM products WHERE sku IN ('COLD-001', 'COLD-002')`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const techProducts = await queryInterface.sequelize.query(
      `SELECT id FROM products WHERE sku IN ('TECH-001', 'TECH-002')`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const cleaningProducts = await queryInterface.sequelize.query(
      `SELECT id FROM products WHERE sku IN ('CLEAN-001', 'CLEAN-002')`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Seed fragile_details
    if (fragileProducts.length > 0) {
      await queryInterface.bulkInsert('fragile_details', [
        {
          id: uuidv4(),
          product_id: fragileProducts[0].id,
          handling_note: 'Handle with care - fragile glass',
          is_fragile: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          product_id: fragileProducts[1].id,
          handling_note: 'Porcelain - avoid stacking',
          is_fragile: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);
    }

    // Seed cold_details
    if (coldProducts.length > 0) {
      await queryInterface.bulkInsert('cold_details', [
        {
          id: uuidv4(),
          product_id: coldProducts[0].id,
          expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          storage_temp: '4°C',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          product_id: coldProducts[1].id,
          expiry_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          storage_temp: '4°C',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);
    }

    // Seed tech_details
    if (techProducts.length > 0) {
      await queryInterface.bulkInsert('tech_details', [
        {
          id: uuidv4(),
          product_id: techProducts[0].id,
          warranty_period: 24,
          serial_number: 'BT-HP-' + Date.now(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          product_id: techProducts[1].id,
          warranty_period: 12,
          serial_number: 'CHG-USB-' + Date.now(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);
    }

    // Seed cleaning_details
    if (cleaningProducts.length > 0) {
      await queryInterface.bulkInsert('cleaning_details', [
        {
          id: uuidv4(),
          product_id: cleaningProducts[0].id,
          is_hazardous: true,
          safety_note: 'Contains chemicals - use with gloves',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          product_id: cleaningProducts[1].id,
          is_hazardous: false,
          safety_note: 'Safe for all surfaces',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('cleaning_details', {});
    await queryInterface.bulkDelete('tech_details', {});
    await queryInterface.bulkDelete('cold_details', {});
    await queryInterface.bulkDelete('fragile_details', {});
    await queryInterface.bulkDelete('products', {});
  },
};
