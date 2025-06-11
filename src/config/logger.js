const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logDirectory = path.join(process.cwd(), 'logs');

// Ensure the logs directory exists
try {
  fs.mkdirSync(logDirectory, { recursive: true });
} catch (err) {
  console.error('Could not create logs directory', err);
}

// Create log files if they don't exist
const fileRetrievalLogPath = path.join(logDirectory, 'file-retrieval.log');
const errorLogPath = path.join(logDirectory, 'errors.log');

// Ensure log files exist
try {
  fs.writeFileSync(fileRetrievalLogPath, '', { flag: 'a+' });
  fs.writeFileSync(errorLogPath, '', { flag: 'a+' });
} catch (err) {
  console.error('Could not create log files', err);
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create a logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // File transport for file retrieval logs
    new winston.transports.File({
      filename: fileRetrievalLogPath,
      level: 'info'
    }),
    
    // Error log file
    new winston.transports.File({
      filename: errorLogPath,
      level: 'error'
    })
  ]
});

// Log unhandled errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = {
  /**
   * Log a file retrieval attempt
   * @param {Object} options - Logging options
   * @param {string} options.filePath - Path of the retrieved file
   * @param {string} options.clientIp - IP address of the client
   * @param {boolean} [options.success=true] - Whether the retrieval was successful
   */
  logFileRetrieval: ({ filePath, clientIp, success = true }) => {
    logger.info('File Retrieval', {
      filePath,
      clientIp,
      success,
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Log an error during file retrieval
   * @param {Object} options - Error logging options
   * @param {string} options.filePath - Path of the file that caused the error
   * @param {string} options.clientIp - IP address of the client
   * @param {string} options.errorMessage - Description of the error
   */
  logFileRetrievalError: ({ filePath, clientIp, errorMessage }) => {
    logger.error('File Retrieval Error', {
      filePath,
      clientIp,
      errorMessage,
      timestamp: new Date().toISOString()
    });
  },

  // Direct access to the logger for other types of logging
  logger
};