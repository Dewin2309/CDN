import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { FileRetrievalService } from '../src/services/file-retrieval-service';
import { 
  FileNotFoundError, 
  FileAccessError, 
  FileSizeError 
} from '../src/errors/file-errors';

describe('FileRetrievalService', () => {
  let fileRetrievalService: FileRetrievalService;
  const testDir = path.join(__dirname, 'test-files');

  beforeEach(async () => {
    // Ensure test directory exists
    await fs.mkdir(testDir, { recursive: true });
    fileRetrievalService = new FileRetrievalService();
  });

  it('should successfully retrieve an existing file', async () => {
    const testFilePath = path.join(testDir, 'test.txt');
    await fs.writeFile(testFilePath, 'Test content');

    const result = await fileRetrievalService.retrieveFile(testFilePath);
    expect(result.toString()).toBe('Test content');
  });

  it('should throw FileNotFoundError for non-existent file', async () => {
    const nonExistentPath = path.join(testDir, 'non-existent.txt');
    
    await expect(fileRetrievalService.retrieveFile(nonExistentPath))
      .rejects.toThrow(FileNotFoundError);
  });

  it('should throw FileSizeError for files exceeding max size', async () => {
    const largePath = path.join(testDir, 'large-file.txt');
    const largeContent = Buffer.alloc(11 * 1024 * 1024).fill('a');
    await fs.writeFile(largePath, largeContent);

    await expect(fileRetrievalService.retrieveFile(largePath))
      .rejects.toThrow(FileSizeError);
  });
});