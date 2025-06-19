import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { app } from '../src/app'; // Assuming this is your Express app

describe('File Retrieval Endpoint Integration Tests', () => {
  const testFilesDir = path.join(process.cwd(), 'tests', 'test-files');
  const apiKey = 'test-api-key'; // Use a test API key

  beforeAll(() => {
    // Ensure test files directory exists
    if (!fs.existsSync(testFilesDir)) {
      fs.mkdirSync(testFilesDir, { recursive: true });
    }

    // Create a sample test file
    const testFileContent = 'Test file content for retrieval';
    fs.writeFileSync(path.join(testFilesDir, 'test-file.txt'), testFileContent);
  });

  afterAll(() => {
    // Clean up test files
    const testFiles = fs.readdirSync(testFilesDir);
    testFiles.forEach(file => {
      fs.unlinkSync(path.join(testFilesDir, file));
    });
    fs.rmdirSync(testFilesDir);
  });

  it('should successfully retrieve an existing file', async () => {
    const fileName = 'test-file.txt';
    const response = await request(app)
      .get(`/files/${fileName}`)
      .set('X-API-Key', apiKey);

    expect(response.status).toBe(200);
    expect(response.text).toBe('Test file content for retrieval');
    expect(response.headers['content-type']).toBe('text/plain; charset=utf-8');
  });

  it('should return 404 for non-existent file', async () => {
    const response = await request(app)
      .get('/files/non-existent-file.txt')
      .set('X-API-Key', apiKey);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('File not found');
  });

  it('should return 401 without valid API key', async () => {
    const response = await request(app)
      .get('/files/test-file.txt')
      .set('X-API-Key', 'invalid-key');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Unauthorized');
  });
});