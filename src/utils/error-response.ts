/**
 * Centralized error response utility for the CDN file retrieval service
 */
export interface ErrorResponse {
  status: number;
  code: string;
  message: string;
  details?: string;
}

/**
 * Error types for the CDN file retrieval service
 */
export enum ErrorType {
  NOT_FOUND = 'NOT_FOUND',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST'
}

/**
 * Creates a standardized error response
 * @param type The type of error
 * @param details Optional additional error details
 * @returns Standardized error response object
 */
export function createErrorResponse(
  type: ErrorType, 
  details?: string
): ErrorResponse {
  switch (type) {
    case ErrorType.NOT_FOUND:
      return {
        status: 404,
        code: 'FILE_NOT_FOUND',
        message: 'The requested file could not be found.',
        details
      };
    
    case ErrorType.FORBIDDEN:
      return {
        status: 403,
        code: 'ACCESS_FORBIDDEN',
        message: 'You do not have permission to access this file.',
        details
      };
    
    case ErrorType.INTERNAL_ERROR:
      return {
        status: 500,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred.',
        details
      };
    
    case ErrorType.INVALID_REQUEST:
      return {
        status: 400,
        code: 'INVALID_REQUEST',
        message: 'The request is invalid or malformed.',
        details
      };
    
    default:
      return {
        status: 500,
        code: 'UNKNOWN_ERROR',
        message: 'An unspecified error occurred.',
        details
      };
  }
}

/**
 * Handles and logs error responses
 * @param error The error response to handle
 */
export function handleErrorResponse(error: ErrorResponse): void {
  // In a real-world scenario, this would integrate with a logging system
  console.error(`Error [${error.code}]: ${error.message}`, 
    error.details ? `Details: ${error.details}` : '');
}