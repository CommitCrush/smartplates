/**
 * Jest Setup Configuration for SmartPlates API Testing
 * 
 * This file configures Jest for testing API endpoints.
 * It sets up the testing environment and provides global utilities.
 */

import { setupTestDatabase, teardownTestDatabase } from './testUtils';

// Type declarations for global Jest functions
declare global {
  function beforeAll(fn: () => Promise<void> | void): void;
  function afterAll(fn: () => Promise<void> | void): void;
}

// Global setup before all tests
beforeAll(async () => {
  console.log('🧪 Setting up test environment...');
  await setupTestDatabase();
});

// Global cleanup after all tests
afterAll(async () => {
  console.log('🧹 Cleaning up test environment...');
  await teardownTestDatabase();
});

// Type-safe environment variable setup
interface TestEnvironment {
  NODE_ENV: string;
  MONGODB_URL: string;
  DATABASE_NAME: string;
}

// Mock environment variables for testing
Object.assign(process.env, {
  NODE_ENV: 'test',
  MONGODB_URL: 'mongodb://localhost:27017/smartplates_test',
  DATABASE_NAME: 'smartplates_test'
} as TestEnvironment);

// Export test configuration
export const testConfig = {
  testTimeout: 30000,
  setupFilesAfterEnv: [__filename],
  testEnvironment: 'node',
  verbose: true
};

// Mock console.log to reduce noise in tests (optional)
if (process.env.JEST_SILENT === 'true') {
  const mockConsole = {
    ...console,
    log: () => {},
    debug: () => {},
    info: () => {},
    warn: () => {},
  };
  
  Object.assign(global, { console: mockConsole });
}
