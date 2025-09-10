/**
 * Test Database Utilities für SmartPlates
 * 
 * Diese Datei stellt Funktionen für das Testen mit einer echten MongoDB-Datenbank bereit.
 * Verwendet echte MongoDB-Verbindung für bessere Kompatibilität und Performance.
 */

import { connectToDatabase } from '@/lib/db';
import { Db } from 'mongodb';

// Test database instance
let testDatabase: Db | null = null;

/**
 * Setup Test Database Connection
 * Verwendet echte MongoDB anstatt Memory Server
 */
export async function setupTestDatabase(): Promise<Db> {
  try {
    console.log('🧪 Setting up test database connection...');
    
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartplates_test';
    process.env.DATABASE_NAME = 'smartplates_test';
    
    // Connect to real MongoDB instance
    testDatabase = await connectToDatabase();
    
    console.log('✅ Test database connected successfully');
    return testDatabase;
    
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    throw error;
  }
}

/**
 * Teardown Test Database
 * Schließt die Datenbankverbindung nach den Tests
 */
export async function teardownTestDatabase(): Promise<void> {
  try {
    if (testDatabase) {
      // Optional: Drop test database completely
      await testDatabase.dropDatabase();
      console.log('✅ Test database cleanup complete');
    }
    testDatabase = null;
  } catch (error) {
    console.error('❌ Failed to teardown test database:', error);
  }
}

/**
 * Clear Test Data
 * Löscht alle Daten aus den Test-Collections zwischen Tests
 */
export async function clearTestDatabase(): Promise<void> {
  if (!testDatabase) {
    console.warn('⚠️ Test database not initialized, skipping cleanup');
    return;
  }

  try {
    const collections = ['users', 'recipes', 'categories', 'mealPlans', 'groceryLists'];
    
    for (const collectionName of collections) {
      const collection = testDatabase.collection(collectionName);
      await collection.deleteMany({});
    }
    
    console.log('🧹 Test-Datenbank bereinigt');
  } catch (error) {
    console.error('❌ Failed to clear test data:', error);
  }
}

/**
 * Get Test Database Instance
 */
export function getTestDatabase(): Db {
  if (!testDatabase) {
    throw new Error('Test database not initialized. Call setupTestDatabase first.');
  }
  return testDatabase;
}

/**
 * Test Fixtures - Beispieldaten für Tests
 */
export const testFixtures = {
  users: [
    {
      email: 'testuser1@example.com',
      name: 'Test User 1',
      role: 'user' as const,
      preferences: {
        dietaryRestrictions: ['vegetarian'],
        favoriteCategories: ['pasta'],
        cookingSkillLevel: 'beginner' as const
      },
      savedRecipes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      email: 'testuser2@example.com',
      name: 'Test User 2',
      role: 'admin' as const,
      preferences: {
        dietaryRestrictions: [],
        favoriteCategories: ['meat'],
        cookingSkillLevel: 'advanced' as const
      },
      savedRecipes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  categories: [
    {
      name: 'Pasta',
      description: 'Delicious pasta recipes',
      imageUrl: '/images/pasta.jpg',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Meat',
      description: 'Hearty meat dishes',
      imageUrl: '/images/meat.jpg',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  recipes: [
    {
      title: 'Spaghetti Carbonara',
      description: 'Classic Italian pasta dish',
      ingredients: [
        { name: 'Spaghetti', amount: 400, unit: 'g' },
        { name: 'Eggs', amount: 4, unit: 'pieces' },
        { name: 'Bacon', amount: 200, unit: 'g' }
      ],
      instructions: [
        'Boil pasta according to package instructions',
        'Fry bacon until crispy',
        'Mix eggs with cheese',
        'Combine everything while pasta is hot'
      ],
      cookingTime: 30,
      servings: 4,
      difficulty: 'medium' as const,
      categories: [], // Will be populated with actual IDs
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
};

/**
 * Insert Test Fixtures
 * Fügt Testdaten in die Datenbank ein
 */
export async function insertTestFixtures(fixtures: typeof testFixtures): Promise<{
  userIds: string[];
  categoryIds: string[];
  recipeIds: string[];
}> {
  const db = getTestDatabase();
  
  // Insert users
  const userResult = await db.collection('users').insertMany(fixtures.users);
  const userIds = Object.values(userResult.insertedIds).map(id => id.toString());
  
  // Insert categories  
  const categoryResult = await db.collection('categories').insertMany(fixtures.categories);
  const categoryIds = Object.values(categoryResult.insertedIds).map(id => id.toString());
  
  // Insert recipes with category references
  const recipesWithCategories = fixtures.recipes.map(recipe => ({
    ...recipe,
    categories: [categoryIds[0]], // Assign first category
    createdBy: userIds[0] // Assign first user as creator
  }));
  
  const recipeResult = await db.collection('recipes').insertMany(recipesWithCategories);
  const recipeIds = Object.values(recipeResult.insertedIds).map(id => id.toString());
  
  return { userIds, categoryIds, recipeIds };
}

/**
 * Test Data Factory - Vereinfachte Datenerzeuger
 */
export const testSeeder = {
  async seedUser(overrides: Record<string, unknown> = {}): Promise<string> {
    const db = getTestDatabase();
    const userData = {
      email: `testuser${Date.now()}@example.com`,
      name: 'Test User',
      role: 'user',
      ...overrides,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('users').insertOne(userData);
    return result.insertedId.toString();
  },

  async seedCategory(overrides: Record<string, unknown> = {}): Promise<string> {
    const db = getTestDatabase();
    const categoryData = {
      name: `Test Category ${Date.now()}`,
      description: 'Test category description',
      ...overrides,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('categories').insertOne(categoryData);
    return result.insertedId.toString();
  },

  async seedRecipe(overrides: Record<string, unknown> = {}): Promise<string> {
    const db = getTestDatabase();
    const recipeData = {
      title: `Test Recipe ${Date.now()}`,
      description: 'Test recipe description',
      ingredients: [{ name: 'Test Ingredient', amount: 1, unit: 'piece' }],
      instructions: ['Test instruction'],
      cookingTime: 30,
      servings: 4,
      difficulty: 'easy',
      isPublic: true,
      ...overrides,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('recipes').insertOne(recipeData);
    return result.insertedId.toString();
  },

  async seedBasicData(): Promise<{ userIds: string[]; categoryIds: string[]; recipeIds: string[] }> {
    const userIds = [
      await this.seedUser({ email: 'user1@test.com', name: 'User 1' }),
      await this.seedUser({ email: 'user2@test.com', name: 'User 2' })
    ];
    
    const categoryIds = [
      await this.seedCategory({ name: 'Pasta', description: 'Pasta dishes' }),
      await this.seedCategory({ name: 'Meat', description: 'Meat dishes' })
    ];
    
    const recipeIds = [
      await this.seedRecipe({ 
        title: 'Test Pasta Recipe', 
        categories: [categoryIds[0]],
        createdBy: userIds[0]
      }),
      await this.seedRecipe({ 
        title: 'Test Meat Recipe', 
        categories: [categoryIds[1]],
        createdBy: userIds[1]
      })
    ];
    
    return { userIds, categoryIds, recipeIds };
  }
};

/**
 * Test Response Parser
 */
export async function parseTestResponse(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: 'Invalid JSON response', rawResponse: text };
  }
}