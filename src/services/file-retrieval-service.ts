import fs from 'fs/promises';
import path from 'path';
import { 
  FileNotFoundError, 
  FileAccessError, 
  FileSizeError 
} from '../errors/file-errors';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export class FileRetrievalService {
  /**
   * Retrieves a file with comprehensive error handling
   * @param filePath Relative path to the file
   * @returns File contents as Buffer
   * @throws {FileNotFoundError} If file does not exist
   * @throws {FileAccessError} If file cannot be accessed
   * @throws {FileSizeError} If file is too large
   */
  async retrieveFile(filePath: string): Promise<Buffer> {
    try {
      // Validate file path
      const normalizedPath = path.normalize(filePath);
      
      // Check file existence
      await fs.access(normalizedPath);
      
      // Get file stats
      const stats = await fs.stat(normalizedPath);
      
      // Check file size
      if (stats.size > MAX_FILE_SIZE) {
        throw new FileSizeError(MAX_FILE_SIZE);
      }
      
      // Read file
      return await fs.readFile(normalizedPath);
    } catch (error) {
      // Handle specific error scenarios
      if (error instanceof FileSizeError) {
        throw error;
      }
      
      if (error instanceof Error && 'code' in error) {
        switch ((error as NodeJS.ErrnoException).code) {
          case 'ENOENT':
            throw new FileNotFoundError(filePath);
          case 'EACCES':
            throw new FileAccessError(filePath, 'Permission denied');
          default:
            throw new FileAccessError(filePath, error.message);
        }
      }
      
      throw error;
    }
  }
}