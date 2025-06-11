import { describe, it, expect, vi } from 'vitest';
import { validateFileAccess } from '../src/middleware/file-access-middleware';
import { FileAccessErrorTypes } from '../src/errors/file-access-error';
import fs from 'fs/promises';
import path from 'path';

describe('File Access Middleware', () => {
  const mockCdnDirectory = '/mock/cdn/directory';

  // Mock request and response objects
  const createMockRequest = (filePath: string) => ({
    params: { filePath },
    query: { file: filePath }
  });

  const createMockResponse = () => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn()
  });

  const createMockNext = vi.fn();

  it('should prevent directory traversal attempts', async () => {
    const middleware = validateFileAccess(mockCdnDirectory);
    const req: any = createMockRequest('../etc/passwd');
    const res: any = createMockResponse();
    const next = createMockNext;

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: FileAccessErrorTypes.DIRECTORY_TRAVERSAL_ATTEMPT
    }));
  });

  it('should handle non-existent files', async () => {
    // Mock fs.stat to throw ENOENT error
    vi.spyOn(fs, 'stat').mockRejectedValue(Object.assign(
      new Error('File not found'), 
      { code: 'ENOENT' }
    ));

    const middleware = validateFileAccess(mockCdnDirectory);
    const req: any = createMockRequest('non-existent-file.txt');
    const res: any = createMockResponse();
    const next = createMockNext;

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: FileAccessErrorTypes.FILE_NOT_FOUND
    }));
  });

  it('should handle permission denied errors', async () => {
    // Mock fs.stat to throw EACCES error
    vi.spyOn(fs, 'stat').mockRejectedValue(Object.assign(
      new Error('Permission denied'), 
      { code: 'EACCES' }
    ));

    const middleware = validateFileAccess(mockCdnDirectory);
    const req: any = createMockRequest('restricted-file.txt');
    const res: any = createMockResponse();
    const next = createMockNext;

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: FileAccessErrorTypes.PERMISSION_DENIED
    }));
  });
});