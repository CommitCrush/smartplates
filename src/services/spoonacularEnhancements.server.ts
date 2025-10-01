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
import { searchRecipesWithCacheInternal } from './spoonacularCacheService.server';

// ========================================
// Enhanced Configuration
// ========================================

const ENHANCEMENT_CONFIG = {
  BATCH_SIZE: 10,                    // Process recipes in batches
  RETRY_ATTEMPTS: 3,                 // Number of retry attempts
  RETRY_DELAY_BASE: 1000,           // Base delay for exponential backoff (ms)
  PERFORMANCE_THRESHOLD: 2000,       // Log slow operations (ms)
  CACHE_WARMUP_LIMIT: 50,           // Number of popular recipes to cache
  
  // Popular search terms to pre-cache
  POPULAR_SEARCHES: [
    'chicken recipes',
    'vegetarian meals',
    'quick dinner',
    'healthy breakfast',
    'pasta dishes',
    'desserts',
    'salad recipes',
    'soup recipes'
  ]
};

// ========================================
// Performance Monitoring
// ========================================

interface PerformanceMetrics {
  operation: string;
  duration: number;
  success: boolean;
  cacheHit?: boolean;
  errorType?: string;
  timestamp: Date;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  
  startTimer(operation: string) {
    const startTime = Date.now();
    return {
      operation,
      startTime,
      end: (success: boolean, extra?: { cacheHit?: boolean; errorType?: string }) => {
        const duration = Date.now() - startTime;
        const metric: PerformanceMetrics = {
          operation,
          duration,
          success,
          timestamp: new Date(),
          ...extra
        };
        
        this.metrics.push(metric);
        
        // Log slow operations
        if (duration > ENHANCEMENT_CONFIG.PERFORMANCE_THRESHOLD) {
          console.warn(`🐌 Slow operation detected: ${operation} took ${duration}ms`);
        }
        
        return metric;
      }
    };
  }
  
  getStats(operation?: string): {
    avgDuration: number;
    successRate: number;
    cacheHitRate?: number;
    totalOperations: number;
  } {
    const filteredMetrics = operation 
      ? this.metrics.filter(m => m.operation === operation)
      : this.metrics;
    
    if (filteredMetrics.length === 0) {
      return { avgDuration: 0, successRate: 0, totalOperations: 0 };
    }
    
    const totalDuration = filteredMetrics.reduce((sum, m) => sum + m.duration, 0);
    const successCount = filteredMetrics.filter(m => m.success).length;
    const cacheHits = filteredMetrics.filter(m => m.cacheHit === true).length;
    const cacheRequests = filteredMetrics.filter(m => m.cacheHit !== undefined).length;
    
    return {
      avgDuration: Math.round(totalDuration / filteredMetrics.length),
      successRate: Math.round((successCount / filteredMetrics.length) * 100),
      cacheHitRate: cacheRequests > 0 ? Math.round((cacheHits / cacheRequests) * 100) : undefined,
      totalOperations: filteredMetrics.length
    };
  }
  
  clearOldMetrics() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
  }
}

export const performanceMonitor = new PerformanceMonitor();

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
          () => searchRecipesWithCacheInternal(searchTerm, { limit: 5 }),
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