import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { FileStorageService } from './file-storage';

describe('FileStorageService', () => {
  const TEST_BASE_PATH = './test-uploads';
  let fileStorageService: FileStorageService;

  beforeEach(async () => {
    // Create a fresh test directory for each test
    await fs.mkdir(TEST_BASE_PATH, { recursive: true });
    
    fileStorageService = new FileStorageService({
      basePath: TEST_BASE_PATH,
      maxFileSize: 1024 * 1024, // 1MB
    });
  });

  afterEach(async () => {
    // Clean up test directory after each test
    await fs.rm(TEST_BASE_PATH, { recursive: true, force: true });
  });

  it('should store a file and return a unique identifier', async () => {
    const testFile = Buffer.from('Test file content');
    const fileId = await fileStorageService.storeFile(testFile, 'test.txt');

    expect(fileId).toBeTruthy();
    expect(fileId.length).toBe(32); // hex representation of 16 bytes

    // Verify file exists
    const files = await fs.readdir(TEST_BASE_PATH);
    const matchingFile = files.find(file => file.startsWith(fileId));
    expect(matchingFile).toBeTruthy();
  });

  it('should retrieve a stored file', async () => {
    const testFile = Buffer.from('Test file content');
    const fileId = await fileStorageService.storeFile(testFile, 'test.txt');

    const retrievedFile = await fileStorageService.retrieveFile(fileId);
    expect(retrievedFile).toEqual(testFile);
  });

  it('should delete a stored file', async () => {
    const testFile = Buffer.from('Test file content');
    const fileId = await fileStorageService.storeFile(testFile, 'test.txt');

    await fileStorageService.deleteFile(fileId);

    // Verify file is deleted
    const files = await fs.readdir(TEST_BASE_PATH);
    const matchingFile = files.find(file => file.startsWith(fileId));
    expect(matchingFile).toBeUndefined();
  });

  it('should throw error when file exceeds max size', async () => {
    const largefile = Buffer.alloc(2 * 1024 * 1024); // 2MB file
    
    await expect(fileStorageService.storeFile(largefile)).rejects.toThrow(
      'File exceeds maximum size'
    );
  });

  it('should throw error when retrieving non-existent file', async () => {
    await expect(fileStorageService.retrieveFile('non-existent-id')).rejects.toThrow(
      'File not found'
    );
  });

  it('should throw error when deleting non-existent file', async () => {
    await expect(fileStorageService.deleteFile('non-existent-id')).rejects.toThrow(
      'File not found'
    );
  });
});