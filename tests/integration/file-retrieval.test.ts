import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import request from 'supertest';
import { app } from '../../src/app'; // Adjust import based on your actual app setup

describe('File Retrieval Endpoint Integration Tests', () => {
  const testFilesDir = path.join(__dirname, '..', '..', 'test-files');
  
  // Ensure test files directory exists
  beforeAll(() => {
    if (!fs.existsSync(testFilesDir)) {
      fs.mkdirSync(testFilesDir);
    }
  });

  // Create a test file before tests
  const testFileName = 'sample-retrieval-file.txt';
  const testFilePath = path.join(testFilesDir, testFileName);
  const testFileContent = 'This is a test file for retrieval';

  beforeEach(() => {
    fs.writeFileSync(testFilePath, testFileContent);
  });

  // Clean up after tests
  afterEach(() => {
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  it('should successfully retrieve an existing file', async () => {
    const apiKey = 'test-api-key'; // Use a valid test API key

    const response = await request(app)
      .get(`/api/files/${testFileName}`)
      .set('X-API-Key', apiKey)
      .expect(200);

    expect(response.text).toBe(testFileContent);
  });

  it('should return 404 for non-existent file', async () => {
    const apiKey = 'test-api-key'; // Use a valid test API key

    await request(app)
      .get('/api/files/non-existent-file.txt')
      .set('X-API-Key', apiKey)
      .expect(404);
  });

  it('should return 403 for invalid API key', async () => {
    await request(app)
      .get(`/api/files/${testFileName}`)
      .set('X-API-Key', 'invalid-key')
      .expect(403);
  });

  it('should handle files with special characters', async () => {
    const specialFileName = 'special-file@#$.txt';
    const specialFilePath = path.join(testFilesDir, specialFileName);
    const specialFileContent = 'File with special characters';

    fs.writeFileSync(specialFilePath, specialFileContent);

    const apiKey = 'test-api-key'; // Use a valid test API key

    const response = await request(app)
      .get(`/api/files/${encodeURIComponent(specialFileName)}`)
      .set('X-API-Key', apiKey)
      .expect(200);

    expect(response.text).toBe(specialFileContent);

    // Clean up
    fs.unlinkSync(specialFilePath);
  });
});