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
import { connectToDatabase } from '@/lib/mongodb'; // Use Mongoose connection
import { 
  fetchComplexSearch, 
  fetchRecipeById, 
  fetchPopularRecipes, 
  fetchRecipesByIngredients,
  transformSpoonacularRecipe,
} from './spoonacularApi.server';
import { RecipeFilters as SpoonacularApiOptions } from './spoonacularService';

// Define missing types
export interface CacheStats {
  totalEntries: number;
  totalExpired: number;
  cacheDetails: Array<{
    name: string;
    count: number;
    expired: number;
  }>;
  quota: {
    used: number;
    limit: number;
    remaining: number;
  };
}

export interface QuotaStatus {
  date: string;
  used: number;
  limit: number;
  remaining: number;
  canMakeRequests: boolean;
  endpoints: Record<string, number>;
}

// ========================================
// Configuration
// ========================================

const CACHE_CONFIG = {
  RECIPE_TTL: 7 * 24 * 60 * 60 * 1000,        // 7 days for individual recipes
  SEARCH_TTL: 24 * 60 * 60 * 1000,            // 24 hours for search results
  INGREDIENT_SEARCH_TTL: 2 * 60 * 60 * 1000,  // 2 hours for ingredient searches
  RANDOM_TTL: 6 * 60 * 60 * 1000,             // 6 hours for random recipes
  NUTRITION_TTL: 30 * 24 * 60 * 60 * 1000,    // 30 days for nutrition data
  
  DAILY_QUOTA_LIMIT: 150,                      // Spoonacular free tier limit
  QUOTA_BUFFER: 10,                            // Reserve 10 requests for critical operations
  
  STALE_SERVE_TIME: 3 * 24 * 60 * 60 * 1000   // Serve stale data up to 3 days if quota exceeded
};

// ========================================
// Types
// ========================================

// Types are now imported from spoonacularEnhancements.server.ts or defined in other central locations.
// This avoids conflicts and ensures consistency.


/**
 * Get today's date string for quota tracking
 */
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Check if quota allows for new requests
 */
async function checkQuotaAllowance(): Promise<{ allowed: boolean; remaining: number }> {
  await connectToDatabase();
  const today = getTodayString();
  let quotaTracker = await SpoonacularQuotaTracker.findOne({ date: today });

  if (!quotaTracker) {
    // Create new quota tracker for today if it doesn't exist
    quotaTracker = new SpoonacularQuotaTracker({
      date: today,
      requestCount: 0,
      quotaLimit: CACHE_CONFIG.DAILY_QUOTA_LIMIT,
      endpoints: {},
    });
    await quotaTracker.save();
  }

  const remaining = Math.max(0, (quotaTracker.quotaLimit || CACHE_CONFIG.DAILY_QUOTA_LIMIT) - quotaTracker.requestCount);
  const allowed = remaining > CACHE_CONFIG.QUOTA_BUFFER;

  return { allowed, remaining };
}

/**
 * Record API request usage
 */
async function recordApiUsage(endpoint: string): Promise<void> {
  await connectToDatabase();
  const today = getTodayString();
  
  const update = {
    $inc: { 
      requestCount: 1,
      [`endpoints.${endpoint}`]: 1
    },
    $set: { 
      updatedAt: new Date(),
    },
    $setOnInsert: {
      date: today,
      quotaLimit: CACHE_CONFIG.DAILY_QUOTA_LIMIT,
      createdAt: new Date()
    }
  };
  
  await SpoonacularQuotaTracker.updateOne(
    { date: today },
    update,
    { upsert: true }
  );
}

// ========================================
// Cache Functions
// ========================================

/**
 * Search recipes with intelligent caching
 */
export async function searchRecipesWithCache(
  query: string,
  options: SpoonacularApiOptions = {}
): Promise<{ recipes: Recipe[]; totalResults: number; fromCache: boolean }> {
  await connectToDatabase();
  const cacheKey = generateSearchCacheKey(query, options);

  // 1. Check cache first
  const cachedResult = await SpoonacularSearchCache.findOne({ cacheKey });

  if (cachedResult && cachedResult.expiresAt > new Date()) {
    console.log(`✅ Cache HIT for search: "${query}"`);
    // Update access tracking without waiting
    SpoonacularSearchCache.updateOne(
      { _id: cachedResult._id },
      {
        $inc: { requestCount: 1 },
        $set: { lastAccessed: new Date() },
      }
    ).catch(console.error);

    if (cachedResult) {
            const recipes: Recipe[] = cachedResult.data.results.map((result: SpoonacularSearchResultRecipe) => ({
        id: `spoonacular-${result.id}`,
        title: result.title,
        description: result.summary?.replace(/<[^>]*>?/gm, '') || '',
        image: result.image,
        servings: result.servings,
        readyInMinutes: result.readyInMinutes,
        summary: result.summary || '',
        extendedIngredients: (result.extendedIngredients || []).map((ing: SpoonacularIngredient) => ({
          id: `spoonacular-${ing.id}`,
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          notes: ing.original,
        })),
        instructions: result.analyzedInstructions || [],
        analyzedInstructions: (result.analyzedInstructions as RecipeInstructionBlock[]) || [],
        cuisines: [],
        dishTypes: [],
        diets: [],
        isSpoonacular: true,
        sourceUrl: result.sourceUrl,
        nutrition: result.nutrition || undefined
      }));

      return {
        recipes,
        totalResults: cachedResult.data.totalResults,
        fromCache: true,
      };
    }
  }

  // 2. Check quota before API call
  const quotaStatus = await checkQuotaAllowance();

  if (!quotaStatus.allowed) {
    console.log(`❌ Quota exceeded (${quotaStatus.remaining} remaining), serving stale cache if available`);

    // Try to serve stale cache
    const staleCache = await SpoonacularSearchCache.findOne({ cacheKey });
    if (staleCache) {
      console.log(`🔄 Serving stale cache for: "${query}"`);
      const recipes = staleCache.data.results.map((result: SpoonacularSearchResultRecipe) => ({
        id: `spoonacular-${result.id}`,
        title: result.title,
        description: result.summary || '',
        summary: result.summary || '',
        image: result.image,
        readyInMinutes: result.readyInMinutes || 30,
        servings: result.servings || 4,
        extendedIngredients: (result.extendedIngredients || []).map((ing: SpoonacularIngredient) => ({
          id: `spoonacular-${ing.id}`,
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          notes: ing.original,
        })),
        instructions: result.analyzedInstructions || [],
        analyzedInstructions: (result.analyzedInstructions as RecipeInstructionBlock[]) || [],
        cuisines: [],
        dishTypes: [],
        diets: [],
        isSpoonacular: true,
        sourceUrl: result.sourceUrl,
        nutrition: result.nutrition || undefined
      }));
      return {
        recipes,
        totalResults: staleCache.data.totalResults,
        fromCache: true,
      };
    }

    // No cache available, return empty results
    return { recipes: [], totalResults: 0, fromCache: false };
  }

  // 3. Make API call
  try {
    console.log(`🌐 API CALL for search: "${query}"`);
    const apiResult = await fetchComplexSearch(query, options);

    // Record API usage
    await recordApiUsage('complexSearch');

    // 4. Cache the result
    const cacheData = {
      results: apiResult.recipes.map((recipe: Recipe) => ({
        id: parseInt(String(recipe.id || recipe._id || '0').replace('spoonacular-', '')),
        title: recipe.title,
        summary: recipe.summary || '',
        image: recipe.image,
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings,
        cuisines: recipe.cuisines || [],
        dishTypes: recipe.dishTypes || [],
        diets: recipe.diets || [],
        extendedIngredients: recipe.extendedIngredients || [],
        analyzedInstructions: recipe.analyzedInstructions || [],
        nutrition: recipe.nutrition || undefined
      })),
      totalResults: apiResult.totalResults,
      number: options.number || 12,
      offset: options.offset || 0,
    };

    const update = {
      $set: {
        cacheKey,
        query,
        filters: options,
        data: cacheData,
        expiresAt: new Date(Date.now() + CACHE_CONFIG.SEARCH_TTL),
        lastAccessed: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
      $inc: {
        requestCount: 1
      }
    };

    await SpoonacularSearchCache.updateOne({ cacheKey }, update, { upsert: true });

    console.log(`💾 Cached search results for: "${query}"`);

    return {
      recipes: apiResult.recipes,
      totalResults: apiResult.totalResults,
      fromCache: false,
    };

  } catch (error) {
    console.error('API call failed:', error);

    // Try to serve stale cache as fallback
    const staleCache = await SpoonacularSearchCache.findOne({ cacheKey });
    if (staleCache) {
      console.log(`🔄 API failed, serving stale cache for: "${query}"`);
      const recipes = staleCache.data.results.map((result: SpoonacularSearchResultRecipe) => ({
        id: `spoonacular-${result.id}`,
        title: result.title,
        description: result.summary || '',
        summary: result.summary || '',
        image: result.image,
        readyInMinutes: result.readyInMinutes || 30,
        servings: result.servings || 4,
        extendedIngredients: (result.extendedIngredients || []).map((ing: SpoonacularIngredient) => ({
          id: `spoonacular-${ing.id}`,
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          notes: ing.original,
        })),
        instructions: result.analyzedInstructions || [],
        analyzedInstructions: (result.analyzedInstructions as RecipeInstructionBlock[]) || [],
        cuisines: [],
        dishTypes: [],
        diets: [],
        isSpoonacular: true,
        sourceUrl: result.sourceUrl,
        nutrition: result.nutrition || undefined
      }));
      return {
        recipes,
        totalResults: staleCache.data.totalResults,
        fromCache: true,
      };
    }

    throw error;
  }
}

/**
 * Get recipe with caching
 */
export async function getRecipeWithCache(recipeId: string): Promise<{ recipe: Recipe | null; fromCache: boolean }> {
  await connectToDatabase();
  
  const numericId = parseInt(recipeId.replace('spoonacular-', ''));
  const cacheKey = generateRecipeCacheKey(numericId);
  
  // Check cache
  const cachedRecipe = await SpoonacularRecipeCache.findOne({ cacheKey });
  
  if (cachedRecipe && cachedRecipe.expiresAt > new Date()) {
    console.log(`✅ Cache HIT for recipe: ${recipeId}`);
    await SpoonacularRecipeCache.findByIdAndUpdate(cachedRecipe._id, {
      $inc: { requestCount: 1 },
      $set: { lastAccessed: new Date() }
    });
    
    // The cached data is in SpoonacularApiRecipe format, so we transform it.
    const transformedRecipe = transformSpoonacularRecipe(cachedRecipe.data as unknown as SpoonacularApiRecipe);
    return { recipe: transformedRecipe, fromCache: true };
  }
  
  // Check quota
  const quotaStatus = await checkQuotaAllowance();
  if (!quotaStatus.allowed) {
    // Try stale cache
    const staleCache = await SpoonacularRecipeCache.findOne({ cacheKey });
    if (staleCache) {
      console.log(`🔄 Serving stale cached recipe: ${recipeId}`);
      // Transform the stale recipe
      const transformedRecipe = transformSpoonacularRecipe(staleCache.data as unknown as SpoonacularApiRecipe);
      return { recipe: transformedRecipe, fromCache: true };
    }
    return { recipe: null, fromCache: false };
  }
  
  // API call
  try {
    console.log(`🌐 API CALL for recipe: ${recipeId}`);
    const apiRecipe = await fetchRecipeById(recipeId);
    
    if (!apiRecipe) {
      return { recipe: null, fromCache: false };
    }
    
    await recordApiUsage('recipeInformation');
    
    // Cache the full, untransformed Spoonacular API recipe data
    const cacheData = {
      cacheKey,
      spoonacularId: numericId,
      data: apiRecipe, // Store the direct API response
      expiresAt: new Date(Date.now() + CACHE_CONFIG.RECIPE_TTL)
    };
    
    await SpoonacularRecipeCache.findOneAndUpdate(
      { cacheKey },
      cacheData,
      { upsert: true, new: true }
    );
    
    console.log(`💾 Cached recipe: ${recipeId}`);
    
    // Transform the fresh API recipe before returning
    const transformedRecipe = transformSpoonacularRecipe(apiRecipe);
    return { recipe: transformedRecipe, fromCache: false };
    
  } catch (error) {
    console.error('Recipe API call failed:', error);
    return { recipe: null, fromCache: false };
  }
}

/**
 * Search recipes by ingredients with caching
 */
export async function searchRecipesByIngredientsWithCache(
  ingredients: string[]
): Promise<{ recipes: Recipe[]; fromCache: boolean }> {
  await connectToDatabase();
  
  const cacheKey = generateIngredientSearchCacheKey(ingredients);
  
  // Check cache
  const cachedResult = await SpoonacularIngredientSearchCache.findOne({ cacheKey });
  
  if (cachedResult && cachedResult.expiresAt > new Date()) {
    console.log(`✅ Cache HIT for ingredient search: ${ingredients.join(', ')}`);
    await SpoonacularIngredientSearchCache.findByIdAndUpdate(cachedResult._id, {
      $inc: { requestCount: 1 },
      $set: { lastAccessed: new Date() }
    });
    
    // Convert cached results to Recipe format using the correct type
    const recipes: Recipe[] = cachedResult.data.slice(0, 6).map((item: SpoonacularFoundRecipe) => (
      transformFoundRecipeToRecipe(item)
    ));
    
    return { recipes, fromCache: true };
  }
  
  // Check quota and make API call
  const quotaStatus = await checkQuotaAllowance();
  if (!quotaStatus.allowed) {
    const staleCache = await SpoonacularIngredientSearchCache.findOne({ cacheKey });
    if (staleCache) {
      console.log(`🔄 Serving stale ingredient search cache`);
      const recipes: Recipe[] = staleCache.data.slice(0, 6).map((item: SpoonacularFoundRecipe) => (
        transformFoundRecipeToRecipe(item)
      ));
      return { recipes, fromCache: true };
    }
    return { recipes: [], fromCache: false };
  }
  
  try {
    console.log(`🌐 API CALL for ingredient search: ${ingredients.join(', ')}`);
    const apiResult = await fetchRecipesByIngredients(ingredients);
    
    await recordApiUsage('findByIngredients');
    
    // Cache results
    const cacheData = {
      cacheKey,
      ingredients,
      data: apiResult, // Cache the raw "found" recipes array
      expiresAt: new Date(Date.now() + CACHE_CONFIG.INGREDIENT_SEARCH_TTL)
    };
    
    await SpoonacularIngredientSearchCache.findOneAndUpdate(
      { cacheKey },
      cacheData,
      { upsert: true, new: true }
    );
    
    console.log(`💾 Cached ingredient search: ${ingredients.join(', ')}`);
    
    const recipes = apiResult.map(item => transformFoundRecipeToRecipe(item));
    return { recipes, fromCache: false };
    
  } catch (error) {
    console.error('Ingredient search API call failed:', error);
    return { recipes: [], fromCache: false };
  }
}

/**
 * Get popular recipes with caching
 */
export async function getPopularRecipesWithCache(
  options: Record<string, unknown> = {}
): Promise<{ recipes: Recipe[]; fromCache: boolean }> {
  await connectToDatabase();
  
  const tags: string[] = Array.isArray(options.tags) ? options.tags : [];
  const number = typeof options.number === 'number' ? options.number : 10;
  const cacheKey = generateRandomCacheKey(tags, number);
  
  // Check cache
  const cachedResult = await SpoonacularRandomCache.findOne({ cacheKey });
  
  if (cachedResult && cachedResult.expiresAt > new Date()) {
    console.log(`✅ Cache HIT for popular recipes`);
    await SpoonacularRandomCache.findByIdAndUpdate(cachedResult._id, {
      $inc: { requestCount: 1 },
      $set: { lastAccessed: new Date() }
    });
    // Ensure all cached recipes have a description field
    const recipesWithDescription = (cachedResult.data.recipes || []).map((r: unknown) => {
      const recipe = typeof r === 'object' && r !== null ? r as Record<string, unknown> : {};
      return {
        ...recipe,
        description: (recipe.description as string) || (recipe.summary as string) || ''
      } as Recipe;
    });
    return { recipes: recipesWithDescription, fromCache: true };
  }
  
  // Check quota and make API call
  const quotaStatus = await checkQuotaAllowance();
  if (!quotaStatus.allowed) {
    const staleCache = await SpoonacularRandomCache.findOne({ cacheKey });
    if (staleCache) {
      console.log(`🔄 Serving stale popular recipes cache`);
      const recipesWithDescription = (staleCache.data.recipes || []).map((r: unknown) => {
        const recipe = typeof r === 'object' && r !== null ? r as Record<string, unknown> : {};
        return {
          ...recipe,
          description: (recipe.description as string) || (recipe.summary as string) || ''
        } as Recipe;
      });
      return { recipes: recipesWithDescription, fromCache: true };
    }
    return { recipes: [], fromCache: false };
  }
  
  try {
    console.log(`🌐 API CALL for popular recipes`);
  const apiRecipes = await fetchPopularRecipes();
    
    await recordApiUsage('random');
    
    // Cache results
    const cacheData = {
      cacheKey,
      tags,
      number,
      data: { recipes: apiRecipes.recipes },
      expiresAt: new Date(Date.now() + CACHE_CONFIG.RANDOM_TTL)
    };
    await SpoonacularRandomCache.findOneAndUpdate(
      { cacheKey },
      cacheData,
      { upsert: true, new: true }
    );
    console.log(`💾 Cached popular recipes`);
    // Ensure all returned recipes have a description field
    const recipesWithDescription = (apiRecipes.recipes || []).map((r: unknown) => {
      const recipe = typeof r === 'object' && r !== null ? r as Record<string, unknown> : {};
      return {
        ...recipe,
        description: (recipe.description as string) || (recipe.summary as string) || ''
      } as Recipe;
    });
    return { recipes: recipesWithDescription, fromCache: false };
    
  } catch (error) {
    console.error('Popular recipes API call failed:', error);
    return { recipes: [], fromCache: false };
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<CacheStats> {
  await connectToDatabase();
  
  const [
    recipeCount,
    searchCount,
    ingredientSearchCount,
    randomCount,
    quotaTracker
  ] = await Promise.all([
    SpoonacularRecipeCache.countDocuments(),
    SpoonacularSearchCache.countDocuments(),
    SpoonacularIngredientSearchCache.countDocuments(),
    SpoonacularRandomCache.countDocuments(),
    SpoonacularQuotaTracker.findOne({ date: getTodayString() })
  ]);
  
  const now = new Date();
  const [
    expiredRecipes,
    expiredSearches,
    expiredIngredientSearches,
    expiredRandom
  ] = await Promise.all([
      SpoonacularRecipeCache.countDocuments({ expiresAt: { $lt: now } }),
      SpoonacularSearchCache.countDocuments({ expiresAt: { $lt: now } }),
      SpoonacularIngredientSearchCache.countDocuments({ expiresAt: { $lt: now } }),
      SpoonacularRandomCache.countDocuments({ expiresAt: { $lt: now } })
  ]);

  const totalEntries = recipeCount + searchCount + ingredientSearchCount + randomCount;
  const totalExpired = expiredRecipes + expiredSearches + expiredIngredientSearches + expiredRandom;

  return {
    totalEntries,
    totalExpired,
    cacheDetails: [
      { name: 'Recipes', count: recipeCount, expired: expiredRecipes },
      { name: 'Searches', count: searchCount, expired: expiredSearches },
      { name: 'Ingredient Searches', count: ingredientSearchCount, expired: expiredIngredientSearches },
      { name: 'Popular Recipes', count: randomCount, expired: expiredRandom }
    ],
    quota: {
      used: quotaTracker?.requestCount || 0,
      limit: quotaTracker?.quotaLimit || CACHE_CONFIG.DAILY_QUOTA_LIMIT,
      remaining: Math.max(0, (quotaTracker?.quotaLimit || CACHE_CONFIG.DAILY_QUOTA_LIMIT) - (quotaTracker?.requestCount || 0))
    }
  };
}

/**
 * Get quota status
 */
export async function getQuotaStatus(): Promise<QuotaStatus> {
  await connectToDatabase();
  
  const quotaTracker = await SpoonacularQuotaTracker.findOne({ date: getTodayString() });
  
  return {
    date: getTodayString(),
    used: quotaTracker?.requestCount || 0,
    limit: quotaTracker?.quotaLimit || CACHE_CONFIG.DAILY_QUOTA_LIMIT,
    remaining: Math.max(0, (quotaTracker?.quotaLimit || CACHE_CONFIG.DAILY_QUOTA_LIMIT) - (quotaTracker?.requestCount || 0)),
    canMakeRequests: Math.max(0, (quotaTracker?.quotaLimit || CACHE_CONFIG.DAILY_QUOTA_LIMIT) - (quotaTracker?.requestCount || 0)) > CACHE_CONFIG.QUOTA_BUFFER,
    endpoints: quotaTracker?.endpoints || {}
  };
}

/**
 * Clear expired cache entries
 */
export async function clearExpiredCache(): Promise<void> {
  await connectToDatabase();
  
  const now = new Date();
  
  const [
      recipeResult,
      searchResult,
      ingredientResult,
      randomResult,
      nutritionResult
  ] = await Promise.all([
    SpoonacularRecipeCache.deleteMany({ expiresAt: { $lt: now } }),
    SpoonacularSearchCache.deleteMany({ expiresAt: { $lt: now } }),
    SpoonacularIngredientSearchCache.deleteMany({ expiresAt: { $lt: now } }),
    SpoonacularRandomCache.deleteMany({ expiresAt: { $lt: now } }),
    SpoonacularNutritionCache.deleteMany({ expiresAt: { $lt: now } })
  ]);
  
  console.log('🧹 Cleared expired cache entries:');
  console.log(`- Recipes: ${recipeResult.deletedCount}`);
  console.log(`- Searches: ${searchResult.deletedCount}`);
  console.log(`- Ingredient Searches: ${ingredientResult.deletedCount}`);
  console.log(`- Random Recipes: ${randomResult.deletedCount}`);
  console.log(`- Nutrition Data: ${nutritionResult.deletedCount}`);
}

/**
 * Import cached recipes from JSON file to MongoDB
 */
export async function importCachedRecipesToDB(): Promise<{ imported: number; skipped: number; errors: number }> {
  await connectToDatabase();
  
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  
  try {
    // Read the cached recipes JSON file
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const jsonPath = path.join(process.cwd(), 'public', 'cached-recipes.json');
    const jsonData = await fs.readFile(jsonPath, 'utf-8');
    const parsedData = JSON.parse(jsonData);
    const cachedRecipes = parsedData.recipes || parsedData; // Handle both {recipes: [...]} and [...] formats
    
    console.log(`📥 Found ${cachedRecipes.length} recipes in cached file`);
    
    for (const recipe of cachedRecipes) {
      try {
        // Create cache entry directly (skip duplicate check for performance)
        const cacheEntry = new SpoonacularRecipeCache({
          spoonacularId: recipe.id,
          cacheKey: `recipe:${recipe.id}`,
          data: recipe,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + CACHE_CONFIG.RECIPE_TTL)
        });
        
        try {
          await cacheEntry.save();
        } catch (saveError: unknown) {
          if (
            typeof saveError === 'object' && saveError !== null && 'code' in saveError && (saveError as { code?: number }).code === 11000
          ) {
            // Duplicate key error (recipe already exists)
            console.log(`⏩ Recipe ${recipe.id} (${recipe.title}) already cached, skipping`);
            skipped++;
            continue;
          } else {
            throw saveError;
          }
        }
        
        console.log(`✅ Imported recipe ${recipe.id} (${recipe.title})`);
        imported++;
        
      } catch (error) {
        console.error(`❌ Error importing recipe ${recipe.id}:`, error);
        errors++;
      }
    }
    
    // Note: No quota tracking needed for importing cached data
    
    console.log(`📊 Import Summary - Imported: ${imported}, Skipped: ${skipped}, Errors: ${errors}`);
    
  } catch (error) {
    console.error('❌ Error reading cached recipes file:', error);
    throw error;
  }
  
  return { imported, skipped, errors };
}

// Export functions for service integration
export { searchRecipesWithCache as searchRecipesInternal };
export { getRecipeWithCache as getRecipeInternal };
export { searchRecipesByIngredientsWithCache as searchRecipesByIngredientsInternal };
export { getPopularRecipesWithCache as getPopularRecipesInternal };

function transformFoundRecipeToRecipe(item: SpoonacularFoundRecipe): Recipe {
  // This function transforms the minimal data from a "find by ingredients" search
  // into a structure that matches our Recipe type as closely as possible.
  // Some fields will be missing or have default values.
  return {
    _id: `spoonacular-${item.id}`,
    title: item.title,
    image: item.image,
    description: `A recipe using some of your ingredients. More details available upon selection.`,
    summary: `A recipe using some of your ingredients. More details available upon selection.`,
    readyInMinutes: 0, // Not provided in this API call
    servings: 0, // Not provided
    extendedIngredients: [
      ...(item.usedIngredients || []),
      ...(item.missedIngredients || [])
    ].map(ing => ({
      id: ing.id,
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
    })),
    analyzedInstructions: [],
    cuisines: [],
    dishTypes: [],
    diets: [],
    isSpoonacular: true,
  } as Recipe;
}

/**
 * Get API quota status (internal implementation)
 */
export async function getQuotaStatusInternal(): Promise<QuotaStatus> {
  await connectToDatabase();
  
  const quotaTracker = await SpoonacularQuotaTracker.findOne({ date: getTodayString() });
  
  return {
    date: getTodayString(),
    used: quotaTracker?.requestCount || 0,
    limit: quotaTracker?.quotaLimit || CACHE_CONFIG.DAILY_QUOTA_LIMIT,
    remaining: Math.max(0, (quotaTracker?.quotaLimit || CACHE_CONFIG.DAILY_QUOTA_LIMIT) - (quotaTracker?.requestCount || 0)),
    canMakeRequests: Math.max(0, (quotaTracker?.quotaLimit || CACHE_CONFIG.DAILY_QUOTA_LIMIT) - (quotaTracker?.requestCount || 0)) > CACHE_CONFIG.QUOTA_BUFFER,
    endpoints: quotaTracker?.endpoints || {}
  };
}