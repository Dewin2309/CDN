/**
 * Custom error classes for file retrieval scenarios
 */
export class FileRetrievalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileRetrievalError';
  }
}

export class FileNotFoundError extends FileRetrievalError {
  constructor(filePath: string) {
    super(`File not found: ${filePath}`);
    this.name = 'FileNotFoundError';
  }
}

export class FileAccessError extends FileRetrievalError {
  constructor(filePath: string, reason: string) {
    super(`Cannot access file ${filePath}: ${reason}`);
    this.name = 'FileAccessError';
  }
}

export class FileSizeError extends FileRetrievalError {
  constructor(maxSize: number) {
    super(`File exceeds maximum allowed size of ${maxSize} bytes`);
    this.name = 'FileSizeError';
  }
}