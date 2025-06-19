import * as fs from 'fs';
import * as path from 'path';

export class FileStorageService {
  private storageDir: string;

  constructor(storageDir: string = './uploads') {
    this.storageDir = storageDir;
    // Ensure storage directory exists
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  /**
   * Checks if a file exists by its identifier
   * @param fileId Unique file identifier
   * @returns boolean indicating file existence
   */
  fileExists(fileId: string): boolean {
    const filePath = path.join(this.storageDir, fileId);
    return fs.existsSync(filePath);
  }

  /**
   * Retrieves a file's full path by its identifier
   * @param fileId Unique file identifier
   * @returns Full path to the file
   * @throws Error if file does not exist
   */
  getFilePath(fileId: string): string {
    const filePath = path.join(this.storageDir, fileId);
    
    if (!this.fileExists(fileId)) {
      throw new Error('File not found');
    }

    return filePath;
  }
}