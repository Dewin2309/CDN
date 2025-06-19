import { Request, Response } from 'express';
import { FileStorageService } from './file-storage.service';
import mime from 'mime-types';
import fs from 'fs';

export class FileRetrievalRoute {
  private fileStorageService: FileStorageService;

  constructor(fileStorageService?: FileStorageService) {
    this.fileStorageService = fileStorageService || new FileStorageService();
  }

  /**
   * Retrieve a file by its identifier
   * @param req Express request object
   * @param res Express response object
   */
  getFile = (req: Request, res: Response) => {
    try {
      const fileId = req.params.fileId;

      // Validate file identifier
      if (!fileId || fileId.trim() === '') {
        return res.status(400).json({ error: 'Invalid file identifier' });
      }

      // Check if file exists
      if (!this.fileStorageService.fileExists(fileId)) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Get full file path
      const filePath = this.fileStorageService.getFilePath(fileId);

      // Determine content type
      const contentType = mime.lookup(filePath) || 'application/octet-stream';

      // Stream file to response
      res.setHeader('Content-Type', contentType);
      const fileStream = fs.createReadStream(filePath);

      fileStream.on('error', (error) => {
        console.error('File read error:', error);
        res.status(500).json({ error: 'Internal server error while reading file' });
      });

      fileStream.pipe(res);
    } catch (error) {
      console.error('File retrieval error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}