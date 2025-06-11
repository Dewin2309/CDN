import { StatusCodes } from 'http-status-codes';

/**
 * Custom error class for file access and permission errors
 */
export class FileAccessError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  /**
   * Create a new FileAccessError
   * @param message - Error message describing the file access issue
   * @param statusCode - HTTP status code representing the error
   */
  constructor(
    message: string, 
    statusCode: number = StatusCodes.FORBIDDEN
  ) {
    super(message);
    this.name = 'FileAccessError';
    this.statusCode = statusCode;
    this.isOperational = true;

    // Ensures the stack trace is captured correctly
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Generate a safe error response that doesn't expose system details
   */
  toJSON() {
    return {
      status: 'error',
      message: 'Unable to access the requested file'
    };
  }
}

/**
 * Different types of file access errors
 */
export const FileAccessErrorTypes = {
  PERMISSION_DENIED: 'Permission denied to access the file',
  FILE_NOT_FOUND: 'File not found or inaccessible',
  DIRECTORY_TRAVERSAL_ATTEMPT: 'Potential directory traversal attempt detected'
};