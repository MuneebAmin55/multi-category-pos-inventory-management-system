/**
 * @file utils/logger.js
 * @description Standard application logging utility with timestamped output formatting.
 */

const getTimestamp = () => new Date().toISOString();

const logger = {
  info: (message, ...args) => {
    console.log(`[INFO] [${getTimestamp()}] ${message}`, ...args);
  },
  warn: (message, ...args) => {
    console.warn(`[WARN] [${getTimestamp()}] ${message}`, ...args);
  },
  error: (message, ...args) => {
    console.error(`[ERROR] [${getTimestamp()}] ${message}`, ...args);
  },
  debug: (message, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] [${getTimestamp()}] ${message}`, ...args);
    }
  },
};

module.exports = logger;
