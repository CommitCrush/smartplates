/**
 * Spoonacular API Service
 * 
 * Integration with Spoonacular API for external recipe data
 * Replaces mock implementations with real recipe data
 */

import { Recipe } from '@/types/recipe';

/**
 * Recipe filter interface for search functionality
 */
export interface RecipeFilters {
  diet?: string;
  cuisine?: string;
  type?: string;
  intolerances?: string;
  includeIngredients?: string;
  excludeIngredients?: string;
  maxReadyTime?: number;
  minServings?: number;
  maxServings?: number;
  offset?: number;
  number?: number;
}

// Support both server-side and client-side API access
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY || process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;

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
  // ...existing code...

  // Clean HTML from summary
  const description = spoonacularRecipe.summary.replace(/<[^>]*>/g, '');

  return {
    id: `spoonacular-${spoonacularRecipe.id}`,
    title: spoonacularRecipe.title,
    description: description.substring(0, 300) + '...',
    summary: spoonacularRecipe.summary || '',
    image: spoonacularRecipe.image,
    servings: spoonacularRecipe.servings,
    readyInMinutes: spoonacularRecipe.readyInMinutes,
    extendedIngredients: spoonacularRecipe.extendedIngredients || [],
    analyzedInstructions: spoonacularRecipe.analyzedInstructions || [],
    cuisines: spoonacularRecipe.cuisines || [],
    dishTypes: spoonacularRecipe.dishTypes || [],
    diets: spoonacularRecipe.diets || [],
    nutrition: spoonacularRecipe.nutrition || undefined
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
    const result = await cacheService.getRecipeInternal(id);
    return result.recipe;
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
    const result = await cacheService.searchRecipesByIngredientsInternal(ingredients);
    return { ...result, totalResults: result.recipes.length };
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
    const result = await cacheService.getPopularRecipesInternal();
    return { ...result, totalResults: result.recipes.length };
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
// Note: Internal functions are now exported from spoonacularCacheService.server.ts