/**
 * Spoonacular Low-Level API Service (Server-Side)
 *
 * This file contains the direct fetch logic for the Spoonacular API.
 * It should only be used by other server-side services (like the cache service)
 * and is not intended for direct use by application components.
 * It handles API key management, request building, and rate limiting.
 */

import { Recipe, RecipeInstructionBlock } from '@/types/recipe';
import { SpoonacularApiRecipe, SpoonacularIngredient, SpoonacularFoundRecipe } from './spoonacularEnhancements.server';
import { RecipeFilters } from './spoonacularService';

// Support both server-side and client-side API access
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY || process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
const SPOONACULAR_API_URL = 'https://api.spoonacular.com';

if (!SPOONACULAR_API_KEY) {
  console.warn('SPOONACULAR_API_KEY not found in environment variables. Spoonacular API calls will fail.');
}

/**
 * Rate limiting helper
 */
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000 / 2; // Throttled to 2 requests per second to be safe

async function rateLimitedFetch(url: string, options?: RequestInit): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  const delay = Math.max(0, MIN_REQUEST_INTERVAL - timeSinceLastRequest);

  return new Promise((resolve) => {
    setTimeout(async () => {
      lastRequestTime = Date.now();
      const response = await fetch(url, options);
      resolve(response);
    }, delay);
  });
}

/**
 * Transforms a raw Spoonacular recipe object into our application's Recipe type.
 */
export async function transformSpoonacularRecipe(
  spoonacularRecipe: SpoonacularApiRecipe
): Promise<Recipe> {
  return {
    _id: `spoonacular-${spoonacularRecipe.id}`,
    spoonacularId: spoonacularRecipe.id,
    title: spoonacularRecipe.title,
    description: spoonacularRecipe.summary?.replace(/<[^>]*>?/gm, '') || '',
    image: spoonacularRecipe.image,
    servings: spoonacularRecipe.servings,
    readyInMinutes: spoonacularRecipe.readyInMinutes,
    summary: spoonacularRecipe.summary || '',
    extendedIngredients: (spoonacularRecipe.extendedIngredients || []).map((ing: SpoonacularIngredient) => ({
      id: `spoonacular-${ing.id}`,
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      notes: ing.original,
    })),
    analyzedInstructions: (spoonacularRecipe.analyzedInstructions as RecipeInstructionBlock[]) || [],
    cuisines: spoonacularRecipe.cuisines || [],
    dishTypes: spoonacularRecipe.dishTypes || [],
    diets: spoonacularRecipe.diets || [],
    isSpoonacular: true,
    sourceUrl: spoonacularRecipe.sourceUrl,
    nutrition: spoonacularRecipe.nutrition || undefined,
  } as Recipe;
}

/**
 * Performs a "complexSearch" API call to Spoonacular.
 */
export async function fetchComplexSearch(
  searchTerm: string,
  filters: RecipeFilters
): Promise<{ recipes: Recipe[]; totalResults: number }> {
  if (!SPOONACULAR_API_KEY) return { recipes: [], totalResults: 0 };

  const cleanedFilters: Record<string, string> = {};
  for (const key in filters) {
    if (filters[key] !== undefined && filters[key] !== null) {
      cleanedFilters[key] = String(filters[key]);
    }
  }

  const params = new URLSearchParams({
    apiKey: SPOONACULAR_API_KEY,
    query: searchTerm,
    addRecipeInformation: 'true',
    fillIngredients: 'true', // Ensure we get ingredient details
    number: (filters.number || 12).toString(),
    offset: (filters.offset || 0).toString(),
    ...cleanedFilters,
  });

  const url = `${SPOONACULAR_API_URL}/recipes/complexSearch?${params.toString()}`;
  console.log(`🌐 [API Fetch] Calling Spoonacular complexSearch: ${searchTerm}`);
  
  const response = await rateLimitedFetch(url);
  if (!response.ok) {
    throw new Error(`Spoonacular API error! status: ${response.status} ${await response.text()}`);
  }
  const data = await response.json();
  
  // The 'results' from complexSearch may not have all details.
  // We will fetch each recipe individually to ensure we get all data.
  const detailedRecipes = await Promise.all(
    data.results.map(async (recipe: { id: number }) => {
      const detailedRecipe = await fetchRecipeById(recipe.id.toString());
      return detailedRecipe ? transformSpoonacularRecipe(detailedRecipe) : null;
    })
  );

  const validRecipes = detailedRecipes.filter((r): r is Recipe => r !== null);

  return { recipes: validRecipes, totalResults: data.totalResults };
}

/**
 * Fetches a single recipe's information by its ID.
 */
export async function fetchRecipeById(id: string): Promise<SpoonacularApiRecipe | null> {
  if (!SPOONACULAR_API_KEY) return null;
  
  const numericId = id.replace('spoonacular-', '');
  const params = new URLSearchParams({
    apiKey: SPOONACULAR_API_KEY,
    includeNutrition: 'true',
  });

  const url = `${SPOONACULAR_API_URL}/recipes/${numericId}/information?${params.toString()}`;
  console.log(`🌐 [API Fetch] Calling Spoonacular getRecipeById: ${numericId}`);

  const response = await rateLimitedFetch(url);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Spoonacular API error! status: ${response.status} ${await response.text()}`);
  }
  
  return response.json();
}

/**
 * Fetches recipes based on a list of ingredients.
 */
export async function fetchRecipesByIngredients(
  ingredients: string[]
): Promise<SpoonacularFoundRecipe[]> {
  if (!SPOONACULAR_API_KEY) return [];

  const params = new URLSearchParams({
    apiKey: SPOONACULAR_API_KEY,
    ingredients: ingredients.join(','),
    number: '12',
    ranking: '1', // Maximize used ingredients
    ignorePantry: 'true',
  });

  const url = `${SPOONACULAR_API_URL}/recipes/findByIngredients?${params.toString()}`;
  console.log(`🌐 [API Fetch] Calling Spoonacular findByIngredients`);

  const response = await rateLimitedFetch(url);
  if (!response.ok) {
    throw new Error(`Spoonacular API error! status: ${response.status} ${await response.text()}`);
  }
  const data = await response.json();
  return data as SpoonacularFoundRecipe[];
}

/**
 * Fetches random popular recipes.
 */
export async function fetchPopularRecipes(): Promise<{ recipes: Recipe[]; totalResults: number }> {
  if (!SPOONACULAR_API_KEY) return { recipes: [], totalResults: 0 };

  const params = new URLSearchParams({
    apiKey: SPOONACULAR_API_KEY,
    number: '12',
    sort: 'popularity',
  });

  const url = `${SPOONACULAR_API_URL}/recipes/random?${params.toString()}`;
   console.log(`🌐 [API Fetch] Calling Spoonacular random`);

  const response = await rateLimitedFetch(url);
  if (!response.ok) {
    throw new Error(`Spoonacular API error! status: ${response.status} ${await response.text()}`);
  }
  const data = await response.json();

  const recipes = await Promise.all(data.recipes.map(transformSpoonacularRecipe));
  return { recipes, totalResults: recipes.length };
}
