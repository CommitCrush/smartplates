/**
 * Test Configuration and Utilities for SmartPlates API Testing
 * 
 * This file sets up Jest testing environment and provides utilities
 * for testing API endpoints consistently across the application.
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';
import { createIndexes } from '@/lib/db';

// Type declarations for Jest globals
declare global {
  function expect(actual: unknown): {
    toBe(expected: unknown): void;
    toBeDefined(): void;
    toBeUndefined(): void;
    toEqual(expected: unknown): void;
    toContain(expected: unknown): void;
    toBeInstanceOf(expected: unknown): void;
    toBeGreaterThan(expected: number): void;
    toBeGreaterThanOrEqual(expected: number): void;
  } & {
    objectContaining(expected: Record<string, unknown>): unknown;
  };
}

// API Response Types (for documentation purposes)

// Global test database instance
let mongoServer: MongoMemoryServer;
let mongoClient: MongoClient;
let testDatabase: Db;

/**
 * Sets up the test database before running tests
 * Creates an in-memory MongoDB instance for isolated testing
 */
export async function setupTestDatabase(): Promise<Db> {
  try {
    // Start MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create({
      binary: {
        version: '6.0.0', // Use stable MongoDB version
      }
    });
    
    const uri = mongoServer.getUri();
    const dbName = 'smartplates_test';
    
    // Connect to the test database
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    
    testDatabase = mongoClient.db(dbName);
    
    // Create indexes for better performance in tests
    await createIndexes();
    
    console.log('✅ Test database setup complete');
    return testDatabase;
    
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    throw error;
  }
}

/**
 * Tears down the test database after tests complete
 * Cleans up all resources to prevent memory leaks
 */
export async function teardownTestDatabase(): Promise<void> {
  try {
    if (mongoClient) {
      await mongoClient.close();
    }
    
    if (mongoServer) {
      await mongoServer.stop();
    }
    
    console.log('✅ Test database cleanup complete');
  } catch (error) {
    console.error('❌ Failed to cleanup test database:', error);
  }
}

/**
 * Clears all data from test collections between tests
 * Ensures test isolation by removing all documents
 */
export async function clearTestData(): Promise<void> {
  if (!testDatabase) {
    throw new Error('Test database not initialized. Call setupTestDatabase first.');
  }
  
  try {
    const collections = await testDatabase.listCollections().toArray();
    
    for (const collection of collections) {
      await testDatabase.collection(collection.name).deleteMany({});
    }
    
    console.log('✅ Test data cleared');
  } catch (error) {
    console.error('❌ Failed to clear test data:', error);
    throw error;
  }
}

/**
 * Gets the test database instance
 * Use this in your tests to access the database directly
 */
export function getTestDatabase(): Db {
  if (!testDatabase) {
    throw new Error('Test database not initialized. Call setupTestDatabase first.');
  }
  
  return testDatabase;
}

/**
 * Creates test data fixtures for consistent testing
 * Provides sample data for users, recipes, and categories
 */
export const testFixtures = {
  // Sample users for testing
  users: [
    {
      email: 'testuser@example.com',
      name: 'Test User',
      role: 'user' as const,
      isEmailVerified: true,
      savedRecipes: [],
      createdRecipes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin' as const,
      isEmailVerified: true,
      savedRecipes: [],
      createdRecipes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  
  // Sample categories for testing
  categories: [
    {
      name: 'Hauptgerichte',
      description: 'Herzhafte Hauptmahlzeiten',
      slug: 'hauptgerichte',
      isActive: true,
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Desserts',
      description: 'Süße Nachspeisen',
      slug: 'desserts',
      isActive: true,
      sortOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  
  // Sample recipes for testing
  recipes: [
    {
      title: 'Test Pasta Recipe',
      description: 'A simple pasta recipe for testing',
      ingredients: [
        { name: 'Pasta', quantity: 200, unit: 'g' },
        { name: 'Tomato Sauce', quantity: 1, unit: 'cup' }
      ],
      instructions: [
        { stepNumber: 1, instruction: 'Boil water and cook pasta' },
        { stepNumber: 2, instruction: 'Add tomato sauce and serve' }
      ],
      cookingTime: 20,
      prepTime: 10,
      totalTime: 30,
      servings: 2,
      difficulty: 'easy' as const,
      mealType: ['lunch', 'dinner'],
      isPublic: true,
      tags: ['quick', 'easy'],
      nutrition: {
        calories: 350,
        protein: 12,
        carbs: 70,
        fat: 2
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
};

/**
 * Helper function to insert test fixtures into the database
 * @param fixtures - Object containing arrays of test data
 */
export async function insertTestFixtures(fixtures: typeof testFixtures): Promise<{
  userIds: string[];
  categoryIds: string[];
  recipeIds: string[];
}> {
  const db = getTestDatabase();
  
  try {
    // Insert users and get their IDs
    const userResult = await db.collection('users').insertMany(fixtures.users);
    const userIds = Object.values(userResult.insertedIds).map(id => id.toString());
    
    // Insert categories and get their IDs
    const categoryResult = await db.collection('categories').insertMany(fixtures.categories);
    const categoryIds = Object.values(categoryResult.insertedIds).map(id => id.toString());
    
    // Add categoryId and authorId to recipes before inserting
    const recipesWithRefs = fixtures.recipes.map(recipe => ({
      ...recipe,
      categoryId: categoryIds[0], // Use first category
      authorId: userIds[0] // Use first user as author
    }));
    
    const recipeResult = await db.collection('recipes').insertMany(recipesWithRefs);
    const recipeIds = Object.values(recipeResult.insertedIds).map(id => id.toString());
    
    console.log('✅ Test fixtures inserted successfully');
    
    return {
      userIds,
      categoryIds,
      recipeIds
    };
    
  } catch (error) {
    console.error('❌ Failed to insert test fixtures:', error);
    throw error;
  }
}

/**
 * Helper function to create a test request object
 * @param method - HTTP method
 * @param url - Request URL
 * @param body - Request body (optional)
 * @param headers - Request headers (optional)
 */
export function createTestRequest(
  method: string,
  url: string,
  body?: Record<string, unknown> | string,
  headers?: Record<string, string>
): Request {
  const init: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };
  
  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  
  return new Request(url, init);
}

/**
 * Helper function to parse response and return JSON
 * @param response - Response object
 */
export async function parseTestResponse(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    console.error('Failed to parse response as JSON:', text);
    throw new Error(`Invalid JSON response: ${text}`);
  }
}

/**
 * Common test assertions for API responses
 */
export const testAssertions = {
  /**
   * Asserts that response is a successful API response
   */
  expectSuccessResponse: (response: Record<string, unknown>, expectedData?: Record<string, unknown>) => {
    expect(response.success).toBe(true);
    expect(response.timestamp).toBeDefined();
    expect(response.error).toBeUndefined();
    
    if (expectedData) {
      expect(response.data).toEqual(expectedData);
    }
  },
  
  /**
   * Asserts that response is an error API response
   */
  expectErrorResponse: (response: Record<string, unknown>, expectedError?: string) => {
    expect(response.success).toBe(false);
    expect(response.timestamp).toBeDefined();
    expect(response.error).toBeDefined();
    
    if (expectedError && typeof response.error === 'string') {
      expect(response.error).toContain(expectedError);
    }
  },
  
  /**
   * Asserts that response has pagination information
   */
  expectPaginatedResponse: (response: Record<string, unknown>) => {
    expect(response.success).toBe(true);
    expect(response.data).toBeInstanceOf(Array);
    expect(response.pagination).toBeDefined();
    
    const pagination = response.pagination as Record<string, unknown>;
    expect(pagination.page).toBeGreaterThan(0);
    expect(pagination.limit).toBeGreaterThan(0);
    expect(pagination.total).toBeGreaterThanOrEqual(0);
    expect(pagination.totalPages).toBeGreaterThanOrEqual(0);
  },
  
  /**
   * Asserts that response contains validation errors
   */
  expectValidationErrors: (response: Record<string, unknown>) => {
    expect(response.success).toBe(false);
    expect(response.errors).toBeDefined();
    expect(response.errors).toBeInstanceOf(Array);
    
    const errors = response.errors as Array<Record<string, unknown>>;
    expect(errors.length).toBeGreaterThan(0);
    
    // Check that each error has field and message
    errors.forEach((error) => {
      expect(error.field).toBeDefined();
      expect(error.message).toBeDefined();
    });
  }
};

/**
 * Helper to mock authentication for protected routes
 */
export function createMockAuthUser(overrides?: Partial<{
  _id: string;
  email: string;
  name: string;
  role: string;
  isEmailVerified: boolean;
  savedRecipes: string[];
  createdRecipes: string[];
  createdAt: Date;
  updatedAt: Date;
}>) {
  return {
    _id: 'mock-user-id-12345',
    email: 'mockuser@example.com',
    name: 'Mock User',
    role: 'user',
    isEmailVerified: true,
    savedRecipes: [],
    createdRecipes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}
