/**
 * @file database/init.js
 * @description Database connection verifier and initialization utility.
 */

const sequelize = require('./connection');
const logger = require('../utils/logger');

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully with PostgreSQL.');
    return true;
  } catch (error) {
    logger.error(`Unable to connect to PostgreSQL database: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return false;
  }
};

module.exports = {
  connectDatabase,
  sequelize,
};
