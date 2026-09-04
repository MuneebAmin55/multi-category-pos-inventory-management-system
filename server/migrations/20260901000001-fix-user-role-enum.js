/**
 * @file migrations/20260901000001-fix-user-role-enum.js
 * @description Corrective migration to fix the user role enum to match the standard roles.
 * Changes enum from ('admin', 'manager', 'cashier', 'inventory_staff')
 * to ('admin', 'inventory_manager', 'cashier')
 */

const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get the dialect to handle PostgreSQL-specific SQL
    const dialect = queryInterface.sequelize.options.dialect;

    if (dialect === 'postgres') {
      try {
        // Step 1: Try to drop old temp type if it exists from a previous failed run
        await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_users_role_new CASCADE");
      } catch (e) {
        // Ignore if type doesn't exist
      }

      // Step 2: Create new enum type with correct values
      await queryInterface.sequelize.query(
        "CREATE TYPE enum_users_role_new AS ENUM ('admin', 'inventory_manager', 'cashier')"
      );

      // Step 3: Drop the default constraint first
      await queryInterface.sequelize.query(
        "ALTER TABLE users ALTER COLUMN role DROP DEFAULT"
      );

      // Step 4: Alter column to use text temporarily to avoid enum conversion errors
      await queryInterface.sequelize.query(
        "ALTER TABLE users ALTER COLUMN role TYPE text"
      );

      // Step 5: Update existing rows to use new enum values
      await queryInterface.sequelize.query(
        "UPDATE users SET role = 'inventory_manager' WHERE role IN ('inventory_staff', 'manager')"
      );

      // Step 6: Convert the column type to new enum
      await queryInterface.sequelize.query(
        "ALTER TABLE users ALTER COLUMN role TYPE enum_users_role_new USING role::enum_users_role_new"
      );

      // Step 7: Set the default value
      await queryInterface.sequelize.query(
        "ALTER TABLE users ALTER COLUMN role SET DEFAULT 'cashier'"
      );

      // Step 8: Drop old enum type
      await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_users_role CASCADE");

      // Step 9: Rename new enum to original name
      await queryInterface.sequelize.query(
        "ALTER TYPE enum_users_role_new RENAME TO enum_users_role"
      );
    }
  },

  async down(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.options.dialect;

    if (dialect === 'postgres') {
      try {
        // Try to drop if it exists
        await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_users_role_new CASCADE");
      } catch (e) {
        // Ignore
      }

      // Revert to old enum type
      await queryInterface.sequelize.query(
        "CREATE TYPE enum_users_role_new AS ENUM ('admin', 'manager', 'cashier', 'inventory_staff')"
      );

      // Drop the default
      await queryInterface.sequelize.query(
        "ALTER TABLE users ALTER COLUMN role DROP DEFAULT"
      );

      // Convert column to text
      await queryInterface.sequelize.query(
        "ALTER TABLE users ALTER COLUMN role TYPE text"
      );

      // Revert the data
      await queryInterface.sequelize.query(
        "UPDATE users SET role = 'inventory_staff' WHERE role = 'inventory_manager'"
      );

      // Convert the column type back
      await queryInterface.sequelize.query(
        "ALTER TABLE users ALTER COLUMN role TYPE enum_users_role_new USING role::enum_users_role_new"
      );

      // Set default back
      await queryInterface.sequelize.query(
        "ALTER TABLE users ALTER COLUMN role SET DEFAULT 'cashier'"
      );

      // Drop new enum type
      await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_users_role CASCADE");

      // Rename back
      await queryInterface.sequelize.query(
        "ALTER TYPE enum_users_role_new RENAME TO enum_users_role"
      );
    }
  },
};
