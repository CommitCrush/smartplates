/**
 * Jest Setup Configuration for SmartPlates API Testing - Phase 1 Mock
 * 
 * Simplified testing setup for Phase 1 completion.
 * This provides basic testing utilities without complex dependencies.
 */

import { setupTestDatabase, teardownTestDatabase } from './testUtils2';

// Mock Jest globals for Phase 1
declare global {
  var beforeAll: (fn: () => Promise<void>) => void;
  var afterAll: (fn: () => Promise<void>) => void;
}

// Mock setup for Phase 1 - simplified without global dependencies
export async function setupTestSuite(): Promise<void> {
  console.log('🧪 Setting up test environment...');
  await setupTestDatabase();
}

export async function teardownTestSuite(): Promise<void> {
  console.log('🧹 Cleaning up test environment...');
  await teardownTestDatabase();
}

// Type-safe environment variable setup
interface TestEnvironment {
  NODE_ENV: string;
  MONGODB_URL: string;
  DATABASE_NAME: string;
}

// Mock environment setup for Phase 1
const testEnv: TestEnvironment = {
  NODE_ENV: 'test',
  MONGODB_URL: 'mongodb://localhost:27017/smartplates_test',
  DATABASE_NAME: 'smartplates_test'
};

// Export test configuration
export const testConfig = {
  testTimeout: 30000,
  setupFilesAfterEnv: ['./setup.ts'],
  testEnvironment: 'node',
  verbose: true
};

// Export test environment for use in tests
export { testEnv };

// Mock setup functions for Phase 1
export async function initializeTestEnvironment(): Promise<void> {
  console.log('🧪 Mock: Initializing test environment...');
  await setupTestDatabase();
}

export async function cleanupTestEnvironment(): Promise<void> {
  console.log('🧹 Mock: Cleaning up test environment...');
  await teardownTestDatabase();
}

// Mock console functions (optional)
export const mockConsole = {
  log: (...args: any[]) => {}, // Silent log for tests
  debug: (...args: any[]) => {},
  info: (...args: any[]) => {},
  warn: (...args: any[]) => {},
  error: console.error // Keep errors visible
};

// Helper function to setup mock console
export function setupMockConsole(): void {
  // Only mock in test environment
  if (testEnv.NODE_ENV === 'test') {
    console.log('🔇 Mock: Console mocking enabled for tests');
  }
}
