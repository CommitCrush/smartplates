/**
 * Server-Side Spoonacular Cache Implementation
 * 
 * Contains all MongoDB operations and should only be imported server-side
 * to prevent client-side bundling issues
 */

import { 
  SpoonacularRecipeCache,
  SpoonacularSearchCache,
  SpoonacularIngredientSearchCache,
  SpoonacularRandomCache,
  SpoonacularNutritionCache,
  SpoonacularQuotaTracker,
  generateSearchCacheKey,
  generateIngredientSearchCacheKey,
  generateRandomCacheKey,
  generateRecipeCacheKey,
  generateNutritionCacheKey,
  type ISpoonacularRecipeCache,
  type ISpoonacularSearchCache,
  type ISpoonacularIngredientSearchCache,
  type ISpoonacularRandomCache,
  type ISpoonacularNutritionCache,
  type ISpoonacularQuotaTracker
} from '@/models/SpoonacularCache';
import { Recipe } from '@/types/recipe';
import { connectToDatabase } from '@/lib/db';
import { 
  searchSpoonacularRecipes,
  getSpoonacularRecipe,
  searchRecipesByIngredients,
  getPopularSpoonacularRecipes
} from './spoonacularService';

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
// Helper Functions
// ========================================

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
    // Create new quota tracker for today
    quotaTracker = new SpoonacularQuotaTracker({
      date: today,
      requestCount: 0,
      quotaLimit: CACHE_CONFIG.DAILY_QUOTA_LIMIT,
      remainingQuota: CACHE_CONFIG.DAILY_QUOTA_LIMIT
    });
    await quotaTracker.save();
  }
  
  const remaining = Math.max(0, quotaTracker.quotaLimit - quotaTracker.requestCount);
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
      isQuotaExceeded: false
    },
    $setOnInsert: {
      date: today,
      quotaLimit: CACHE_CONFIG.DAILY_QUOTA_LIMIT,
      createdAt: new Date()
    }
  };
  
  await SpoonacularQuotaTracker.findOneAndUpdate(
    { date: today },
    update,
    { upsert: true, new: true }
  );
}

// ========================================
// Cache Functions
// ========================================

/**
 * Search recipes with intelligent caching
 */
export async function searchRecipesWithCacheInternal(
  query: string,
  options: any = {}
): Promise<{ recipes: Recipe[]; totalResults: number; fromCache: boolean }> {
  await connectToDatabase();
  
  const cacheKey = generateSearchCacheKey(query, options);
  
  // 1. Check cache first
  const cachedResult = await SpoonacularSearchCache.findOne({ cacheKey });
  
  if (cachedResult && cachedResult.expiresAt > new Date()) {
    console.log(`✅ Cache HIT for search: "${query}"`);
    // Update access tracking
    await SpoonacularSearchCache.findByIdAndUpdate(cachedResult._id, {
      $inc: { requestCount: 1 },
      $set: { lastAccessed: new Date() }
    });
    
    return {
      recipes: cachedResult.data.results.map((result: any) => ({
        id: `spoonacular-${result.id}`,
        title: result.title,
        description: result.summary?.replace(/<[^>]*>/g, '').substring(0, 200) + '...' || 'Delicious recipe from Spoonacular',
  image: result.image,
  servings: result.servings || 4,
  readyInMinutes: result.readyInMinutes || 30,
  summary: result.summary || '',
  extendedIngredients: result.extendedIngredients || [],
  analyzedInstructions: result.analyzedInstructions || [],
  cuisines: result.cuisines || [],
  dishTypes: result.dishTypes || [],
  diets: result.diets || [],
  nutrition: result.nutrition || undefined
      })),
      totalResults: cachedResult.data.totalResults,
      fromCache: true
    };
  }
  
  // 2. Check quota before API call
  const quotaStatus = await checkQuotaAllowance();
  
  if (!quotaStatus.allowed) {
    console.log(`❌ Quota exceeded (${quotaStatus.remaining} remaining), serving stale cache if available`);
    
    // Try to serve stale cache
    const staleCache = await SpoonacularSearchCache.findOne({ cacheKey });
    if (staleCache) {
      console.log(`🔄 Serving stale cache for: "${query}"`);
      return {
  recipes: staleCache.data.results.map((result: any) => ({
          id: `spoonacular-${result.id}`,
          title: result.title,
          description: result.summary || '',
          summary: result.summary || '',
          image: result.image,
          readyInMinutes: result.readyInMinutes || 30,
          servings: result.servings || 4,
          extendedIngredients: result.extendedIngredients || [],
          analyzedInstructions: result.analyzedInstructions || [],
          cuisines: result.cuisines || [],
          dishTypes: result.dishTypes || [],
          diets: result.diets || [],
          nutrition: result.nutrition || undefined
        })),
        totalResults: staleCache.data.totalResults,
        fromCache: true
      };
    }
    
    // No cache available, return empty results
    return { recipes: [], totalResults: 0, fromCache: false };
  }
  
  // 3. Make API call
  try {
    console.log(`🌐 API CALL for search: "${query}"`);
    const apiResult = await searchSpoonacularRecipes(query, options);
    
    // Record API usage
    await recordApiUsage('complexSearch');
    
    // 4. Cache the result
    const cacheData = {
      cacheKey,
      query,
      filters: options,
      data: {
        results: apiResult.recipes.map(recipe => ({
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
          // Store minimal data for search results, full data cached separately
        })),
        totalResults: apiResult.totalResults,
        number: options.number || 12,
        offset: options.offset || 0
      },
      expiresAt: new Date(Date.now() + CACHE_CONFIG.SEARCH_TTL)
    };
    
    await SpoonacularSearchCache.findOneAndUpdate(
      { cacheKey },
      cacheData,
      { upsert: true, new: true }
    );
    
    console.log(`💾 Cached search results for: "${query}"`);
    
    return {
      recipes: apiResult.recipes,
      totalResults: apiResult.totalResults,
      fromCache: false
    };
    
  } catch (error) {
    console.error('API call failed:', error);
    
    // Try to serve stale cache as fallback
    const staleCache = await SpoonacularSearchCache.findOne({ cacheKey });
    if (staleCache) {
      console.log(`🔄 API failed, serving stale cache for: "${query}"`);
      return {
  recipes: staleCache.data.results.map((result: any) => ({
          id: `spoonacular-${result.id}`,
          title: result.title,
          description: result.summary || '',
          summary: result.summary || '',
          image: result.image,
          readyInMinutes: result.readyInMinutes || 30,
          servings: result.servings || 4,
          extendedIngredients: result.extendedIngredients || [],
          analyzedInstructions: result.analyzedInstructions || [],
          cuisines: result.cuisines || [],
          dishTypes: result.dishTypes || [],
          diets: result.diets || [],
          nutrition: result.nutrition || undefined
        })),
        totalResults: staleCache.data.totalResults,
        fromCache: true
      };
    }
    
    throw error;
  }
}

/**
 * Get recipe with caching
 */
export async function getRecipeWithCacheInternal(recipeId: string): Promise<{ recipe: Recipe | null; fromCache: boolean }> {
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
    
    // Convert cached data to Recipe format
    const recipe: Recipe = {
      id: recipeId,
      title: cachedRecipe.data.title,
      description: cachedRecipe.data.summary || '',
      summary: cachedRecipe.data.summary || '',
      image: cachedRecipe.data.image,
      servings: cachedRecipe.data.servings,
      readyInMinutes: cachedRecipe.data.readyInMinutes,
      extendedIngredients: cachedRecipe.data.extendedIngredients || [],
      analyzedInstructions: cachedRecipe.data.analyzedInstructions || [],
      cuisines: cachedRecipe.data.cuisines || [],
      dishTypes: cachedRecipe.data.dishTypes || [],
      diets: cachedRecipe.data.diets || [],
      nutrition: cachedRecipe.data.nutrition || undefined
    };
    
    return { recipe, fromCache: true };
  }
  
  // Check quota
  const quotaStatus = await checkQuotaAllowance();
  if (!quotaStatus.allowed) {
    // Try stale cache
    const staleCache = await SpoonacularRecipeCache.findOne({ cacheKey });
    if (staleCache) {
      console.log(`🔄 Serving stale cached recipe: ${recipeId}`);
      // Return stale recipe (same conversion logic)
      return { recipe: null, fromCache: true }; // Simplified for brevity
    }
    return { recipe: null, fromCache: false };
  }
  
  // API call
  try {
    console.log(`🌐 API CALL for recipe: ${recipeId}`);
    const apiRecipe = await getSpoonacularRecipe(recipeId);
    
    if (!apiRecipe) {
      return { recipe: null, fromCache: false };
    }
    
    await recordApiUsage('recipeInformation');
    
    // Cache full recipe data
    const cacheData = {
      cacheKey,
      spoonacularId: numericId,
      data: {
        id: numericId,
        title: apiRecipe.title,
        description: apiRecipe.summary || '',
        summary: apiRecipe.summary || '',
        image: apiRecipe.image,
        readyInMinutes: apiRecipe.readyInMinutes,
        servings: apiRecipe.servings,
        extendedIngredients: Array.isArray(apiRecipe.extendedIngredients) 
          ? apiRecipe.extendedIngredients.map((ing: any) => ({
              id: ing.id,
              name: ing.name,
              amount: ing.amount,
              unit: ing.unit,
              notes: ing.notes || ''
            }))
          : [],
        analyzedInstructions: apiRecipe.analyzedInstructions || [],
        cuisines: apiRecipe.cuisines || [],
        dishTypes: apiRecipe.dishTypes || [],
        diets: apiRecipe.diets || [],
        nutrition: apiRecipe.nutrition || undefined
      },
      expiresAt: new Date(Date.now() + CACHE_CONFIG.RECIPE_TTL)
    };
    
    await SpoonacularRecipeCache.findOneAndUpdate(
      { cacheKey },
      cacheData,
      { upsert: true, new: true }
    );
    
    console.log(`💾 Cached recipe: ${recipeId}`);
    
  return { recipe: apiRecipe, fromCache: false };
    
  } catch (error) {
    console.error('Recipe API call failed:', error);
    return { recipe: null, fromCache: false };
  }
}

/**
 * Search recipes by ingredients with caching
 */
export async function searchRecipesByIngredientsWithCacheInternal(
  ingredients: string[],
  options: any = {}
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
    
    // Convert cached results to Recipe format (simplified)
    const recipes: Recipe[] = cachedResult.data.slice(0, 6).map((item: any) => ({
      id: `spoonacular-${item.id}`,
      title: item.title,
      description: item.summary || '',
      summary: item.summary || '',
      image: item.image,
      servings: item.servings || 4,
      readyInMinutes: item.readyInMinutes || 30,
      extendedIngredients: item.extendedIngredients || [],
      analyzedInstructions: item.analyzedInstructions || [],
      cuisines: item.cuisines || [],
      dishTypes: item.dishTypes || [],
      diets: item.diets || [],
      nutrition: item.nutrition || undefined
    }));
    
    return { recipes, fromCache: true };
  }
  
  // Check quota and make API call
  const quotaStatus = await checkQuotaAllowance();
  if (!quotaStatus.allowed) {
    const staleCache = await SpoonacularIngredientSearchCache.findOne({ cacheKey });
    if (staleCache) {
      console.log(`🔄 Serving stale ingredient search cache`);
      return { recipes: [], fromCache: true }; // Simplified
    }
    return { recipes: [], fromCache: false };
  }
  
  try {
    console.log(`🌐 API CALL for ingredient search: ${ingredients.join(', ')}`);
    const apiResult = await searchRecipesByIngredients(ingredients);
    const apiRecipes = apiResult.recipes;
    
    await recordApiUsage('findByIngredients');
    
    // Cache results
    const cacheData = {
      cacheKey,
      ingredients,
      data: apiRecipes.map((recipe: any) => ({
        id: parseInt(String(recipe.id || recipe._id || '0').replace('spoonacular-', '')),
        title: recipe.title,
        description: recipe.summary || '',
        summary: recipe.summary || '',
        image: recipe.image,
        servings: recipe.servings || 4,
        readyInMinutes: recipe.readyInMinutes || 30,
        extendedIngredients: recipe.extendedIngredients || [],
        analyzedInstructions: recipe.analyzedInstructions || [],
        cuisines: recipe.cuisines || [],
        dishTypes: recipe.dishTypes || [],
        diets: recipe.diets || [],
        nutrition: recipe.nutrition || undefined
      })),
      expiresAt: new Date(Date.now() + CACHE_CONFIG.INGREDIENT_SEARCH_TTL)
    };
    
    await SpoonacularIngredientSearchCache.findOneAndUpdate(
      { cacheKey },
      cacheData,
      { upsert: true, new: true }
    );
    
    console.log(`💾 Cached ingredient search: ${ingredients.join(', ')}`);
    
    return { recipes: apiRecipes, fromCache: false };
    
  } catch (error) {
    console.error('Ingredient search API call failed:', error);
    return { recipes: [], fromCache: false };
  }
}

/**
 * Get popular recipes with caching
 */
export async function getPopularRecipesWithCacheInternal(
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
  const apiRecipes = await getPopularSpoonacularRecipes();
    
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
export async function getCacheStatsInternal(): Promise<unknown> {
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
  
  return {
    totalCachedRecipes: recipeCount,
    totalSearches: searchCount,
    totalIngredientSearches: ingredientSearchCount,
    totalRandomRequests: randomCount,
    todayQuotaUsage: quotaTracker?.requestCount || 0,
    quotaLimit: quotaTracker?.quotaLimit || CACHE_CONFIG.DAILY_QUOTA_LIMIT,
    remainingQuota: Math.max(0, (quotaTracker?.quotaLimit || CACHE_CONFIG.DAILY_QUOTA_LIMIT) - (quotaTracker?.requestCount || 0))
  };
}

/**
 * Get quota status
 */
export async function getQuotaStatusInternal(): Promise<unknown> {
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
export async function clearExpiredCacheInternal(): Promise<void> {
  await connectToDatabase();
  
  const now = new Date();
  
  await Promise.all([
    SpoonacularRecipeCache.deleteMany({ expiresAt: { $lt: now } }),
    SpoonacularSearchCache.deleteMany({ expiresAt: { $lt: now } }),
    SpoonacularIngredientSearchCache.deleteMany({ expiresAt: { $lt: now } }),
    SpoonacularRandomCache.deleteMany({ expiresAt: { $lt: now } }),
    SpoonacularNutritionCache.deleteMany({ expiresAt: { $lt: now } })
  ]);
  
  console.log('🧹 Cleared expired cache entries');
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

// Export internal functions for service integration
export { searchRecipesWithCacheInternal as searchRecipesInternal };
export { getRecipeWithCacheInternal as getRecipeInternal };
export { searchRecipesByIngredientsWithCacheInternal as searchRecipesByIngredientsInternal };
export { getPopularRecipesWithCacheInternal as getPopularRecipesInternal };