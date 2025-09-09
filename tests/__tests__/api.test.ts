/**
 * Example API Tests for SmartPlates
 * 
 * This file demonstrates how to test API endpoints using the testing utilities.
 * These tests serve as examples for other developers to follow.
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/users/route';
import { 
  setupTestDatabase, 
  teardownTestDatabase, 
  clearTestData,
  insertTestFixtures,
  testFixtures,
  testAssertions,
  parseTestResponse
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
    toBeDefined(): void;
    toBeUndefined(): void;
    toEqual(expected: unknown): void;
    toContain(expected: unknown): void;
    toBeInstanceOf(expected: unknown): void;
    toBeGreaterThan(expected: number): void;
    toBeGreaterThanOrEqual(expected: number): void;
    toHaveLength(expected: number): void;
  };
}

// Test group for User API endpoints
describe('API: /api/users', () => {
  // Setup and cleanup for each test
  beforeAll(async () => {
    await setupTestDatabase();
  });
  
  afterAll(async () => {
    await teardownTestDatabase();
  });
  
  beforeEach(async () => {
    await clearTestData();
  });
  
  describe('GET /api/users', () => {
    it('should return empty list when no users exist', async () => {
      // Create test request
      const request = new NextRequest('http://localhost:3000/api/users');
      
      // Call the API handler
      const response = await GET(request);
      const data = await parseTestResponse(response);
      
      // Assertions
      expect(response.status).toBe(200);
      testAssertions.expectSuccessResponse(data);
      testAssertions.expectPaginatedResponse(data);
      expect(data.data).toHaveLength(0);
      expect(data.pagination.total).toBe(0);
    });
    
    it('should return paginated list of users', async () => {
      // Insert test data
      await insertTestFixtures(testFixtures);
      
      // Create test request with pagination
      const request = new NextRequest('http://localhost:3000/api/users?page=1&limit=10');
      
      // Call the API handler
      const response = await GET(request);
      const data = await parseTestResponse(response);
      
      // Assertions
      expect(response.status).toBe(200);
      testAssertions.expectSuccessResponse(data);
      testAssertions.expectPaginatedResponse(data);
      expect(data.data).toHaveLength(2); // We inserted 2 test users
      expect(data.pagination.total).toBe(2);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(10);
    });
    
    it('should handle invalid pagination parameters', async () => {
      // Create test request with invalid pagination
      const request = new NextRequest('http://localhost:3000/api/users?page=-1&limit=0');
      
      // Call the API handler
      const response = await GET(request);
      const data = await parseTestResponse(response);
      
      // Should handle invalid params gracefully (depends on implementation)
      expect(response.status).toBe(400);
      testAssertions.expectErrorResponse(data);
    });
  });
  
  describe('POST /api/users', () => {
    it('should create a new user with valid data', async () => {
      const newUser = {
        email: 'newuser@example.com',
        name: 'New Test User',
        role: 'user'
      };
      
      // Create test request
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      
      // Call the API handler (Note: this assumes POST exists and is exported)
      const response = await POST(request);
      const data = await parseTestResponse(response);
      
      // Assertions
      expect(response.status).toBe(201);
      testAssertions.expectSuccessResponse(data);
      expect(data.data.email).toBe(newUser.email);
      expect(data.data.name).toBe(newUser.name);
      expect(data.data._id).toBeDefined();
    });
    
    it('should reject user with invalid email', async () => {
      const invalidUser = {
        email: 'invalid-email',
        name: 'Test User',
        role: 'user'
      };
      
      // Create test request
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidUser)
      });
      
      // Call the API handler
      const response = await POST(request);
      const data = await parseTestResponse(response);
      
      // Assertions
      expect(response.status).toBe(400);
      testAssertions.expectErrorResponse(data);
      testAssertions.expectValidationErrors(data);
    });
    
    it('should reject user with missing required fields', async () => {
      const incompleteUser = {
        email: 'test@example.com'
        // Missing name and other required fields
      };
      
      // Create test request
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompleteUser)
      });
      
      // Call the API handler
      const response = await POST(request);
      const data = await parseTestResponse(response);
      
      // Assertions
      expect(response.status).toBe(400);
      testAssertions.expectErrorResponse(data);
      testAssertions.expectValidationErrors(data);
    });
    
    it('should reject duplicate email addresses', async () => {
      // Insert existing user
      await insertTestFixtures(testFixtures);
      
      const duplicateUser = {
        email: testFixtures.users[0].email, // Use existing email
        name: 'Duplicate User',
        role: 'user'
      };
      
      // Create test request
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicateUser)
      });
      
      // Call the API handler
      const response = await POST(request);
      const data = await parseTestResponse(response);
      
      // Assertions
      expect(response.status).toBe(409); // Conflict
      testAssertions.expectErrorResponse(data, 'bereits vorhanden');
    });
  });
});

// Test group for Recipe API endpoints
describe('API: /api/recipes', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });
  
  afterAll(async () => {
    await teardownTestDatabase();
  });
  
  beforeEach(async () => {
    await clearTestData();
  });
  
  describe('GET /api/recipes', () => {
    it('should return list of public recipes', async () => {
      // Insert test data
      await insertTestFixtures(testFixtures);
      
      // Create test request
      const request = new NextRequest('http://localhost:3000/api/recipes');
      
      // Import and call the recipe API handler
      const { GET: RecipeGET } = await import('@/app/api/recipes/route');
      const response = await RecipeGET(request);
      const data = await parseTestResponse(response);
      
      // Assertions
      expect(response.status).toBe(200);
      testAssertions.expectSuccessResponse(data);
      expect(data.data).toBeInstanceOf(Array);
      expect(data.data.length).toBeGreaterThan(0);
    });
    
    it('should filter recipes by category', async () => {
      // Insert test data
      const { categoryIds } = await insertTestFixtures(testFixtures);
      
      // Create test request with category filter
      const request = new NextRequest(`http://localhost:3000/api/recipes?categoryId=${categoryIds[0]}`);
      
      // Call the API handler
      const { GET: RecipeGET } = await import('@/app/api/recipes/route');
      const response = await RecipeGET(request);
      const data = await parseTestResponse(response);
      
      // Assertions
      expect(response.status).toBe(200);
      testAssertions.expectSuccessResponse(data);
      expect(data.data).toBeInstanceOf(Array);
      // All returned recipes should belong to the specified category
      data.data.forEach((recipe: any) => {
        expect(recipe.categoryId).toBe(categoryIds[0]);
      });
    });
    
    it('should search recipes by title', async () => {
      // Insert test data
      await insertTestFixtures(testFixtures);
      
      // Create test request with search query
      const request = new NextRequest('http://localhost:3000/api/recipes?search=pasta');
      
      // Call the API handler
      const { GET: RecipeGET } = await import('@/app/api/recipes/route');
      const response = await RecipeGET(request);
      const data = await parseTestResponse(response);
      
      // Assertions
      expect(response.status).toBe(200);
      testAssertions.expectSuccessResponse(data);
      expect(data.data).toBeInstanceOf(Array);
      // Results should contain the search term
      if (data.data.length > 0) {
        data.data.forEach((recipe: any) => {
          expect(recipe.title.toLowerCase()).toContain('pasta');
        });
      }
    });
  });
});

// Test group for Category API endpoints
describe('API: /api/categories', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });
  
  afterAll(async () => {
    await teardownTestDatabase();
  });
  
  beforeEach(async () => {
    await clearTestData();
  });
  
  describe('GET /api/categories', () => {
    it('should return list of categories', async () => {
      // Insert test data
      await insertTestFixtures(testFixtures);
      
      // Create test request
      const request = new NextRequest('http://localhost:3000/api/categories');
      
      // Import and call the category API handler
      const { GET: CategoryGET } = await import('@/app/api/categories/route');
      const response = await CategoryGET(request);
      const data = await parseTestResponse(response);
      
      // Assertions
      expect(response.status).toBe(200);
      testAssertions.expectSuccessResponse(data);
      testAssertions.expectPaginatedResponse(data);
      expect(data.data).toHaveLength(2); // We inserted 2 test categories
    });
    
    it('should include recipe count for each category', async () => {
      // Insert test data
      await insertTestFixtures(testFixtures);
      
      // Create test request
      const request = new NextRequest('http://localhost:3000/api/categories');
      
      // Call the API handler
      const { GET: CategoryGET } = await import('@/app/api/categories/route');
      const response = await CategoryGET(request);
      const data = await parseTestResponse(response);
      
      // Assertions
      expect(response.status).toBe(200);
      testAssertions.expectSuccessResponse(data);
      data.data.forEach((category: any) => {
        expect(category.recipeCount).toBeDefined();
        expect(typeof category.recipeCount).toBe('number');
      });
    });
  });
});

// Test group for Database Status endpoint
describe('API: /api/status', () => {
  it('should return database status', async () => {
    // Create test request
    const request = new NextRequest('http://localhost:3000/api/status');
    
    // Import and call the status API handler
    const { GET: StatusGET } = await import('@/app/api/status/route');
    const response = await StatusGET(request);
    const data = await parseTestResponse(response);
    
    // Assertions
    expect(response.status).toBe(200);
    expect(data.status).toBe('operational');
    expect(data.database.connected).toBe(true);
    expect(data.timestamp).toBeDefined();
    expect(data.environment).toBeDefined();
  });
});
