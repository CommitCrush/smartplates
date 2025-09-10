/**
 * Test Database Utilities für SmartPlates
 * 
 * Production-ready Test-Infrastruktur mit echter MongoDB-Verbindung.
 * Folgt SmartPlates Patterns und TypeScript-Definitionen.
 */

import { connectToDatabase, COLLECTIONS } from '@/lib/db';
import { Db, ObjectId } from 'mongodb';
import type { User } from '@/types/user.d';
import type { Recipe } from '@/types/recipe.d';
import type { Category } from '@/types/category.d';

// Test database instance
let testDatabase: Db | null = null;

/**
 * Bereinigt alte, nicht mehr verwendete Indizes
 */
async function cleanupOldIndexes(): Promise<void> {
  if (!testDatabase) return;

  try {
    const usersCollection = testDatabase.collection(COLLECTIONS.USERS);
    
    // Liste alle existierenden Indizes auf
    const indexes = await usersCollection.listIndexes().toArray();
    
    // Entferne username-Index falls vorhanden (nicht Teil des SmartPlates User Schema)
    const usernameIndex = indexes.find(index => 
      index.key && 'username' in index.key
    );
    
    if (usernameIndex) {
      console.log('🧹 Removing obsolete username index...');
      await usersCollection.dropIndex('username_1');
    }
    
    console.log('✅ Index cleanup completed');
  } catch (error) {
    console.log('💡 Index cleanup completed (no obsolete indexes found)');
  }
}

/**
 * Erstellt notwendige Indizes für Test-Collections
 */
async function createTestIndexes(): Promise<void> {
  if (!testDatabase) return;

  try {
    // Entferne alte, inkorrekte Indizes zuerst
    await cleanupOldIndexes();
    
    // Users Collection Indizes (entspricht SmartPlates User Interface)
    await testDatabase.collection(COLLECTIONS.USERS).createIndex({ email: 1 }, { unique: true });
    // await testDatabase.collection(COLLECTIONS.USERS).createIndex(
    //   { googleId: 1 }, 
    //   { unique: true, sparse: true }
    // );
    await testDatabase.collection(COLLECTIONS.USERS).createIndex(
  { googleId: 1 },
  { unique: true, partialFilterExpression: { googleId: { $type: "string" } } }
);
    await testDatabase.collection(COLLECTIONS.USERS).createIndex({ role: 1 });
    
    // Recipes Collection Indizes
    await testDatabase.collection(COLLECTIONS.RECIPES).createIndex({ title: 'text', description: 'text' });
    await testDatabase.collection(COLLECTIONS.RECIPES).createIndex({ authorId: 1 });
    await testDatabase.collection(COLLECTIONS.RECIPES).createIndex({ categories: 1 });
    await testDatabase.collection(COLLECTIONS.RECIPES).createIndex({ isPublic: 1 });
    
    // Categories Collection Indizes
    await testDatabase.collection(COLLECTIONS.CATEGORIES).createIndex({ name: 1 }, { unique: true });
    await testDatabase.collection(COLLECTIONS.CATEGORIES).createIndex({ slug: 1 }, { unique: true });
    
    console.log('✅ Test-Indizes erstellt');
  } catch (error) {
    console.error('❌ Fehler beim Erstellen der Test-Indizes:', error);
  }
}

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
    
    // Create test indexes
    await createTestIndexes();
    
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
    const collections = [
      COLLECTIONS.USERS,
      COLLECTIONS.RECIPES,
      COLLECTIONS.CATEGORIES,
      COLLECTIONS.MEAL_PLANS,
      COLLECTIONS.GROCERY_LISTS
    ];
    
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
 * Test Data Factory - Erstellt typisierte Testdaten
 */
export const testDataFactory = {
  
  /**
   * Erstellt einen Test-User entsprechend User-Interface
   */
  createUser: (overrides: Partial<User> = {}): Omit<User, '_id'> => ({
    email: `test${Date.now()}@smartplates.com`,
    name: 'Test User',
    role: 'user',
    googleId: undefined,
    image: '',
    emailVerified: new Date(),
    preferences: {
      dietaryRestrictions: [],
      favoriteCategories: [],
      cookingSkillLevel: 'beginner',
      language: 'de',
      theme: 'light',
      notifications: {
        email: true,
        push: false,
        weeklyMealPlan: true,
        newRecipes: false
      },
      privacy: {
        profilePublic: true,
        recipesPublic: true,
        mealPlansPublic: false
      }
    },
    profile: {
      bio: '',
      location: '',
      website: '',
      socialMedia: {
        instagram: '',
        youtube: '',
        tiktok: ''
      }
    },
    savedRecipes: [],
    createdRecipes: [],
    mealPlans: [],
    groceryLists: [],
    stats: {
      recipesCount: 0,
      followersCount: 0,
      followingCount: 0,
      totalCookingTime: 0
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),

  /**
   * Erstellt ein Test-Recipe entsprechend Recipe-Interface
   */
  createRecipe: (overrides: Partial<Recipe> = {}): Omit<Recipe, '_id'> => ({
    title: `Test Recipe ${Date.now()}`,
    description: 'Ein leckeres Test-Rezept',
    ingredients: [
      { name: 'Mehl', amount: 200, unit: 'g' },
      { name: 'Milch', amount: 300, unit: 'ml' }
    ],
    instructions: [
      'Mehl und Milch vermischen',
      'Bei mittlerer Hitze braten'
    ],
    categories: [],
    difficulty: 'easy',
    prepTime: 15,
    cookTime: 20,
    totalTime: 35,
    servings: 4,
    nutrition: {
      calories: 250,
      protein: 8,
      carbs: 45,
      fat: 5,
      fiber: 3,
      sugar: 8
    },
    tags: ['test', 'einfach'],
    images: [],
    video: '',
    authorId: new ObjectId(),
    isPublic: true,
    rating: {
      average: 0,
      count: 0,
      reviews: []
    },
    cookware: [],
    source: {
      type: 'original',
      url: '',
      attribution: ''
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),

  /**
   * Erstellt eine Test-Category entsprechend Category-Interface
   */
  createCategory: (overrides: Partial<Category> = {}): Omit<Category, '_id'> => ({
    name: `test-category-${Date.now()}`,
    displayName: 'Test Kategorie',
    description: 'Eine Test-Kategorie für Rezepte',
    slug: `test-category-${Date.now()}`,
    icon: 'utensils',
    color: '#22c55e',
    image: '',
    parentId: null,
    isActive: true,
    sortOrder: 0,
    recipeCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  })
};

/**
 * Enhanced Test Data Seeder - Nutzt testDataFactory
 */
export const testSeeder = {
  /**
   * Erstellt einen Test-User in der Datenbank
   */
  async seedUser(userData: Partial<User> = {}): Promise<User> {
    const db = getTestDatabase();
    const user = testDataFactory.createUser(userData);
    
    const result = await db.collection(COLLECTIONS.USERS).insertOne(user);
    return { ...user, _id: result.insertedId } as User;
  },

  /**
   * Erstellt ein Test-Recipe in der Datenbank
   */
  async seedRecipe(recipeData: Partial<Recipe> = {}): Promise<Recipe> {
    const db = getTestDatabase();
    const recipe = testDataFactory.createRecipe(recipeData);
    
    const result = await db.collection(COLLECTIONS.RECIPES).insertOne(recipe);
    return { ...recipe, _id: result.insertedId } as Recipe;
  },

  /**
   * Erstellt eine Test-Category in der Datenbank
   */
  async seedCategory(categoryData: Partial<Category> = {}): Promise<Category> {
    const db = getTestDatabase();
    const category = testDataFactory.createCategory(categoryData);
    
    const result = await db.collection(COLLECTIONS.CATEGORIES).insertOne(category);
    return { ...category, _id: result.insertedId } as Category;
  },

  /**
   * Erstellt Standard-Testdaten für umfassende Tests
   */
  async seedBasicData(): Promise<{
    users: User[];
    recipes: Recipe[];
    categories: Category[];
  }> {
    // Standard-User erstellen
    const users = [
      await this.seedUser({ 
        email: 'alice@smartplates.com',
        name: 'Alice Schmidt',
        role: 'user' 
      }),
      await this.seedUser({ 
        email: 'bob@smartplates.com',
        name: 'Bob Müller',
        role: 'admin' 
      }),
      await this.seedUser({ 
        email: 'chef@smartplates.com',
        name: 'Chef Maria',
        role: 'user',
        preferences: {
          dietaryRestrictions: ['vegetarian'],
          favoriteCategories: ['breakfast', 'dessert'],
          cookingSkillLevel: 'expert',
          language: 'de',
          theme: 'dark',
          notifications: {
            email: true,
            push: true,
            weeklyMealPlan: true,
            newRecipes: true
          },
          privacy: {
            profilePublic: true,
            recipesPublic: true,
            mealPlansPublic: false
          }
        }
      })
    ];

    // Standard-Kategorien erstellen
    const categories = [
      await this.seedCategory({ 
        name: 'breakfast',
        displayName: 'Frühstück',
        description: 'Leckere Rezepte für den Start in den Tag',
        slug: 'fruehstueck',
        icon: 'coffee'
      }),
      await this.seedCategory({ 
        name: 'main-course',
        displayName: 'Hauptgerichte',
        description: 'Herzhafte Hauptmahlzeiten',
        slug: 'hauptgerichte',
        icon: 'utensils'
      }),
      await this.seedCategory({ 
        name: 'dessert',
        displayName: 'Desserts',
        description: 'Süße Nachspeisen und Leckereien',
        slug: 'desserts',
        icon: 'cookie'
      })
    ];

    // Standard-Rezepte erstellen
    const recipes = [
      await this.seedRecipe({ 
        title: 'Fluffige Pancakes',
        description: 'Amerikanische Pancakes wie vom Diner',
        categories: [categories[0]._id],
        authorId: users[0]._id,
        difficulty: 'easy',
        prepTime: 10,
        cookTime: 15,
        ingredients: [
          { name: 'Mehl', quantity: 200, unit: 'g' },
          { name: 'Milch', quantity: 300, unit: 'ml' },
          { name: 'Eier', quantity: 2, unit: 'Stück' },
          { name: 'Backpulver', quantity: 1, unit: 'TL' }
        ],
        instructions: [
          { description: 'Alle trockenen Zutaten vermischen' },
          { description: 'Milch und Eier verquirlen' },
          { description: 'Teig zu einer glatten Masse verrühren' },
          { description: 'In der Pfanne goldbraun backen' }
        ]
      }),
      await this.seedRecipe({ 
        title: 'Spaghetti Carbonara',
        description: 'Klassisches italienisches Nudelgericht',
        categories: [categories[1]._id],
        authorId: users[2]._id,
        difficulty: 'medium',
        prepTime: 15,
        cookTime: 20,
        ingredients: [
          { name: 'Spaghetti', amount: 400, unit: 'g' },
          { name: 'Speck', amount: 150, unit: 'g' },
          { name: 'Eier', amount: 3, unit: 'Stück' },
          { name: 'Parmesan', amount: 100, unit: 'g' }
        ]
      })
    ];

    return { users, recipes, categories };
  }
};

/**
 * Test Assertion Utilities - Typisierte Validierungen
 */
export const testAssertions = {
  
  /**
   * Überprüft ob User-Objekt dem User-Interface entspricht
   */
  isValidUser: (user: any): asserts user is User => {
    if (!user || typeof user !== 'object') {
      throw new Error('User object is required');
    }
    
    const requiredFields = ['_id', 'email', 'name', 'role', 'preferences', 'profile', 'stats', 'createdAt', 'updatedAt'];
    for (const field of requiredFields) {
      if (!(field in user)) {
        throw new Error(`User missing required field: ${field}`);
      }
    }
    
    // Validiere UserRole
    if (!['user', 'admin', 'viewer'].includes(user.role)) {
      throw new Error(`Invalid user role: ${user.role}`);
    }
  },

  /**
   * Überprüft ob Recipe-Objekt dem Recipe-Interface entspricht
   */
  isValidRecipe: (recipe: any): asserts recipe is Recipe => {
    if (!recipe || typeof recipe !== 'object') {
      throw new Error('Recipe object is required');
    }
    
    const requiredFields = ['_id', 'title', 'description', 'ingredients', 'instructions', 'categories', 'difficulty', 'authorId', 'isPublic', 'createdAt'];
    for (const field of requiredFields) {
      if (!(field in recipe)) {
        throw new Error(`Recipe missing required field: ${field}`);
      }
    }
    
    // Validiere Arrays
    if (!Array.isArray(recipe.ingredients)) {
      throw new Error('Recipe ingredients must be an array');
    }
    if (!Array.isArray(recipe.instructions)) {
      throw new Error('Recipe instructions must be an array');
    }
    if (!Array.isArray(recipe.categories)) {
      throw new Error('Recipe categories must be an array');
    }
    
    // Validiere Difficulty
    if (!['easy', 'medium', 'hard'].includes(recipe.difficulty)) {
      throw new Error(`Invalid recipe difficulty: ${recipe.difficulty}`);
    }
  },

  /**
   * Überprüft ob Category-Objekt dem Category-Interface entspricht
   */
  isValidCategory: (category: any): asserts category is Category => {
    if (!category || typeof category !== 'object') {
      throw new Error('Category object is required');
    }
    
    const requiredFields = ['_id', 'name', 'displayName', 'slug', 'isActive', 'sortOrder', 'createdAt', 'updatedAt'];
    for (const field of requiredFields) {
      if (!(field in category)) {
        throw new Error(`Category missing required field: ${field}`);
      }
    }
    
    // Validiere Typen
    if (typeof category.name !== 'string') {
      throw new Error('Category name must be a string');
    }
    if (typeof category.displayName !== 'string') {
      throw new Error('Category displayName must be a string');
    }
    if (typeof category.isActive !== 'boolean') {
      throw new Error('Category isActive must be a boolean');
    }
    if (typeof category.sortOrder !== 'number') {
      throw new Error('Category sortOrder must be a number');
    }
  }
};

/**
 * Jest Setup und Teardown Hooks - Production-ready
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
   * Cleanup nach jedem Test (falls nötig)
   */
  afterEach: async () => {
    // Zusätzliche Bereinigung falls nötig
  }
};

// Legacy support - behält bestehende API bei
export const testFixtures = {
  users: [
    testDataFactory.createUser({
      email: 'testuser1@example.com',
      name: 'Test User 1',
      role: 'user',
      preferences: {
        dietaryRestrictions: ['vegetarian'],
        favoriteCategories: ['pasta'],
        cookingSkillLevel: 'beginner',
        language: 'de',
        theme: 'light',
        notifications: {
          email: true,
          push: false,
          weeklyMealPlan: true,
          newRecipes: false
        },
        privacy: {
          profilePublic: true,
          recipesPublic: true,
          mealPlansPublic: false
        }
      }
    }),
    testDataFactory.createUser({
      email: 'testuser2@example.com',
      name: 'Test User 2',
      role: 'admin'
    })
  ],
  categories: [
    testDataFactory.createCategory({
      name: 'pasta',
      displayName: 'Pasta',
      description: 'Delicious pasta recipes'
    }),
    testDataFactory.createCategory({
      name: 'meat',
      displayName: 'Meat',
      description: 'Hearty meat dishes'
    })
  ],
  recipes: [
    testDataFactory.createRecipe({
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
      difficulty: 'medium'
    })
  ]
};

/**
 * Insert Test Fixtures (Legacy support)
 */
export async function insertTestFixtures(fixtures: typeof testFixtures): Promise<{
  userIds: string[];
  categoryIds: string[];
  recipeIds: string[];
}> {
  const db = getTestDatabase();
  
  // Insert users
  const userResult = await db.collection(COLLECTIONS.USERS).insertMany(fixtures.users);
  const userIds = Object.values(userResult.insertedIds).map(id => id.toString());
  
  // Insert categories  
  const categoryResult = await db.collection(COLLECTIONS.CATEGORIES).insertMany(fixtures.categories);
  const categoryIds = Object.values(categoryResult.insertedIds).map(id => id.toString());
  
  // Insert recipes with category references
  const recipesWithCategories = fixtures.recipes.map(recipe => ({
    ...recipe,
    categories: [categoryIds[0]], // Assign first category
    authorId: new ObjectId(userIds[0]) // Assign first user as creator
  }));
  
  const recipeResult = await db.collection(COLLECTIONS.RECIPES).insertMany(recipesWithCategories);
  const recipeIds = Object.values(recipeResult.insertedIds).map(id => id.toString());
  
  return { userIds, categoryIds, recipeIds };
}

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