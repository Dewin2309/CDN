import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import supertest from 'supertest';

// Mock dependencies (assuming you have an Express app)
import { createApp } from '../../src/app'; // Adjust path as needed

describe('File Retrieval Endpoint Integration Tests', () => {
  let app: any;
  let request: supertest.SuperTest<supertest.Test>;
  const testUploadDir = path.join(__dirname, '..', '..', 'uploads', 'test');

  beforeEach(() => {
    // Ensure test upload directory exists
    if (!fs.existsSync(testUploadDir)) {
      fs.mkdirSync(testUploadDir, { recursive: true });
    }

    // Create the app for testing
    app = createApp();
    request = supertest(app);
  });

  it('should successfully retrieve an existing file', async () => {
    // Prepare a test file
    const testFileName = 'test-file.txt';
    const testFilePath = path.join(testUploadDir, testFileName);
    const testFileContent = 'Test file content';
    
    // Write test file
    fs.writeFileSync(testFilePath, testFileContent);

    // Send retrieval request
    const response = await request
      .get(`/files/${testFileName}`)
      .set('X-API-Key', 'test-api-key'); // Adjust based on your auth mechanism

    // Assertions
    expect(response.status).toBe(200);
    expect(response.text).toBe(testFileContent);
  });

  it('should return 404 for non-existent file', async () => {
    const response = await request
      .get('/files/non-existent-file.txt')
      .set('X-API-Key', 'test-api-key');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 for invalid filename', async () => {
    const response = await request
      .get('/files/../secret-file.txt') // Path traversal attempt
      .set('X-API-Key', 'test-api-key');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 401 without valid API key', async () => {
    const response = await request
      .get('/files/some-file.txt')
      .set('X-API-Key', 'invalid-key');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  // Clean up after tests
  afterEach(() => {
    // Remove test files
    const files = fs.readdirSync(testUploadDir);
    files.forEach(file => {
      fs.unlinkSync(path.join(testUploadDir, file));
    });
  });
});