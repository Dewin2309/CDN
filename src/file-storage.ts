import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

/**
 * Configuration for file storage
 */
export interface FileStorageConfig {
  basePath: string;
  maxFileSize?: number; // in bytes
  allowedFileTypes?: string[];
}

/**
 * File storage service for managing file operations
 */
export class FileStorageService {
  private config: FileStorageConfig;

  /**
   * Create a new FileStorageService instance
   * @param config Configuration for file storage
   */
  constructor(config: FileStorageConfig) {
    this.config = {
      basePath: config.basePath,
      maxFileSize: config.maxFileSize || 10 * 1024 * 1024, // 10MB default
      allowedFileTypes: config.allowedFileTypes || []
    };

    // Ensure base directory exists
    this.ensureBaseDirectory();
  }

  /**
   * Ensure the base directory exists
   * @private
   */
  private async ensureBaseDirectory() {
    try {
      await fs.mkdir(this.config.basePath, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create base directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a unique file identifier
   * @returns Unique file identifier
   */
  private generateFileId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Validate file before storage
   * @param file File to validate
   * @throws Error if file does not meet requirements
   */
  private validateFile(file: Buffer) {
    // Check file size
    if (this.config.maxFileSize && file.byteLength > this.config.maxFileSize) {
      throw new Error(`File exceeds maximum size of ${this.config.maxFileSize} bytes`);
    }
  }

  /**
   * Store a file
   * @param file File buffer to store
   * @param originalFileName Optional original file name
   * @returns Unique file identifier
   */
  async storeFile(file: Buffer, originalFileName?: string): Promise<string> {
    // Validate file
    this.validateFile(file);

    // Generate unique file ID
    const fileId = this.generateFileId();

    // Determine file extension
    const fileExt = originalFileName ? path.extname(originalFileName) : '';
    const fileName = `${fileId}${fileExt}`;
    const filePath = path.join(this.config.basePath, fileName);

    try {
      // Write file
      await fs.writeFile(filePath, file);
      return fileId;
    } catch (error) {
      throw new Error(`Failed to store file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve a file by its identifier
   * @param fileId Unique file identifier
   * @returns File buffer
   */
  async retrieveFile(fileId: string): Promise<Buffer> {
    try {
      // Find file matching the ID
      const files = await fs.readdir(this.config.basePath);
      const matchingFile = files.find(file => file.startsWith(fileId));

      if (!matchingFile) {
        throw new Error('File not found');
      }

      const filePath = path.join(this.config.basePath, matchingFile);
      return await fs.readFile(filePath);
    } catch (error) {
      throw new Error(`Failed to retrieve file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a file by its identifier
   * @param fileId Unique file identifier
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      // Find file matching the ID
      const files = await fs.readdir(this.config.basePath);
      const matchingFile = files.find(file => file.startsWith(fileId));

      if (!matchingFile) {
        throw new Error('File not found');
      }

      const filePath = path.join(this.config.basePath, matchingFile);
      await fs.unlink(filePath);
    } catch (error) {
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}