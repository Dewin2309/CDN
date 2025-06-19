import crypto from 'crypto';

export interface ApiKey {
  key: string;
  createdAt: Date;
  lastUsed?: Date;
  permissions: string[];
}

export class ApiKeyManager {
  private apiKeys: Map<string, ApiKey> = new Map();

  /**
   * Generate a new API key
   * @param permissions Array of permissions for the API key
   * @returns Generated API key
   */
  generateApiKey(permissions: string[] = []): string {
    if (permissions.length === 0) {
      throw new Error('At least one permission is required');
    }

    const apiKey = crypto.randomBytes(32).toString('hex');
    
    this.apiKeys.set(apiKey, {
      key: apiKey,
      createdAt: new Date(),
      permissions
    });

    return apiKey;
  }

  /**
   * Validate an API key
   * @param apiKey API key to validate
   * @param requiredPermissions Permissions required to access a resource
   * @returns Boolean indicating if the API key is valid
   */
  validateApiKey(apiKey: string, requiredPermissions: string[] = []): boolean {
    if (!apiKey) {
      return false;
    }

    const storedKey = this.apiKeys.get(apiKey);
    
    if (!storedKey) {
      return false;
    }

    // Check if all required permissions are present
    const hasRequiredPermissions = requiredPermissions.every(permission => 
      storedKey.permissions.includes(permission)
    );

    if (!hasRequiredPermissions) {
      return false;
    }

    // Update last used timestamp
    storedKey.lastUsed = new Date();
    return true;
  }

  /**
   * Revoke an API key
   * @param apiKey API key to revoke
   */
  revokeApiKey(apiKey: string): void {
    if (!this.apiKeys.has(apiKey)) {
      throw new Error('API key not found');
    }
    this.apiKeys.delete(apiKey);
  }

  /**
   * Get all API keys
   * @returns Array of API keys
   */
  getAllApiKeys(): ApiKey[] {
    return Array.from(this.apiKeys.values());
  }
}

export default new ApiKeyManager();