/**
 * API Tests für SmartPlates
 * 
 * Diese Tests überprüfen die grundlegenden API-Funktionen
 * mit echter MongoDB-Verbindung.
 */

import { 
  setupTestDatabase, 
  clearTestDatabase,
  testSeeder,
  jestHooks
} from '@/lib/testing/testUtils';

// Jest Hooks für Setup und Cleanup
beforeAll(jestHooks.beforeAll);
afterAll(jestHooks.afterAll);
beforeEach(jestHooks.beforeEach);

describe('Database Connection Tests', () => {
  
  test('should connect to test database successfully', async () => {
    const db = await setupTestDatabase();
    expect(db).toBeDefined();
    
    // Test, ob wir Collections erstellen können
    const testCollection = db.collection('test');
    await testCollection.insertOne({ test: 'data' });
    
    const result = await testCollection.findOne({ test: 'data' });
    expect(result).toBeDefined();
    expect(result?.test).toBe('data');
  });

  test('should clear test database successfully', async () => {
    const db = await setupTestDatabase();
    
    // Füge Testdaten hinzu
    await db.collection('test').insertOne({ test: 'data' });
    
    // Bestätige, dass Daten existieren
    let count = await db.collection('test').countDocuments();
    expect(count).toBe(1);
    
    // Bereinige Datenbank
    await clearTestDatabase();
    
    // Bestätige, dass Daten gelöscht wurden
    count = await db.collection('test').countDocuments();
    expect(count).toBe(0);
  });
});

describe('Test Data Factory Tests', () => {
  
  test('should create test user with default values', async () => {
    const user = await testSeeder.seedUser();
    
    // Manuelle Validierung statt testAssertions
    expect(user).toHaveProperty('_id');
    expect(user).toHaveProperty('username');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('role');
    expect(user).toHaveProperty('profile');
    expect(user).toHaveProperty('createdAt');
    
    expect(user.username).toBe('testuser');
    expect(user.email).toBe('test@example.com');
    expect(user.role).toBe('user');
  });

  test('should create test user with custom values', async () => {
    const customUser = await testSeeder.seedUser({
      username: 'customuser',
      email: 'custom@test.com',
      role: 'admin'
    });
    
    // Manuelle Validierung
    expect(customUser).toHaveProperty('_id');
    expect(customUser).toHaveProperty('username');
    expect(customUser).toHaveProperty('email');
    expect(customUser).toHaveProperty('role');
    
    expect(customUser.username).toBe('customuser');
    expect(customUser.email).toBe('custom@test.com');
    expect(customUser.role).toBe('admin');
  });

  test('should create test recipe with default values', async () => {
    const recipe = await testSeeder.seedRecipe();
    
    // Manuelle Validierung
    expect(recipe).toHaveProperty('_id');
    expect(recipe).toHaveProperty('title');
    expect(recipe).toHaveProperty('ingredients');
    expect(recipe).toHaveProperty('instructions');
    expect(recipe).toHaveProperty('category');
    expect(recipe).toHaveProperty('createdAt');
    
    expect(recipe.title).toBe('Test Recipe');
    expect(recipe.category).toBe('main-course');
    expect(recipe.difficulty).toBe('easy');
  });

  test('should create test category with default values', async () => {
    const category = await testSeeder.seedCategory();
    
    // Manuelle Validierung
    expect(category).toHaveProperty('_id');
    expect(category).toHaveProperty('name');
    expect(category).toHaveProperty('displayName');
    expect(category).toHaveProperty('isActive');
    expect(category).toHaveProperty('createdAt');
    
    expect(category.name).toBe('test-category');
    expect(category.displayName).toBe('Test Category');
    expect(category.isActive).toBe(true);
  });
});

describe('Test Seeder Integration Tests', () => {
  
  test('should seed basic data successfully', async () => {
    const { users, recipes, categories } = await testSeeder.seedBasicData();
    
    // Überprüfe Users
    expect(users).toHaveLength(2);
    expect(users[0].username).toBe('alice');
    expect(users[1].username).toBe('bob');
    expect(users[1].role).toBe('admin');
    
    // Überprüfe Categories
    expect(categories).toHaveLength(3);
    expect(categories[0].name).toBe('breakfast');
    expect(categories[1].name).toBe('main-course');
    expect(categories[2].name).toBe('dessert');
    
    // Überprüfe Recipes
    expect(recipes).toHaveLength(2);
    expect(recipes[0].title).toBe('Pancakes');
    expect(recipes[0].category).toBe('breakfast');
    expect(recipes[1].title).toBe('Pasta Bolognese');
    expect(recipes[1].category).toBe('main-course');
    
    // Überprüfe Beziehungen
    expect(recipes[0].authorId.toString()).toBe(users[0]._id.toString());
    expect(recipes[1].authorId.toString()).toBe(users[1]._id.toString());
  });
});

describe('Database Query Tests', () => {
  
  test('should find users by username', async () => {
    const db = await setupTestDatabase();
    
    // Erstelle Test-User
    await testSeeder.seedUser({ username: 'findme', email: 'findme@test.com' });
    
    // Suche User
    const user = await db.collection('users').findOne({ username: 'findme' });
    
    expect(user).toBeDefined();
    expect(user?.username).toBe('findme');
    expect(user?.email).toBe('findme@test.com');
  });

  test('should find recipes by category', async () => {
    const db = await setupTestDatabase();
    
    // Erstelle Test-Recipes
    await testSeeder.seedRecipe({ title: 'Breakfast Recipe', category: 'breakfast' });
    await testSeeder.seedRecipe({ title: 'Dinner Recipe', category: 'main-course' });
    
    // Suche Breakfast Recipes
    const breakfastRecipes = await db.collection('recipes')
      .find({ category: 'breakfast' })
      .toArray();
    
    expect(breakfastRecipes).toHaveLength(1);
    expect(breakfastRecipes[0].title).toBe('Breakfast Recipe');
  });

  test('should respect unique indexes', async () => {
    // Erstelle ersten User
    await testSeeder.seedUser({ username: 'unique', email: 'unique@test.com' });
    
    // Versuche, User mit derselben E-Mail zu erstellen
    try {
      await testSeeder.seedUser({ username: 'different', email: 'unique@test.com' });
      fail('Should have thrown duplicate key error');
    } catch (error: unknown) {
      expect((error as { code: number }).code).toBe(11000); // MongoDB duplicate key error
    }
  });
});
