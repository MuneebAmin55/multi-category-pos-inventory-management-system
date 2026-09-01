/**
 * @file server.js
 * @description Server bootstrap entry point. Initializes DB connection, loads environment variables, and starts HTTP listener.
 */

require('dotenv').config();
const app = require('./app');
const { connectDatabase } = require('./database/init');
const logger = require('./utils/logger');

// Catch uncaught exceptions before anything else
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down immediately...', err);
  process.exit(1);
});

const PORT = parseInt(process.env.PORT, 10) || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

let server;

const startServer = async () => {
  try {
    // Attempt DB connection verification
    await connectDatabase();

    server = app.listen(PORT, () => {
      logger.info(`[POS Server] Running in [${NODE_ENV}] mode on port ${PORT}`);
      logger.info(`[POS Server] API Endpoint: http://localhost:${PORT}/api`);
      logger.info(`[POS Server] Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    logger.error('Fatal error during server startup:', error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Gracefully shutting down...', err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle termination signals
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Closing HTTP server and database connections...`);
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed successfully.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = server;
