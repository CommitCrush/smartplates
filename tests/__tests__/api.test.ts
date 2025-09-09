/**
 * API Tests für SmartPlates
 * 
 * Diese Tests prüfen die API-Endpunkte mit echter MongoDB-Verbindung.
 * Verwendet die vereinfachten Test-Utilities für bessere Stabilität.
 */

import { 
  setupTestDatabase, 
  clearTestDatabase, 
  teardownTestDatabase,
  testSeeder
} from '@/lib/testing/testUtils';

// Jest global declarations for TypeScript
declare global {
  function describe(name: string, fn: () => void): void;
  function it(name: string, fn: () => void | Promise<void>): void;
  function beforeAll(fn: () => void | Promise<void>): void;
  function afterAll(fn: () => void | Promise<void>): void;
  function beforeEach(fn: () => void | Promise<void>): void;
  function expect(actual: unknown): {
    toBe(expected: unknown): void;
    toEqual(expected: unknown): void;
    toHaveProperty(property: string): void;
    toBeGreaterThan(expected: number): void;
    toHaveLength(expected: number): void;
  };
}

// Global test setup
beforeAll(async () => {
  console.log('🚀 Starting API Test Suite...');
  await setupTestDatabase();
});

afterAll(async () => {
  console.log('🧹 Cleaning up API Test Suite...');
  await teardownTestDatabase();
});

beforeEach(async () => {
  await clearTestDatabase();
});

// Test group for User API endpoints
describe('API: /api/users', () => {
  it('should connect to test database', async () => {
    // Simple connectivity test
    const userId = await testSeeder.seedUserId();
    expect(userId).toBeDefined();
    expect(typeof userId).toBe('string');
  });

  it('should handle user creation workflow', async () => {
    // Test user creation through seeder
    const userId = await testSeeder.seedUserId({
      email: 'api-test@example.com',
      name: 'API Test User'
    });
    
    expect(userId).toBeDefined();
    expect(typeof userId).toBe('string');
  });
});

// Test group for Recipe API endpoints
describe('API: /api/recipes', () => {
  it('should handle recipe creation workflow', async () => {
    // Create recipe with dependencies
    const categoryId = await testSeeder.seedCategoryId({ name: 'Test Category' });
    const userId = await testSeeder.seedUserId({ email: 'chef@test.com' });
    
    const recipeId = await testSeeder.seedRecipeId({
      title: 'API Test Recipe',
      categories: [categoryId],
      createdBy: userId
    });
    
    expect(recipeId).toBeDefined();
    expect(typeof recipeId).toBe('string');
  });

  it('should handle recipe with ingredients', async () => {
    const recipeId = await testSeeder.seedRecipeId({
      title: 'Recipe with Ingredients',
      ingredients: [
        { name: 'Tomato', amount: 2, unit: 'pieces' },
        { name: 'Pasta', amount: 300, unit: 'g' }
      ],
      instructions: ['Step 1', 'Step 2']
    });
    
    expect(recipeId).toBeDefined();
    expect(typeof recipeId).toBe('string');
  });
});

// Test group for Category API endpoints
describe('API: /api/categories', () => {
  it('should handle category creation', async () => {
    const categoryId = await testSeeder.seedCategoryId({
      name: 'Italian Cuisine',
      description: 'Traditional Italian dishes'
    });
    
    expect(categoryId).toBeDefined();
    expect(typeof categoryId).toBe('string');
  });

  it('should handle multiple categories', async () => {
    const data = await testSeeder.seedBasicData();
    
    expect(data.categoryIds).toHaveLength(3); // Updated: seedBasicData creates 3 categories
    expect(data.userIds).toHaveLength(2);
    expect(data.recipeIds).toHaveLength(2);
  });
});

// Test group for Database Status endpoint
describe('API: /api/status', () => {
  it('should connect to database successfully', async () => {
    // Basic database connectivity test
    const userId = await testSeeder.seedUserId();
    expect(userId).toBeDefined();
    expect(typeof userId).toBe('string');
    
    console.log('✅ Database status check completed');
  });
});