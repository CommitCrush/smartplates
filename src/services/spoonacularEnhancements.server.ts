/**
 * Spoonacular API Enhancements
 * 
 * Additional features and optimizations for the Spoonacular integration:
 * - Batch processing for better performance
 * - Retry logic with exponential backoff
 * - Performance monitoring and analytics
 * - Advanced caching strategies
 */

import { connectToDatabase } from '@/lib/db';
import { SpoonacularRecipeCache, SpoonacularQuotaTracker } from '@/models/SpoonacularCache';
import { searchRecipesWithCache } from './spoonacularCacheService.server';
import { getSpoonacularRecipe } from './spoonacularService';
import RecipeModel, { IRecipe } from '@/models/Recipe';
import { Recipe as RecipeType, RecipeIngredient, RecipeInstructionBlock } from '@/types/recipe';

// ========================================
// Performance Monitoring
// ========================================

class PerformanceMonitor {
  private records: Array<{
    operation: string;
    duration: number;
    success: boolean;
    timestamp: number;
    metadata?: Record<string, unknown>;
  }> = [];

  startTimer(operation: string) {
    const start = performance.now();
    return {
      end: (success: boolean, metadata?: Record<string, unknown>) => {
        const duration = performance.now() - start;
        this.records.push({ operation, duration, success, timestamp: Date.now(), metadata });
      },
    };
  }

  getStats() {
    const totalRequests = this.records.length;
    if (totalRequests === 0) {
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        avgDuration: 0,
        successRate: 0,
        cacheHitRate: 0,
      };
    }

    const successfulRequests = this.records.filter(r => r.success).length;
    const totalDuration = this.records.reduce((sum, r) => sum + r.duration, 0);
    
    const cacheHits = this.records.filter(r => r.operation.startsWith('cache:') && r.success).length;
    const cacheChecks = this.records.filter(r => r.operation.startsWith('cache:')).length;

    return {
      totalRequests,
      successfulRequests,
      failedRequests: totalRequests - successfulRequests,
      avgDuration: totalDuration / totalRequests,
      successRate: (successfulRequests / totalRequests) * 100,
      cacheHitRate: cacheChecks > 0 ? (cacheHits / cacheChecks) * 100 : 0,
    };
  }

  clearOldMetrics(maxAgeMs = 60 * 60 * 1000) { // 1 hour
    const cutoff = Date.now() - maxAgeMs;
    this.records = this.records.filter(r => r.timestamp > cutoff);
  }
}

export const performanceMonitor = new PerformanceMonitor();

// ========================================
// Configuration
// ========================================

const ENHANCEMENT_CONFIG = {
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_BASE: 1000, // 1 second
  BATCH_SIZE: 10,
  POPULAR_SEARCHES: ['chicken', 'pasta', 'salad', 'vegan', 'dessert'],
  PERFORMANCE_THRESHOLD: 1500, // 1.5 seconds
};

// ========================================
// Local Spoonacular Type Definitions
// ========================================

export interface SpoonacularApiRecipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  servings: number;
  readyInMinutes: number;
  sourceUrl: string;
  sourceName: string;
  creditsText: string;
  instructions: string;
  summary: string;
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
  veryHealthy: boolean;
  cheap: boolean;
  veryPopular: boolean;
  sustainable: boolean;
  lowFodmap: boolean;
  weightWatcherSmartPoints: number;
  gaps: string;
  preparationMinutes: number;
  cookingMinutes: number;
  aggregateLikes: number;
  healthScore: number;
  pricePerServing: number;
  occasions: string[];
  diets: string[];
  cuisines: string[];
  dishTypes: string[];
  extendedIngredients: SpoonacularIngredient[];
  analyzedInstructions: SpoonacularInstruction[];
  nutrition?: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
}

export interface SpoonacularIngredient {
  id: number;
  aisle: string;
  image: string;
  consistency: string;
  name: string;
  nameClean: string;
  original: string;
  originalName: string;
  amount: number;
  unit: string;
  meta: string[];
  measures: {
    us: {
      amount: number;
      unitShort: string;
      unitLong: string;
    };
    metric: {
      amount: number;
      unitShort: string;
      unitLong: string;
    };
  };
}

export interface SpoonacularInstruction {
  name: string;
  steps: SpoonacularStep[];
}

export interface SpoonacularStep {
  number: number;
  step: string;
  ingredients: { id: number; name: string; localizedName: string; image: string }[];
  equipment: { id: number; name: string; localizedName: string; image: string }[];
}

export interface SpoonacularFoundRecipe {
  id: number;
  title: string;
  image: string;
  imageType?: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
  missedIngredients: SpoonacularIngredient[];
  usedIngredients: SpoonacularIngredient[];
  unusedIngredients: SpoonacularIngredient[];
  likes: number;
}

/**
 * Represents the structure of a recipe as returned from a Spoonacular search.
 * This is a summary and differs from the full SpoonacularApiRecipe.
 */
export interface SpoonacularSearchResultRecipe {
  id: number;
  title: string;
  image: string;
  servings: number;
  readyInMinutes: number;
  sourceUrl: string;
  summary?: string;
  extendedIngredients?: SpoonacularIngredient[];
  analyzedInstructions?: unknown[];
  nutrition?: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
}

/**
 * ========================================
 * Batch Processing & Retry Logic
 * ========================================
 */

// ========================================
// Retry Logic with Exponential Backoff
// ========================================

export async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxAttempts: number = ENHANCEMENT_CONFIG.RETRY_ATTEMPTS
): Promise<T> {
  const timer = performanceMonitor.startTimer(`retry:${operationName}`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await operation();
      timer.end(true);
      return result;
    } catch (error) {
      console.log(`🔄 Attempt ${attempt}/${maxAttempts} failed for ${operationName}:`, error);
      
      if (attempt === maxAttempts) {
        timer.end(false, { errorType: error instanceof Error ? error.name : 'unknown' });
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s, etc.
      const delay = ENHANCEMENT_CONFIG.RETRY_DELAY_BASE * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error(`All ${maxAttempts} attempts failed for ${operationName}`);
}

// ========================================
// Batch Processing
// ========================================

export async function batchProcessRecipes<T>(
  items: T[],
  processor: (batch: T[]) => Promise<void>,
  batchSize: number = ENHANCEMENT_CONFIG.BATCH_SIZE
): Promise<{ processed: number; errors: number }> {
  const timer = performanceMonitor.startTimer('batch_process');
  
  let processed = 0;
  let errors = 0;
  
  try {
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      try {
        await processor(batch);
        processed += batch.length;
        console.log(`✅ Processed batch ${Math.ceil((i + 1) / batchSize)}/${Math.ceil(items.length / batchSize)}`);
      } catch (error) {
        console.error(`❌ Batch processing error:`, error);
        errors += batch.length;
      }
      
      // Small delay between batches to prevent overwhelming the API
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    timer.end(true);
    return { processed, errors };
  } catch (error) {
    timer.end(false);
    throw error;
  }
}

// ========================================
// Cache Warming Strategies
// ========================================

export async function warmupPopularRecipesCache(): Promise<{ warmed: number; errors: number }> {
  console.log('🔥 Starting cache warmup for popular recipes...');
  const timer = performanceMonitor.startTimer('cache_warmup');
  
  let warmed = 0;
  let errors = 0;
  
  try {
    for (const searchTerm of ENHANCEMENT_CONFIG.POPULAR_SEARCHES) {
      try {
        const result = await withRetry(
          () => searchRecipesWithCache(searchTerm, { limit: 5 }),
          `warmup:${searchTerm}`
        );
        
        if (result.fromCache) {
          console.log(`✅ ${searchTerm} - already cached`);
        } else {
          console.log(`🔥 ${searchTerm} - ${result.recipes.length} recipes cached`);
          warmed += result.recipes.length;
        }
      } catch (error) {
        console.error(`❌ Failed to warm up cache for "${searchTerm}":`, error);
        errors++;
      }
    }
    
    timer.end(true);
    console.log(`🔥 Cache warmup completed: ${warmed} recipes warmed, ${errors} errors`);
    return { warmed, errors };
  } catch (error) {
    timer.end(false);
    throw error;
  }
}

// ========================================
// Advanced Caching Analytics
// ========================================

export async function getCacheAnalytics(): Promise<{
  totalCachedRecipes: number;
  cacheHitRate: number;
  avgResponseTime: number;
  quotaUsage: {
    today: number;
    remaining: number;
    percentage: number;
  };
  oldestCacheEntry: Date | null;
  newestCacheEntry: Date | null;
  topSearchTerms: Array<{ term: string; count: number }>;
}> {
  await connectToDatabase();
  
  try {
    // Get total cached recipes count
    const totalCachedRecipes = await SpoonacularRecipeCache.countDocuments();
    
    // Get performance metrics
    const performanceStats = performanceMonitor.getStats();
    
    // Get quota usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const quotaTracker = await SpoonacularQuotaTracker.findOne({
      date: { $gte: today }
    });
    
    const quotaUsed = quotaTracker?.requestCount || 0;
    const quotaLimit = 150; // Spoonacular free tier
    
    // Get cache age info
    const [oldest, newest] = await Promise.all([
      SpoonacularRecipeCache.findOne({}, {}, { sort: { createdAt: 1 } }),
      SpoonacularRecipeCache.findOne({}, {}, { sort: { createdAt: -1 } })
    ]);
    
    return {
      totalCachedRecipes,
      cacheHitRate: performanceStats.cacheHitRate || 0,
      avgResponseTime: performanceStats.avgDuration,
      quotaUsage: {
        today: quotaUsed,
        remaining: Math.max(0, quotaLimit - quotaUsed),
        percentage: Math.round((quotaUsed / quotaLimit) * 100)
      },
      oldestCacheEntry: oldest?.createdAt || null,
      newestCacheEntry: newest?.createdAt || null,
      topSearchTerms: [] // Could be enhanced with search tracking
    };
  } catch (error) {
    console.error('Failed to get cache analytics:', error);
    throw error;
  }
}

// ========================================
// Cache Optimization
// ========================================

export async function optimizeCache(): Promise<{
  cleaned: number;
  errors: number;
  spaceSaved: string;
}> {
  console.log('🧹 Starting cache optimization...');
  await connectToDatabase();
  
  let cleaned = 0;
  let errors = 0;
  let spaceSaved = 0;
  
  try {
    // Remove expired cache entries
    const expiredCount = await SpoonacularRecipeCache.countDocuments({
      expiresAt: { $lt: new Date() }
    });
    
    if (expiredCount > 0) {
      const result = await SpoonacularRecipeCache.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      cleaned += result.deletedCount || 0;
      spaceSaved += expiredCount * 5000; // Rough estimate: 5KB per recipe
    }
    
    // Remove duplicate entries (keep the most recent)
    const duplicates = await SpoonacularRecipeCache.aggregate([
      { $group: { _id: '$spoonacularId', count: { $sum: 1 }, docs: { $push: '$_id' } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    
    for (const duplicate of duplicates) {
      try {
        // Keep the first (newest) document, remove the rest
        const toDelete = duplicate.docs.slice(1);
        const result = await SpoonacularRecipeCache.deleteMany({
          _id: { $in: toDelete }
        });
        cleaned += result.deletedCount || 0;
      } catch (error) {
        console.error('Error removing duplicates:', error);
        errors++;
      }
    }
    
    console.log(`🧹 Cache optimization completed: ${cleaned} entries cleaned`);
    return {
      cleaned,
      errors,
      spaceSaved: `${Math.round(spaceSaved / 1024)}KB`
    };
  } catch (error) {
    console.error('Cache optimization failed:', error);
    throw error;
  }
}

// ========================================
// Health Check
// ========================================

export async function performHealthCheck(): Promise<{
  status: 'healthy' | 'warning' | 'error';
  checks: {
    database: boolean;
    cache: boolean;
    quota: boolean;
    performance: boolean;
  };
  details: {
    dbConnection: boolean;
    cacheSize: number;
    quotaRemaining: number;
    avgResponseTime: number;
  };
}> {
  const checks = {
    database: false,
    cache: false,
    quota: false,
    performance: false
  };
  
  const details = {
    dbConnection: false,
    cacheSize: 0,
    quotaRemaining: 0,
    avgResponseTime: 0
  };
  
  try {
    // Check database connection
    await connectToDatabase();
    checks.database = true;
    details.dbConnection = true;
    
    // Check cache
    const cacheCount = await SpoonacularRecipeCache.countDocuments();
    details.cacheSize = cacheCount;
    checks.cache = cacheCount > 0;
    
    // Check quota
    const analytics = await getCacheAnalytics();
    details.quotaRemaining = analytics.quotaUsage.remaining;
    checks.quota = analytics.quotaUsage.remaining > 10;
    
    // Check performance
    details.avgResponseTime = analytics.avgResponseTime;
    checks.performance = analytics.avgResponseTime < ENHANCEMENT_CONFIG.PERFORMANCE_THRESHOLD;
    
    const allHealthy = Object.values(checks).every(check => check);
    const hasWarnings = checks.database && checks.cache && (!checks.quota || !checks.performance);
    
    return {
      status: allHealthy ? 'healthy' : hasWarnings ? 'warning' : 'error',
      checks,
      details
    };
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      status: 'error',
      checks,
      details
    };
  }
}

// ========================================
// Cleanup Tasks
// ========================================

// Clear old performance metrics every hour
setInterval(() => {
  performanceMonitor.clearOldMetrics();
}, 60 * 60 * 1000);

// ========================================
// Recipe Fetching and Saving
// ========================================

/**
 * Fetches a recipe from Spoonacular by its ID, transforms it into the local Recipe format,
 * and saves it to the 'recipes' collection in the database.
 *
 * @param spoonacularId The ID of the recipe from the Spoonacular API.
 * @returns The saved recipe document from the database, or null if not found.
 */
export async function fetchAndSaveRecipe(spoonacularId: number): Promise<RecipeType | null> {
  await connectToDatabase();

  // 1. Fetch recipe from Spoonacular API
  console.log(`🌐 Fetching recipe ${spoonacularId} from Spoonacular...`);
  const apiRecipe = (await getSpoonacularRecipe(
    String(spoonacularId)
  )) as SpoonacularApiRecipe | null;

  if (!apiRecipe) {
    console.error(`❌ Recipe with ID ${spoonacularId} not found via Spoonacular API.`);
    return null;
  }

  // 2. Transform the API data into our Recipe schema
  const recipeData: Partial<IRecipe> = {
    spoonacularId: apiRecipe.id,
    title: apiRecipe.title,
    summary: apiRecipe.summary,
    image: apiRecipe.image,
    servings: apiRecipe.servings,
    readyInMinutes: apiRecipe.readyInMinutes,
    sourceUrl: apiRecipe.sourceUrl,
    
    extendedIngredients: (apiRecipe.extendedIngredients || []).map(
      (ing): RecipeIngredient => ({
        id: ing.id,
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        notes: ing.original || '',
      })
    ),
    
    analyzedInstructions: (apiRecipe.analyzedInstructions || []).map(
      (instruction): RecipeInstructionBlock => ({
        name: instruction.name,
        steps: (instruction.steps || []).map((step) => ({
          number: step.number,
          step: step.step,
        })),
      })
    ),
    
    vegetarian: apiRecipe.vegetarian,
    vegan: apiRecipe.vegan,
    glutenFree: apiRecipe.glutenFree,
    dairyFree: apiRecipe.dairyFree,
    veryHealthy: apiRecipe.veryHealthy,
    
    cuisines: apiRecipe.cuisines,
    dishTypes: apiRecipe.dishTypes,
    diets: apiRecipe.diets,
    occasions: apiRecipe.occasions,
    description: apiRecipe.summary, // Using summary as description
  };

  // 3. Save to the database
  // Use findOneAndUpdate with upsert to avoid duplicates and update existing ones.
  try {
    const savedRecipe = await RecipeModel.findOneAndUpdate(
      { spoonacularId: apiRecipe.id }, // Condition to find the recipe
      { $set: recipeData },            // Data to update or insert
      { 
        upsert: true,                  // Create if it doesn't exist
        new: true,                     // Return the new/updated document
        setDefaultsOnInsert: true      // Apply schema defaults on creation
      }
    );

    if (!savedRecipe) {
      console.error(`❌ Error saving recipe ${apiRecipe.id} to database: returned null`);
      return null;
    }

    console.log(`💾 Successfully saved recipe "${savedRecipe.title}" (ID: ${savedRecipe.spoonacularId}) to the database.`);
    
    const recipeObject = savedRecipe.toObject();
    
    // Convert the ObjectId to a string for the _id field
    return {
      ...recipeObject,
      _id: recipeObject._id.toString(),
    };

  } catch (error) {
    console.error(`❌ Error saving recipe ${apiRecipe.id} to database:`, error);
    throw error;
  }
}