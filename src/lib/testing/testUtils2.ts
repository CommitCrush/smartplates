// Minimal stub for test utilities to satisfy imports and basic typing during strict TS builds.
// If you have a real implementation elsewhere, replace this with actual logic.

import type { Recipe } from '../../types/recipe';

type BasicUser = { name: string; email: string; role?: string };
type BasicCategory = { name: string; displayName: string };

interface TestAssertions {
  isValidUser(user: BasicUser): asserts user is BasicUser;
  isValidRecipe(recipe: Recipe): asserts recipe is Recipe;
  isValidCategory(cat: BasicCategory): asserts cat is BasicCategory;
}

export const testSeeder = {
  async seedBasicData(): Promise<{
    users: Array<BasicUser>;
    categories: Array<BasicCategory>;
    recipes: Recipe[];
  }> {
    return {
      users: [
        { name: 'Alice', email: 'alice@example.com', role: 'user' },
        { name: 'Bob', email: 'bob@example.com', role: 'admin' }
      ],
      categories: [
        { name: 'breakfast', displayName: 'Breakfast' },
        { name: 'dinner', displayName: 'Dinner' }
      ],
      recipes: [
        {
          _id: 'stub-1',
          title: 'Stub Pancakes',
          description: 'Delicious pancakes from stub data',
          summary: 'Stub summary',
          image: '/placeholder-recipe.svg',
          servings: 2,
          readyInMinutes: 15,
          extendedIngredients: [],
          analyzedInstructions: [],
          cuisines: [],
          dishTypes: [],
          diets: []
        }
      ]
    };
  }
};

export const testAssertions: TestAssertions = {
  isValidUser(user: BasicUser): asserts user is BasicUser {
    if (!user || typeof user.name !== 'string' || typeof user.email !== 'string') {
      throw new Error('Invalid user');
    }
  },
  isValidRecipe(recipe: Recipe): asserts recipe is Recipe {
    if (!recipe || typeof recipe.title !== 'string') {
      throw new Error('Invalid recipe');
    }
  },
  isValidCategory(cat: BasicCategory): asserts cat is BasicCategory {
    if (!cat || typeof cat.name !== 'string' || typeof cat.displayName !== 'string') {
      throw new Error('Invalid category');
    }
  }
};

export const jestHooks: {
  beforeAll: () => Promise<void>;
  beforeEach: () => Promise<void>;
  afterEach: () => Promise<void>;
  afterAll: () => Promise<void>;
} = {
  async beforeAll(): Promise<void> { /* no-op stub */ },
  async beforeEach(): Promise<void> { /* no-op stub */ },
  async afterEach(): Promise<void> { /* no-op stub */ },
  async afterAll(): Promise<void> { /* no-op stub */ }
};
