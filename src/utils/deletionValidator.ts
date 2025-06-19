import { z } from 'zod';

// Zod schema for file identifier validation
const fileIdentifierSchema = z.string()
  .min(10, { message: "File identifier must be at least 10 characters long" })
  .max(255, { message: "File identifier is too long" })
  .regex(/^[a-zA-Z0-9_-]+$/, { message: "File identifier contains invalid characters" });

// Authorization interface for deletion request
interface DeletionAuthorization {
  apiKey: string;
  userRole: 'admin' | 'user';
}

// Deletion validation result
interface DeletionValidationResult {
  isValid: boolean;
  errors?: string[];
}

/**
 * Validates a file deletion request
 * @param fileIdentifier - Unique identifier of the file to delete
 * @param authorization - Authorization details for the deletion request
 * @returns Validation result
 */
export function validateFileDeletion(
  fileIdentifier: string, 
  authorization: DeletionAuthorization
): DeletionValidationResult {
  const errors: string[] = [];

  // Validate file identifier
  try {
    fileIdentifierSchema.parse(fileIdentifier);
  } catch (validationError) {
    if (validationError instanceof z.ZodError) {
      errors.push(...validationError.errors.map(err => err.message));
    }
  }

  // Check authorization
  if (!authorization.apiKey) {
    errors.push("API key is required");
  }

  // Role-based authorization check
  if (authorization.userRole !== 'admin') {
    errors.push("Only administrators can delete files");
  }

  // Return validation result
  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}