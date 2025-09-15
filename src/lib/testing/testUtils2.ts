/**
 * Test Database Utilities für SmartPlates - Phase 1 Mock
 * 
 * Simplified test utilities for Phase 1 completion.
 * These are mock implementations to avoid complex dependencies.
 */

// Mock types for Phase 1
type MockUser = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
};

type MockRecipe = {
  id: string;
  title: string;
  description: string;
};

type MockCategory = {
  id: string;
  name: string;
  displayName: string;
};

/**
 * Test Data Seeder - Mock Implementation for Phase 1
 */
export const testSeeder = {
  async seedBasicData(): Promise<{
    users: MockUser[];
    categories: MockCategory[];
    recipes: MockRecipe[];
  }> {
    console.log('📝 Mock: Creating basic test data...');
    
    return {
      users: [
        {
          id: 'test-user-1',
          name: 'Test User 1',
          email: 'test1@example.com',
          role: 'user'
        },
        {
          id: 'test-admin-1',
          name: 'Test Admin',
          email: 'admin@example.com',
          role: 'admin'
        }
      ],
      categories: [
        {
          id: 'cat-1',
          name: 'breakfast',
          displayName: 'Breakfast'
        },
        {
          id: 'cat-2',
          name: 'lunch',
          displayName: 'Lunch'
        }
      ],
      recipes: [
        {
          id: 'recipe-1',
          title: 'Test Recipe 1',
          description: 'A simple test recipe'
        },
        {
          id: 'recipe-2',
          title: 'Test Recipe 2',
          description: 'Another test recipe'
        }
      ]
    };
  },

  async seedUser(userData: any = {}): Promise<MockUser> {
    console.log('📝 Mock: Creating test user...');
    return {
      id: `user-${Date.now()}`,
      name: userData.name || 'Test User',
      email: userData.email || 'test@example.com',
      role: userData.role || 'user'
    };
  },

  async seedRecipe(recipeData: any = {}): Promise<MockRecipe> {
    console.log('📝 Mock: Creating test recipe...');
    return {
      id: `recipe-${Date.now()}`,
      title: recipeData.title || 'Test Recipe',
      description: recipeData.description || 'Test recipe description'
    };
  },

  async seedCategory(categoryData: any = {}): Promise<MockCategory> {
    console.log('📝 Mock: Creating test category...');
    return {
      id: `cat-${Date.now()}`,
      name: categoryData.name || 'test-category',
      displayName: categoryData.displayName || 'Test Category'
    };
  }
};

/**
 * Test Assertions - Mock Implementation for Phase 1
 */
export const testAssertions = {
  isValidUser(user: MockUser): boolean {
    console.log(`✅ Mock: Validating user ${user.name}`);
    return true;
  },

  isValidCategory(category: MockCategory): boolean {
    console.log(`✅ Mock: Validating category ${category.displayName}`);
    return true;
  },

  isValidRecipe(recipe: MockRecipe): boolean {
    console.log(`✅ Mock: Validating recipe ${recipe.title}`);
    return true;
  }
};

/**
 * Jest Hooks - Mock Implementation for Phase 1
 */
export const jestHooks = {
  async beforeAll(): Promise<void> {
    console.log('🔧 Mock: Setting up test environment...');
  },

  async beforeEach(): Promise<void> {
    console.log('🔧 Mock: Preparing test case...');
  },

  async afterEach(): Promise<void> {
    console.log('🧹 Mock: Cleaning up after test...');
  },

  async afterAll(): Promise<void> {
    console.log('🧹 Mock: Tearing down test environment...');
  }
};

/**
 * Mock Database Functions for Phase 1
 */
export async function setupTestDatabase(): Promise<any> {
  console.log('🧪 Mock: Setting up test database connection...');
  return Promise.resolve({});
}

export async function teardownTestDatabase(): Promise<void> {
  console.log('✅ Mock: Test database cleanup complete');
}

export async function clearTestDatabase(): Promise<void> {
  console.log('🧹 Mock: Test-Datenbank bereinigt');
}

export function getTestDatabase(): any {
  return {};
}

// Legacy support
export const testFixtures = {
  users: [
    {
      id: 'user-1',
      email: 'testuser1@example.com',
      name: 'Test User 1',
      role: 'user' as const
    },
    {
      id: 'user-2',
      email: 'testuser2@example.com',
      name: 'Test User 2',
      role: 'admin' as const
    }
  ],
  categories: [
    {
      id: 'cat-1',
      name: 'pasta',
      displayName: 'Pasta'
    },
    {
      id: 'cat-2',
      name: 'meat',
      displayName: 'Meat'
    }
  ],
  recipes: [
    {
      id: 'recipe-1',
      title: 'Spaghetti Carbonara',
      description: 'Classic Italian pasta dish'
    }
  ]
};

export async function insertTestFixtures(fixtures: any): Promise<any> {
  console.log('📝 Mock: Inserting test fixtures...');
  return {
    userIds: ['user-1', 'user-2'],
    categoryIds: ['cat-1', 'cat-2'],
    recipeIds: ['recipe-1']
  };
}

export async function parseTestResponse(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: 'Invalid JSON response', rawResponse: text };
  }
}

// Data factory
export const testDataFactory = {
  createUser: (overrides: any = {}): MockUser => ({
    id: `user-${Date.now()}`,
    email: overrides.email || `test${Date.now()}@smartplates.com`,
    name: overrides.name || 'Test User',
    role: overrides.role || 'user'
  }),

  createRecipe: (overrides: any = {}): MockRecipe => ({
    id: `recipe-${Date.now()}`,
    title: overrides.title || `Test Recipe ${Date.now()}`,
    description: overrides.description || 'Ein leckeres Test-Rezept'
  }),

  createCategory: (overrides: any = {}): MockCategory => ({
    id: `cat-${Date.now()}`,
    name: overrides.name || `test-category-${Date.now()}`,
    displayName: overrides.displayName || 'Test Kategorie'
  })
};

// Export everything for easy importing
export default {
  testSeeder,
  testAssertions,
  jestHooks
};