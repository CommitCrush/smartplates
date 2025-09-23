/**
 * Spoonacular API Service
 * 
 * Integration with Spoonacular API for external recipe data
 * Replaces mock implementations with real recipe data
 */

import { Recipe } from '@/types/recipe';

// Support both server-side and client-side API access
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY || process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com/recipes';

if (!SPOONACULAR_API_KEY) {
  console.warn('SPOONACULAR_API_KEY not found in environment variables');
} else if (process.env.NODE_ENV === 'development') {
  console.log('DEBUG Spoonacular API configured with key:', SPOONACULAR_API_KEY ? '***' + SPOONACULAR_API_KEY.slice(-4) : 'not found');
}

/**
 * Interface for Spoonacular API response
 */
export interface SpoonacularRecipe {
  id: number;
  title: string;
  summary: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  extendedIngredients: Array<{
    id: number;
    name: string;
    amount: number;
    unit: string;
  }>;
  analyzedInstructions: Array<{
    steps: Array<{
      number: number;
      step: string;
    }>;
  }>;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  nutrition?: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
}

interface SpoonacularSearchResponse {
  results: SpoonacularRecipe[];
  totalResults: number;
}

/**
 * Converts Spoonacular recipe to our Recipe format
 */
function convertSpoonacularRecipe(spoonacularRecipe: SpoonacularRecipe): Recipe {
  const ingredients = spoonacularRecipe.extendedIngredients.map((ing, index) => ({
    id: `spoonacular-ingredient-${index}`,
    name: ing.name,
    amount: ing.amount,
    unit: ing.unit,
    notes: ''
  }));

  const instructions = spoonacularRecipe.analyzedInstructions[0]?.steps.map((step) => ({
    id: `spoonacular-step-${step.number}`,
    stepNumber: step.number,
    instruction: step.step
  })) || [];

  // Determine meal type from dish types
  let category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' = 'dinner'; // default
  const dishTypes = spoonacularRecipe.dishTypes || [];
  if (dishTypes.includes('breakfast')) category = 'breakfast';
  else if (dishTypes.includes('lunch')) category = 'lunch';
  else if (dishTypes.includes('dessert')) category = 'dessert';
  else if (dishTypes.includes('snack')) category = 'snack';

  // Clean HTML from summary
  const description = spoonacularRecipe.summary.replace(/<[^>]*>/g, '');

  return {
    id: `spoonacular-${spoonacularRecipe.id}`,
    title: spoonacularRecipe.title,
    description: description.substring(0, 300) + '...', // Truncate long descriptions
    image: spoonacularRecipe.image,
    servings: spoonacularRecipe.servings,
    prepTime: Math.floor(spoonacularRecipe.readyInMinutes * 0.3),
    cookTime: Math.floor(spoonacularRecipe.readyInMinutes * 0.7),
    totalTime: spoonacularRecipe.readyInMinutes,
    difficulty: 'medium' as const,
    category,
    cuisine: spoonacularRecipe.cuisines[0] || 'international',
    dietaryRestrictions: (spoonacularRecipe.diets as ('vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'nut-free' | 'keto' | 'paleo')[]) || [],
    tags: [
      ...spoonacularRecipe.cuisines,
      ...spoonacularRecipe.diets,
      'spoonacular'
    ],
    ingredients,
    instructions,
    rating: 4.0,
    ratingsCount: 0,
    likesCount: 0,
    authorId: 'spoonacular',
    authorName: 'Spoonacular',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true
  };
}

/**
 * Search recipes from Spoonacular API (with intelligent caching)
 */
export async function searchSpoonacularRecipes(
  searchTerm: string = '',
  filters: RecipeFilters = {}
): Promise<{ recipes: Recipe[]; totalResults: number; fromCache: boolean }> {
  try {
    const cacheService = await import('./spoonacularCacheService.server');
    return await cacheService.searchRecipesInternal(searchTerm, filters);
  } catch (error) {
    console.error('Spoonacular search error:', error);
    return { recipes: [], totalResults: 0, fromCache: false };
  }
}

/**
 * Get recipe details from Spoonacular API (with intelligent caching)
 */
export async function getSpoonacularRecipe(id: string): Promise<Recipe | null> {
  try {
    const cacheService = await import('./spoonacularCacheService.server');
    return await cacheService.getRecipeInternal(id);
  } catch (error) {
    console.error('Spoonacular recipe fetch error:', error);
    return null;
  }
}

/**
 * Search recipes by ingredients from Spoonacular API (with intelligent caching)
 */
export async function searchRecipesByIngredients(
  ingredients: string[]
): Promise<{ recipes: Recipe[]; totalResults: number; fromCache: boolean }> {
  try {
    const cacheService = await import('./spoonacularCacheService.server');
    return await cacheService.searchRecipesByIngredientsInternal(ingredients);
  } catch (error) {
    console.error('Ingredient search error:', error);
    return { recipes: [], totalResults: 0, fromCache: false };
  }
}

/**
 * Get popular/random recipes from Spoonacular (with intelligent caching)
 */
export async function getPopularSpoonacularRecipes(): Promise<{ recipes: Recipe[]; totalResults: number; fromCache: boolean }> {
  try {
    const cacheService = await import('./spoonacularCacheService.server');
    return await cacheService.getPopularRecipesInternal();
  } catch (error) {
    console.error('Popular recipes error:', error);
    return { recipes: [], totalResults: 0, fromCache: false };
  }
}

/**
 * Rate limiting helper
 */
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000 / 150; // 150 requests per minute max

export function rateLimitedRequest<T>(requestFn: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    const delay = Math.max(0, MIN_REQUEST_INTERVAL - timeSinceLastRequest);

    setTimeout(async () => {
      try {
        lastRequestTime = Date.now();
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }, delay);
  });
}
// Export internal functions for service integration
export const searchRecipesInternal = searchRecipes;
export const getRecipeInternal = getRecipe;
export const searchRecipesByIngredientsInternal = searchRecipesByIngredients;
export const getPopularRecipesInternal = getPopularRecipes;