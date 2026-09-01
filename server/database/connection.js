/**
 * @file database/connection.js
 * @description Sequelize instance initialization connecting to PostgreSQL database.
 */

const { Sequelize } = require('sequelize');
const dbConfigs = require('../config/db.config');
const logger = require('../utils/logger');

const env = process.env.NODE_ENV || 'development';
const config = dbConfigs[env] || dbConfigs.development;

let sequelize;

if (config.url || (env === 'production' && process.env.DATABASE_URL)) {
  const connectionUrl = config.url || process.env.DATABASE_URL;
  sequelize = new Sequelize(connectionUrl, {
    ...config,
    logging: (msg) => logger.debug(msg),
  });
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, {
    ...config,
    logging: (msg) => logger.debug(msg),
  });
}

module.exports = sequelize;
