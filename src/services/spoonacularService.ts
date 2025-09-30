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
    const params = new URLSearchParams();
    if (SPOONACULAR_API_KEY) {
      params.append('apiKey', SPOONACULAR_API_KEY);
    }
    if (searchTerm) params.append('query', searchTerm);
    params.append('number', (filters.number || 12).toString());
    params.append('offset', (filters.offset || 0).toString());
    params.append('addRecipeInformation', 'true');
    params.append('fillIngredients', 'true');
    params.append('addRecipeInstructions', 'true');

  if (filters.cuisine) params.append('cuisine', filters.cuisine);
  if (filters.diet) params.append('diet', filters.diet);
  if (filters.type) params.append('type', filters.type);
  if (filters.maxReadyTime) params.append('maxReadyTime', filters.maxReadyTime.toString());
  if (filters.intolerances) params.append('intolerances', filters.intolerances);

    const response = await fetch(`${BASE_URL}/complexSearch?${params}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Spoonacular API error: ${response.status} ${response.statusText}`);
    }

    const data: SpoonacularSearchResponse = await response.json();
    
    const recipes = data.results.map(convertSpoonacularRecipe);

    return {
      recipes,
      totalResults: data.totalResults,
      fromCache: false
    };
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