import { describe, test, expect } from 'bun:test';

// Test basic TypeScript and path resolution
describe('Environment Setup Tests', () => {
  test('should resolve TypeScript types correctly', () => {
    const testValue: string = 'test';
    expect(testValue).toBe('test');
  });

  test('should have access to environment variables', () => {
    // Basic env test
    expect(process.env.NODE_ENV).toBeDefined();
  });
});