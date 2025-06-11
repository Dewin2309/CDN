const fs = require('fs');
const path = require('path');
const { logFileRetrieval, logFileRetrievalError, logger } = require('../src/config/logger');

describe('Logger', () => {
  const logDirectory = path.join(process.cwd(), 'logs');
  const fileRetrievalLogPath = path.join(logDirectory, 'file-retrieval.log');
  const errorLogPath = path.join(logDirectory, 'errors.log');

  beforeEach(() => {
    // Clear log files before each test
    if (fs.existsSync(fileRetrievalLogPath)) {
      fs.truncateSync(fileRetrievalLogPath);
    }
    if (fs.existsSync(errorLogPath)) {
      fs.truncateSync(errorLogPath);
    }
  });

  test('logFileRetrieval should log file retrieval information', () => {
    const filePath = '/test/file.txt';
    const clientIp = '127.0.0.1';

    // Spy on the logger's info method
    const infoSpy = jest.spyOn(logger, 'info');

    logFileRetrieval({ filePath, clientIp });

    expect(infoSpy).toHaveBeenCalledWith('File Retrieval', expect.objectContaining({
      filePath,
      clientIp,
      success: true
    }));

    infoSpy.mockRestore();
  });

  test('logFileRetrievalError should log error information', () => {
    const filePath = '/test/error-file.txt';
    const clientIp = '127.0.0.1';
    const errorMessage = 'File not found';

    // Spy on the logger's error method
    const errorSpy = jest.spyOn(logger, 'error');

    logFileRetrievalError({ filePath, clientIp, errorMessage });

    expect(errorSpy).toHaveBeenCalledWith('File Retrieval Error', expect.objectContaining({
      filePath,
      clientIp,
      errorMessage
    }));

    errorSpy.mockRestore();
  });

  test('log files should be created in the logs directory', () => {
    expect(fs.existsSync(logDirectory)).toBe(true);
    expect(fs.existsSync(fileRetrievalLogPath)).toBe(true);
    expect(fs.existsSync(errorLogPath)).toBe(true);
  });
});