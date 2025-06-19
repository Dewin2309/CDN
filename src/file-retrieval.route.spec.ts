import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FileRetrievalRoute } from './file-retrieval.route';
import { FileStorageService } from './file-storage.service';
import fs from 'fs';
import path from 'path';

describe('FileRetrievalRoute', () => {
  let fileRetrievalRoute: FileRetrievalRoute;
  let mockFileStorageService: FileStorageService;

  const mockRequest: any = {
    params: { fileId: 'test-file.txt' }
  };

  const mockResponse: any = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
    setHeader: vi.fn(),
    send: vi.fn()
  };

  beforeEach(() => {
    mockFileStorageService = new FileStorageService('./test-uploads');
    fileRetrievalRoute = new FileRetrievalRoute(mockFileStorageService);

    // Ensure test directory exists
    if (!fs.existsSync('./test-uploads')) {
      fs.mkdirSync('./test-uploads');
    }

    // Create a test file
    fs.writeFileSync(path.join('./test-uploads', 'test-file.txt'), 'Test content');

    // Reset mock functions
    mockResponse.status.mockClear();
    mockResponse.json.mockClear();
    mockResponse.setHeader.mockClear();
    mockResponse.send.mockClear();
  });

  it('should successfully retrieve an existing file', () => {
    fileRetrievalRoute.getFile(mockRequest, mockResponse);

    expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain');
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith('Test content');
  });

  it('should return 400 for invalid file identifier', () => {
    mockRequest.params.fileId = '';
    fileRetrievalRoute.getFile(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid file identifier' });
  });

  it('should return 404 for non-existent file', () => {
    mockRequest.params.fileId = 'non-existent-file.txt';
    fileRetrievalRoute.getFile(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'File not found' });
  });
});