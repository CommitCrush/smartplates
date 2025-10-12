/**
 * Server-Side Spoonacular Cache Implementation
 *
 * Contains all MongoDB operations and should only be imported server-side
 * to prevent client-side bundling issues
 */

import { 
  SpoonacularApiRecipe, 
  SpoonacularIngredient,
  SpoonacularFoundRecipe,
  SpoonacularSearchResultRecipe,
} from './spoonacularEnhancements.server';
import {
  SpoonacularQuotaTracker,
  SpoonacularSearchCache,
  SpoonacularRecipeCache,
  SpoonacularIngredientSearchCache,
  SpoonacularRandomCache,
  SpoonacularNutritionCache,
  generateSearchCacheKey,
  generateIngredientSearchCacheKey,
  generateRandomCacheKey,
  generateRecipeCacheKey,
} from '@/models/SpoonacularCache';
import { Recipe, RecipeInstructionBlock } from '@/types/recipe';
import { connectToDatabase } from '@/lib/mongodb';
import { 
  fetchComplexSearch, 
  fetchRecipeById, 
  fetchPopularRecipes, 
  fetchRecipesByIngredients,
  transformSpoonacularRecipe,
} from './spoonacularApi.server';
import { RecipeFilters as SpoonacularApiOptions } from './spoonacularService';

// Configuration
const CACHE_CONFIG = {
  RECIPE_TTL: 7 * 24 * 60 * 60 * 1000, // 7 days
  SEARCH_TTL: 24 * 60 * 60 * 1000, // 24 hours
  INGREDIENT_SEARCH_TTL: 2 * 60 * 60 * 1000, // 2 hours
  RANDOM_TTL: 6 * 60 * 60 * 1000, // 6 hours
  NUTRITION_TTL: 30 * 24 * 60 * 60 * 1000, // 30 days
  DAILY_QUOTA_LIMIT: 150,
  QUOTA_BUFFER: 10,
};

// Helper functions for quota management
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

async function checkQuotaAllowance(): Promise<{ allowed: boolean; remaining: number }> {
  await connectToDatabase();
  const today = getTodayString();
  let quotaTracker = await SpoonacularQuotaTracker.findOne({ date: today });

  if (!quotaTracker) {
    quotaTracker = new SpoonacularQuotaTracker({ date: today, requestCount: 0, quotaLimit: CACHE_CONFIG.DAILY_QUOTA_LIMIT });
    await quotaTracker.save();
  }

  const remaining = Math.max(0, (quotaTracker.quotaLimit || CACHE_CONFIG.DAILY_QUOTA_LIMIT) - quotaTracker.requestCount);
  const allowed = remaining > CACHE_CONFIG.QUOTA_BUFFER;
  return { allowed, remaining };
}

async function recordApiUsage(endpoint: string): Promise<void> {
  await connectToDatabase();
  const today = getTodayString();
  await SpoonacularQuotaTracker.updateOne(
    { date: today },
    { 
      $inc: { requestCount: 1, [`endpoints.${endpoint}`]: 1 },
      $set: { updatedAt: new Date() },
      $setOnInsert: { date: today, quotaLimit: CACHE_CONFIG.DAILY_QUOTA_LIMIT, createdAt: new Date() }
    },
    { upsert: true }
  );
}

// --- Main Caching Logic ---

async function searchAndCache<T>(
  cacheKey: string,
  cacheModel: any, // Mongoose Model
  ttl: number,
  apiCall: () => Promise<T>,
  endpointName: string,
  transform?: (data: T) => any
) {
  await connectToDatabase();

  // 1. Check fresh cache
  const freshCache = await cacheModel.findOne({ cacheKey, expiresAt: { $gt: new Date() } });
  if (freshCache) {
    console.log(`✅ [${endpointName}] Fresh cache HIT`);
    return { data: freshCache.data, fromCache: true };
  }

  // 2. Check quota
  const quota = await checkQuotaAllowance();
  if (!quota.allowed) {
    console.log(`❌ [${endpointName}] Quota exceeded. Trying stale cache.`);
    const staleCache = await cacheModel.findOne({ cacheKey });
    if (staleCache) {
      console.log(`🔄 [${endpointName}] Stale cache HIT`);
      return { data: staleCache.data, fromCache: true };
    }
    console.log(`🦹 [${endpointName}] No cache available and quota exceeded.`);
    throw new Error("API quota exceeded and no cache is available.");
  }

  // 3. Make API call
  try {
    console.log(`🌐 [${endpointName}] API CALL`);
    const apiData = await apiCall();
    await recordApiUsage(endpointName);

    // Transform data before caching if a transformer is provided
    const dataToCache = transform ? transform(apiData) : apiData;

    // 4. Cache the result
    await cacheModel.findOneAndUpdate(
      { cacheKey },
      {
        cacheKey,
        data: dataToCache,
        expiresAt: new Date(Date.now() + ttl),
        $inc: { requestCount: 1 },
        $set: { lastAccessed: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, new: true }
    );
    console.log(`💾 [${endpointName}] Cached new data.`);

    return { data: apiData, fromCache: false };

  } catch (error) {
    console.error(`❌ [${endpointName}] API call failed:`, error);
    console.log(`🦹 [${endpointName}] Trying stale cache as fallback.`);
    const staleCache = await cacheModel.findOne({ cacheKey });
    if (staleCache) {
      console.log(`🔄 [${endpointName}] Stale cache HIT after API failure`);
      return { data: staleCache.data, fromCache: true };
    }
    throw error; // Re-throw the error if API fails and no cache is available
  }
}

// --- Exposed Service Functions ---

export async function getRecipeWithCache(recipeId: string): Promise<{ recipe: Recipe | null; fromCache: boolean }> {
  const numericId = parseInt(recipeId.replace('spoonacular-', ''));
  if (isNaN(numericId)) {
    throw new Error(`Invalid recipe ID format: ${recipeId}`);
  }
  
  const cacheKey = generateRecipeCacheKey(numericId);

  try {
    const { data: apiRecipe, fromCache } = await searchAndCache(
      cacheKey,
      SpoonacularRecipeCache,
      CACHE_CONFIG.RECIPE_TTL,
      () => fetchRecipeById(numericId.toString()), // Pass numeric ID to fetcher
      'recipeInformation'
    );

    if (!apiRecipe) {
      return { recipe: null, fromCache: true }; // Cache returned null (e.g. from a 404)
    }

    // The cached data is the raw SpoonacularApiRecipe, so we always transform it.
    const transformedRecipe = await transformSpoonacularRecipe(apiRecipe as SpoonacularApiRecipe);
    return { recipe: transformedRecipe, fromCache };

  } catch (error) {
    console.error(`Failed to get recipe ${recipeId} from API and cache.`, error);
    return { recipe: null, fromCache: false };
  }
}

export async function searchRecipesWithCache(query: string, options: SpoonacularApiOptions = {}): Promise<{ recipes: Recipe[]; totalResults: number; fromCache:boolean }> {
  const cacheKey = generateSearchCacheKey(query, options);
  try {
    const { data: apiResult, fromCache } = await searchAndCache(
      cacheKey,
      SpoonacularSearchCache,
      CACHE_CONFIG.SEARCH_TTL,
      () => fetchComplexSearch(query, options),
      'complexSearch'
    );

    const recipes = await Promise.all(
        (apiResult.results || []).map(transformSpoonacularRecipe)
    );

    return { recipes, totalResults: apiResult.totalResults || 0, fromCache };

  } catch (error) {
    console.error(`Failed to search recipes for "${query}"`, error);
    return { recipes: [], totalResults: 0, fromCache: false };
  }
}

export async function searchRecipesByIngredientsWithCache(ingredients: string[]): Promise<{ recipes: Recipe[]; fromCache: boolean }> {
  const cacheKey = generateIngredientSearchCacheKey(ingredients);
  try {
    const { data: apiResult, fromCache } = await searchAndCache(
      cacheKey,
      SpoonacularIngredientSearchCache,
      CACHE_CONFIG.INGREDIENT_SEARCH_TTL,
      () => fetchRecipesByIngredients(ingredients),
      'findByIngredients'
    );
    const recipes = (apiResult || []).map(transformFoundRecipeToRecipe);
    return { recipes, fromCache };
  } catch (error) {
    console.error('Failed to search by ingredients', error);
    return { recipes: [], fromCache: false };
  }
}

export async function getPopularRecipesWithCache(options: Record<string, unknown> = {}): Promise<{ recipes: Recipe[]; fromCache: boolean }> {
  const tags: string[] = Array.isArray(options.tags) ? options.tags : [];
  const number = typeof options.number === 'number' ? options.number : 10;
  const cacheKey = generateRandomCacheKey(tags, number);

  try {
    const { data: apiResult, fromCache } = await searchAndCache(
      cacheKey,
      SpoonacularRandomCache,
      CACHE_CONFIG.RANDOM_TTL,
      () => fetchPopularRecipes(), // Assuming fetchPopularRecipes takes similar options
      'random'
    );
    const recipes = await Promise.all((apiResult.recipes || []).map(transformSpoonacularRecipe));
    return { recipes, fromCache };
  } catch (error) {
    console.error('Failed to get popular recipes', error);
    return { recipes: [], fromCache: false };
  }
}

// --- Helper for transforming ingredient search results ---
function transformFoundRecipeToRecipe(item: SpoonacularFoundRecipe): Recipe {
  return {
    _id: `spoonacular-${item.id}`,
    spoonacularId: item.id,
    title: item.title,
    image: item.image,
    description: `A recipe using some of your ingredients. More details available upon selection.`,
    summary: `A recipe using some of your ingredients. More details available upon selection.`,
    readyInMinutes: 0, // Not provided
    servings: 0, // Not provided
    extendedIngredients: [...(item.usedIngredients || []), ...(item.missedIngredients || [])].map(ing => ({
      id: ing.id,
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      notes: ing.original
    })),
    analyzedInstructions: [],
    cuisines: [],
    dishTypes: [],
    diets: [],
    isSpoonacular: true,
  } as Recipe;
}

// Other utility functions (getCacheStats, etc.) remain unchanged and are omitted for brevity.