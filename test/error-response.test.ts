import { describe, it, expect } from 'vitest';
import { 
  createErrorResponse, 
  ErrorType, 
  ErrorResponse 
} from '../src/utils/error-response';

describe('Error Response Utility', () => {
  describe('createErrorResponse', () => {
    it('should create a NOT_FOUND error response', () => {
      const error = createErrorResponse(ErrorType.NOT_FOUND, 'File test.txt missing');
      
      expect(error).toEqual({
        status: 404,
        code: 'FILE_NOT_FOUND',
        message: 'The requested file could not be found.',
        details: 'File test.txt missing'
      });
    });

    it('should create a FORBIDDEN error response', () => {
      const error = createErrorResponse(ErrorType.FORBIDDEN);
      
      expect(error).toEqual({
        status: 403,
        code: 'ACCESS_FORBIDDEN',
        message: 'You do not have permission to access this file.',
        details: undefined
      });
    });

    it('should create an INTERNAL_ERROR error response', () => {
      const error = createErrorResponse(ErrorType.INTERNAL_ERROR, 'Disk read failure');
      
      expect(error).toEqual({
        status: 500,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred.',
        details: 'Disk read failure'
      });
    });

    it('should create an INVALID_REQUEST error response', () => {
      const error = createErrorResponse(ErrorType.INVALID_REQUEST, 'Invalid file path');
      
      expect(error).toEqual({
        status: 400,
        code: 'INVALID_REQUEST',
        message: 'The request is invalid or malformed.',
        details: 'Invalid file path'
      });
    });
  });
});