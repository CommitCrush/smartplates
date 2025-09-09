/**
 * Test Database Utilities für SmartPlates
 * 
 * Diese Datei stellt Funktionen für das Testen mit einer echten MongoDB-Datenbank bereit.
 * Verwendet echte MongoDB-Verbindung für bessere Kompatibilität und Performance.
 */

import { connectToDatabase } from '@/lib/db';
import { Db } from 'mongodb';

// Test-Database Name
const TEST_DATABASE_NAME = 'smartplates_test';

// Test Environment Variables
process.env.MONGODB_DB = TEST_DATABASE_NAME;

let testDb: Db | null = null;

/**
 * Stellt Verbindung zur Test-Datenbank her
 */
export async function setupTestDatabase(): Promise<Db> {
  if (testDb) {
    return testDb;
  }

  try {
    const database = await connectToDatabase();
    testDb = database;
    
    // Test-Datenbank Indizes erstellen (falls nötig)
    await createTestIndexes();
    
    console.log(`✅ Test-Datenbank '${TEST_DATABASE_NAME}' verbunden`);
    return testDb;
  } catch (error) {
    console.error('❌ Fehler beim Verbinden zur Test-Datenbank:', error);
    throw new Error(`Test-Datenbank Verbindung fehlgeschlagen: ${error}`);
  }
}

/**
 * Schließt die Test-Datenbank-Verbindung
 */
export async function teardownTestDatabase(): Promise<void> {
  if (testDb) {
    try {
      // Alle Test-Daten löschen
      await clearTestDatabase();
      testDb = null;
      console.log('✅ Test-Datenbank Verbindung geschlossen');
    } catch (error) {
      console.error('❌ Fehler beim Schließen der Test-Datenbank:', error);
    }
  }
}

/**
 * Löscht alle Daten aus der Test-Datenbank
 */
export async function clearTestDatabase(): Promise<void> {
  if (!testDb) {
    throw new Error('Test-Datenbank ist nicht verbunden');
  }

  try {
    // Alle Collections in der Test-Datenbank löschen
    const collections = await testDb.listCollections().toArray();
    
    for (const collection of collections) {
      await testDb.collection(collection.name).deleteMany({});
    }
    
    console.log('✅ Test-Datenbank bereinigt');
  } catch (error) {
    console.error('❌ Fehler beim Bereinigen der Test-Datenbank:', error);
    throw error;
  }
}

/**
 * Erstellt notwendige Indizes für Test-Collections
 */
async function createTestIndexes(): Promise<void> {
  if (!testDb) return;

  try {
    // Users Collection Indizes
    await testDb.collection('users').createIndex({ email: 1 }, { unique: true });
    await testDb.collection('users').createIndex({ username: 1 }, { unique: true });
    
    // Recipes Collection Indizes
    await testDb.collection('recipes').createIndex({ title: 'text', description: 'text' });
    await testDb.collection('recipes').createIndex({ category: 1 });
    await testDb.collection('recipes').createIndex({ authorId: 1 });
    
    // Categories Collection Indizes
    await testDb.collection('categories').createIndex({ name: 1 }, { unique: true });
    
    console.log('✅ Test-Indizes erstellt');
  } catch (error) {
    console.error('❌ Fehler beim Erstellen der Test-Indizes:', error);
  }
}

/**
 * Test Data Factory - Erstellt Testdaten
 */
export const testDataFactory = {
  
  /**
   * Erstellt einen Test-User
   */
  createUser: (overrides: Record<string, any> = {}) => ({
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword123',
    role: 'user',
    profile: {
      firstName: 'Test',
      lastName: 'User',
      bio: 'Test user bio',
      location: 'Test City',
      website: '',
      avatar: ''
    },
    preferences: {
      language: 'de',
      theme: 'light',
      notifications: {
        email: true,
        push: false
      },
      privacy: {
        profilePublic: true,
        recipesPublic: true
      }
    },
    stats: {
      recipesCount: 0,
      followersCount: 0,
      followingCount: 0
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),

  /**
   * Erstellt ein Test-Recipe
   */
  createRecipe: (overrides: Record<string, any> = {}) => ({
    title: 'Test Recipe',
    description: 'A delicious test recipe',
    ingredients: [
      { name: 'Test Ingredient 1', amount: '100g' },
      { name: 'Test Ingredient 2', amount: '200ml' }
    ],
    instructions: [
      'Step 1: Test instruction',
      'Step 2: Another test instruction'
    ],
    category: 'main-course',
    difficulty: 'easy',
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    nutrition: {
      calories: 250,
      protein: 12,
      carbs: 30,
      fat: 8
    },
    tags: ['test', 'recipe'],
    image: '',
    video: '',
    authorId: null,
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),

  /**
   * Erstellt eine Test-Category
   */
  createCategory: (overrides: Record<string, any> = {}) => ({
    name: 'test-category',
    displayName: 'Test Category',
    description: 'A test category for recipes',
    icon: 'utensils',
    color: '#22c55e',
    isActive: true,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  })
};

/**
 * Test Database Seeder - Füllt Datenbank mit Testdaten
 */
export const testSeeder = {
  
  /**
   * Erstellt einen Test-User in der Datenbank
   * @returns Den erstellten User mit _id
   */
  async seedUser(userData: Record<string, any> = {}): Promise<any> {
    const db = await setupTestDatabase();
    const user = testDataFactory.createUser(userData);
    
    const result = await db.collection('users').insertOne(user);
    return { ...user, _id: result.insertedId };
  },

  /**
   * Erstellt eine Test-User ID in der Datenbank  
   * @returns Nur die ID als String
   */
  async seedUserId(userData: Record<string, any> = {}): Promise<string> {
    const user = await this.seedUser(userData);
    return user._id.toString();
  },

  /**
   * Erstellt ein Test-Recipe in der Datenbank
   * @returns Das erstellte Recipe mit _id
   */
  async seedRecipe(recipeData: Record<string, any> = {}): Promise<any> {
    const db = await setupTestDatabase();
    const recipe = testDataFactory.createRecipe(recipeData);
    
    const result = await db.collection('recipes').insertOne(recipe);
    return { ...recipe, _id: result.insertedId };
  },

  /**
   * Erstellt eine Test-Recipe ID in der Datenbank
   * @returns Nur die ID als String
   */
  async seedRecipeId(recipeData: Record<string, any> = {}): Promise<string> {
    const recipe = await this.seedRecipe(recipeData);
    return recipe._id.toString();
  },

  /**
   * Erstellt eine Test-Category in der Datenbank
   * @returns Die erstellte Category mit _id
   */
  async seedCategory(categoryData: Record<string, any> = {}): Promise<any> {
    const db = await setupTestDatabase();
    const category = testDataFactory.createCategory(categoryData);
    
    const result = await db.collection('categories').insertOne(category);
    return { ...category, _id: result.insertedId };
  },

  /**
   * Erstellt eine Test-Category ID in der Datenbank
   * @returns Nur die ID als String
   */
  async seedCategoryId(categoryData: Record<string, any> = {}): Promise<string> {
    const category = await this.seedCategory(categoryData);
    return category._id.toString();
  },

  /**
   * Erstellt Standard-Testdaten für umfassende Tests
   */
  async seedBasicData(): Promise<{
    users: any[];
    recipes: any[];
    categories: any[];
    userIds: string[];
    recipeIds: string[];
    categoryIds: string[];
  }> {
    const users = [
      await this.seedUser({ username: 'alice', email: 'alice@test.com' }),
      await this.seedUser({ username: 'bob', email: 'bob@test.com', role: 'admin' })
    ];

    const categories = [
      await this.seedCategory({ name: 'breakfast', displayName: 'Frühstück' }),
      await this.seedCategory({ name: 'main-course', displayName: 'Hauptgerichte' }),
      await this.seedCategory({ name: 'dessert', displayName: 'Desserts' })
    ];

    const recipes = [
      await this.seedRecipe({ 
        title: 'Pancakes', 
        category: 'breakfast',
        authorId: users[0]._id 
      }),
      await this.seedRecipe({ 
        title: 'Pasta Bolognese', 
        category: 'main-course',
        authorId: users[1]._id 
      })
    ];

    // Erstelle auch String-Arrays für die IDs
    const userIds = users.map(user => user._id.toString());
    const categoryIds = categories.map(cat => cat._id.toString());
    const recipeIds = recipes.map(recipe => recipe._id.toString());

    return { users, recipes, categories, userIds, categoryIds, recipeIds };
  }
};

/**
 * Test Assertion Utilities
 * Hinweis: Diese Funktionen sollten nur innerhalb von Jest-Tests verwendet werden,
 * wo das globale 'expect' verfügbar ist.
 */
export const testAssertions = {
  
  /**
   * Überprüft ob Response eine gültige API Response ist
   */
  isValidApiResponse: (response: unknown, expectedKeys: string[] = []) => {
    const expect = globalThis.expect || (() => { throw new Error('expect ist nicht verfügbar - verwende nur in Jest Tests'); });
    expect(response).toBeDefined();
    expect(typeof response).toBe('object');
    
    if (expectedKeys.length > 0) {
      expectedKeys.forEach(key => {
        expect(response).toHaveProperty(key);
      });
    }
  },

  /**
   * Überprüft ob User-Objekt gültig ist
   */
  isValidUser: (user: unknown) => {
    const expect = globalThis.expect || (() => { throw new Error('expect ist nicht verfügbar - verwende nur in Jest Tests'); });
    expect(user).toHaveProperty('_id');
    expect(user).toHaveProperty('username');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('role');
    expect(user).toHaveProperty('profile');
    expect(user).toHaveProperty('createdAt');
  },

  /**
   * Überprüft ob Recipe-Objekt gültig ist
   */
  isValidRecipe: (recipe: unknown) => {
    const expect = globalThis.expect || (() => { throw new Error('expect ist nicht verfügbar - verwende nur in Jest Tests'); });
    expect(recipe).toHaveProperty('_id');
    expect(recipe).toHaveProperty('title');
    expect(recipe).toHaveProperty('ingredients');
    expect(recipe).toHaveProperty('instructions');
    expect(recipe).toHaveProperty('category');
    expect(recipe).toHaveProperty('createdAt');
  },

  /**
   * Überprüft ob Category-Objekt gültig ist
   */
  isValidCategory: (category: unknown) => {
    const expect = globalThis.expect || (() => { throw new Error('expect ist nicht verfügbar - verwende nur in Jest Tests'); });
    expect(category).toHaveProperty('_id');
    expect(category).toHaveProperty('name');
    expect(category).toHaveProperty('displayName');
    expect(category).toHaveProperty('isActive');
    expect(category).toHaveProperty('createdAt');
  }
};

/**
 * Jest Setup und Teardown Hooks
 */
export const jestHooks = {
  
  /**
   * Setup vor allen Tests
   */
  beforeAll: async () => {
    console.log('🚀 Starting Test Suite...');
    await setupTestDatabase();
  },

  /**
   * Cleanup nach allen Tests
   */
  afterAll: async () => {
    console.log('🧹 Cleaning up Test Suite...');
    await teardownTestDatabase();
  },

  /**
   * Reset vor jedem Test
   */
  beforeEach: async () => {
    await clearTestDatabase();
  },

  /**
   * Cleanup nach jedem Test
   */
  afterEach: async () => {
    // Zusätzliche Bereinigung falls nötig
  }
};

// Export Test Database für direkte Verwendung
export { testDb };
