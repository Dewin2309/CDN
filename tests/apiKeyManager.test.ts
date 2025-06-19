import { describe, it, expect, beforeEach } from 'vitest';
import ApiKeyManager from '../src/auth/apiKeyManager';

describe('ApiKeyManager', () => {
  beforeEach(() => {
    // Reset the singleton instance before each test
    Object.defineProperty(ApiKeyManager, 'apiKeys', {
      value: new Map(),
      writable: true
    });
  });

  it('should generate an API key with permissions', () => {
    const permissions = ['read', 'write'];
    const apiKey = ApiKeyManager.generateApiKey(permissions);
    
    expect(apiKey).toBeTruthy();
    expect(apiKey.length).toBeGreaterThan(0);
  });

  it('should throw error when generating key without permissions', () => {
    expect(() => ApiKeyManager.generateApiKey([])).toThrow('At least one permission is required');
  });

  it('should validate a generated API key with correct permissions', () => {
    const permissions = ['read', 'write'];
    const apiKey = ApiKeyManager.generateApiKey(permissions);
    
    const isValid = ApiKeyManager.validateApiKey(apiKey, ['read']);
    expect(isValid).toBeTruthy();
  });

  it('should invalidate API key with insufficient permissions', () => {
    const permissions = ['read'];
    const apiKey = ApiKeyManager.generateApiKey(permissions);
    
    const isValid = ApiKeyManager.validateApiKey(apiKey, ['write']);
    expect(isValid).toBeFalsy();
  });

  it('should invalidate non-existent API key', () => {
    const isValid = ApiKeyManager.validateApiKey('non-existent-key');
    expect(isValid).toBeFalsy();
  });

  it('should revoke an API key', () => {
    const permissions = ['read'];
    const apiKey = ApiKeyManager.generateApiKey(permissions);
    
    ApiKeyManager.revokeApiKey(apiKey);
    
    const isValid = ApiKeyManager.validateApiKey(apiKey);
    expect(isValid).toBeFalsy();
  });

  it('should throw error when revoking non-existent API key', () => {
    expect(() => ApiKeyManager.revokeApiKey('non-existent-key')).toThrow('API key not found');
  });

  it('should return all generated API keys', () => {
    const permissions1 = ['read'];
    const permissions2 = ['write'];
    
    const apiKey1 = ApiKeyManager.generateApiKey(permissions1);
    const apiKey2 = ApiKeyManager.generateApiKey(permissions2);
    
    const allKeys = ApiKeyManager.getAllApiKeys();
    
    expect(allKeys.length).toBe(2);
    expect(allKeys[0].key).toBe(apiKey1);
    expect(allKeys[1].key).toBe(apiKey2);
  });
});