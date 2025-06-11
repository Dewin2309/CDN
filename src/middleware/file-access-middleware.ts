import { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { FileAccessError, FileAccessErrorTypes } from '../errors/file-access-error';
import { StatusCodes } from 'http-status-codes';

/**
 * Middleware to validate file access and permissions
 * @param cdnDirectory - Base directory for serving files
 */
export const validateFileAccess = (cdnDirectory: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestedFilePath = req.params.filePath || req.query.file as string;
      
      // Prevent directory traversal
      if (!requestedFilePath || requestedFilePath.includes('..')) {
        throw new FileAccessError(
          FileAccessErrorTypes.DIRECTORY_TRAVERSAL_ATTEMPT, 
          StatusCodes.BAD_REQUEST
        );
      }

      // Resolve the full file path
      const fullFilePath = path.resolve(
        cdnDirectory, 
        // Sanitize the file path to remove leading slashes
        requestedFilePath.replace(/^\/+/, '')
      );

      // Ensure the resolved path is within the CDN directory
      if (!fullFilePath.startsWith(path.resolve(cdnDirectory))) {
        throw new FileAccessError(
          FileAccessErrorTypes.DIRECTORY_TRAVERSAL_ATTEMPT, 
          StatusCodes.FORBIDDEN
        );
      }

      // Check file existence and permissions
      try {
        const stats = await fs.stat(fullFilePath);
        
        // Additional permission checks can be added here
        if (!stats.isFile()) {
          throw new FileAccessError(
            FileAccessErrorTypes.FILE_NOT_FOUND, 
            StatusCodes.NOT_FOUND
          );
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          throw new FileAccessError(
            FileAccessErrorTypes.FILE_NOT_FOUND, 
            StatusCodes.NOT_FOUND
          );
        }
        if ((error as NodeJS.ErrnoException).code === 'EACCES') {
          throw new FileAccessError(
            FileAccessErrorTypes.PERMISSION_DENIED, 
            StatusCodes.FORBIDDEN
          );
        }
        throw error;
      }

      // Attach the full file path to the request for subsequent middleware
      (req as any).fullFilePath = fullFilePath;
      next();
    } catch (error) {
      if (error instanceof FileAccessError) {
        return res.status(error.statusCode).json(error.toJSON());
      }
      next(error);
    }
  };
};