/**
 * Performance Optimization Service
 * 
 * Professional system for caching, database optimization,
 * error handling, and basic analytics
 */

import clientPromise from '@/lib/db';
import { ObjectId } from 'mongodb';

export interface CacheEntry {
  _id?: string;
  key: string;
  data: any;
  ttl: number; // Time to live in seconds
  createdAt: Date;
  expiresAt: Date;
  category: 'recipe' | 'user' | 'search' | 'api' | 'general';
  size?: number; // Estimated size in bytes
  hits: number;
  lastAccessed: Date;
}

export interface PerformanceMetrics {
  _id?: string;
  userId?: string;
  sessionId: string;
  
  // Page performance
  pageUrl: string;
  loadTime: number; // milliseconds
  renderTime: number;
  interactionTime: number;
  
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  
  // Custom metrics
  searchTime?: number;
  recipeLoadTime?: number;
  imageLoadTime?: number;
  
  // User context
  userAgent: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  connectionType?: string;
  
  // Error tracking
  errors?: PerformanceError[];
  
  timestamp: Date;
}

export interface PerformanceError {
  id: string;
  type: 'javascript' | 'network' | 'api' | 'database';
  message: string;
  stack?: string;
  url?: string;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  timestamp: Date;
}

export interface DatabaseOptimization {
  collectionName: string;
  indexName: string;
  indexDefinition: any;
  estimatedImprovement: string;
  implemented: boolean;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  categoryBreakdown: Record<string, number>;
  oldestEntry: Date;
  newestEntry: Date;
}

export class PerformanceOptimizationService {
  private static CACHE_COLLECTION = 'performanceCache';
  private static METRICS_COLLECTION = 'performanceMetrics';
  private static ERRORS_COLLECTION = 'performanceErrors';
  private static DEFAULT_TTL = 3600; // 1 hour

  /**
   * Cache Management
   */
  
  /**
   * Set cache entry
   */
  static async setCache(
    key: string,
    data: any,
    ttl: number = this.DEFAULT_TTL,
    category: CacheEntry['category'] = 'general'
  ): Promise<boolean> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<CacheEntry>(this.CACHE_COLLECTION);

      const now = new Date();
      const expiresAt = new Date(now.getTime() + (ttl * 1000));

      // Estimate data size
      const dataSize = new Blob([JSON.stringify(data)]).size;

      const cacheEntry: Omit<CacheEntry, '_id'> = {
        key,
        data,
        ttl,
        category,
        size: dataSize,
        createdAt: now,
        expiresAt,
        hits: 0,
        lastAccessed: now
      };

      await collection.replaceOne(
        { key },
        cacheEntry,
        { upsert: true }
      );

      // Clean up expired entries periodically
      if (Math.random() < 0.01) { // 1% chance
        await this.cleanupExpiredCache();
      }

      return true;
    } catch (error) {
      console.error('Error setting cache:', error);
      return false;
    }
  }

  /**
   * Get cache entry
   */
  static async getCache(key: string): Promise<any | null> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<CacheEntry>(this.CACHE_COLLECTION);

      const entry = await collection.findOne({
        key,
        expiresAt: { $gt: new Date() }
      });

      if (!entry) return null;

      // Update hit count and last accessed
      await collection.updateOne(
        { key },
        {
          $inc: { hits: 1 },
          $set: { lastAccessed: new Date() }
        }
      );

      return entry.data;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  }

  /**
   * Delete cache entry
   */
  static async deleteCache(key: string): Promise<boolean> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<CacheEntry>(this.CACHE_COLLECTION);

      const result = await collection.deleteOne({ key });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting cache:', error);
      return false;
    }
  }

  /**
   * Clear cache by category
   */
  static async clearCacheByCategory(category: CacheEntry['category']): Promise<number> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<CacheEntry>(this.CACHE_COLLECTION);

      const result = await collection.deleteMany({ category });
      return result.deletedCount || 0;
    } catch (error) {
      console.error('Error clearing cache by category:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats(): Promise<CacheStats> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<CacheEntry>(this.CACHE_COLLECTION);

      const [stats] = await collection.aggregate([
        {
          $group: {
            _id: null,
            totalEntries: { $sum: 1 },
            totalSize: { $sum: '$size' },
            totalHits: { $sum: '$hits' },
            oldestEntry: { $min: '$createdAt' },
            newestEntry: { $max: '$createdAt' },
            categories: { $push: '$category' }
          }
        }
      ]).toArray();

      if (!stats) {
        return {
          totalEntries: 0,
          totalSize: 0,
          hitRate: 0,
          categoryBreakdown: {},
          oldestEntry: new Date(),
          newestEntry: new Date()
        };
      }

      // Calculate category breakdown
      const categoryBreakdown: Record<string, number> = {};
      stats.categories.forEach((cat: string) => {
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
      });

      // Calculate hit rate (simplified)
      const hitRate = stats.totalEntries > 0 ? 
        Math.round((stats.totalHits / stats.totalEntries) * 100) / 100 : 0;

      return {
        totalEntries: stats.totalEntries,
        totalSize: stats.totalSize || 0,
        hitRate,
        categoryBreakdown,
        oldestEntry: stats.oldestEntry,
        newestEntry: stats.newestEntry
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        totalEntries: 0,
        totalSize: 0,
        hitRate: 0,
        categoryBreakdown: {},
        oldestEntry: new Date(),
        newestEntry: new Date()
      };
    }
  }

  /**
   * Performance Monitoring
   */

  /**
   * Record performance metrics
   */
  static async recordPerformanceMetrics(
    metrics: Omit<PerformanceMetrics, '_id' | 'timestamp'>
  ): Promise<boolean> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<PerformanceMetrics>(this.METRICS_COLLECTION);

      await collection.insertOne({
        ...metrics,
        timestamp: new Date()
      });

      // Sample data to prevent collection growth
      if (Math.random() < 0.1) { // 10% chance
        await this.cleanupOldMetrics();
      }

      return true;
    } catch (error) {
      console.error('Error recording performance metrics:', error);
      return false;
    }
  }

  /**
   * Get performance analytics
   */
  static async getPerformanceAnalytics(
    options: {
      startDate?: Date;
      endDate?: Date;
      userId?: string;
      pageUrl?: string;
    } = {}
  ): Promise<{
    averageLoadTime: number;
    averageLCP: number;
    averageFID: number;
    averageCLS: number;
    slowPages: Array<{ url: string; avgLoadTime: number }>;
    deviceBreakdown: Record<string, number>;
    errorRate: number;
  }> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<PerformanceMetrics>(this.METRICS_COLLECTION);

      const query: any = {};
      
      if (options.startDate || options.endDate) {
        query.timestamp = {};
        if (options.startDate) query.timestamp.$gte = options.startDate;
        if (options.endDate) query.timestamp.$lte = options.endDate;
      }

      if (options.userId) {
        query.userId = options.userId;
      }

      if (options.pageUrl) {
        query.pageUrl = { $regex: options.pageUrl, $options: 'i' };
      }

      const [analytics] = await collection.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            avgLoadTime: { $avg: '$loadTime' },
            avgLCP: { $avg: '$lcp' },
            avgFID: { $avg: '$fid' },
            avgCLS: { $avg: '$cls' },
            totalSessions: { $sum: 1 },
            errorSessions: {
              $sum: {
                $cond: [
                  { $gt: [{ $size: { $ifNull: ['$errors', []] } }, 0] },
                  1,
                  0
                ]
              }
            },
            devices: { $push: '$deviceType' },
            pageLoadTimes: {
              $push: {
                url: '$pageUrl',
                loadTime: '$loadTime'
              }
            }
          }
        }
      ]).toArray();

      if (!analytics) {
        return {
          averageLoadTime: 0,
          averageLCP: 0,
          averageFID: 0,
          averageCLS: 0,
          slowPages: [],
          deviceBreakdown: {},
          errorRate: 0
        };
      }

      // Calculate device breakdown
      const deviceBreakdown: Record<string, number> = {};
      analytics.devices.forEach((device: string) => {
        deviceBreakdown[device] = (deviceBreakdown[device] || 0) + 1;
      });

      // Find slow pages
      const pagePerformance = new Map<string, number[]>();
      analytics.pageLoadTimes.forEach((item: any) => {
        if (!pagePerformance.has(item.url)) {
          pagePerformance.set(item.url, []);
        }
        pagePerformance.get(item.url)!.push(item.loadTime);
      });

      const slowPages = Array.from(pagePerformance.entries())
        .map(([url, times]) => ({
          url,
          avgLoadTime: times.reduce((a, b) => a + b, 0) / times.length
        }))
        .sort((a, b) => b.avgLoadTime - a.avgLoadTime)
        .slice(0, 5);

      const errorRate = analytics.totalSessions > 0 ? 
        (analytics.errorSessions / analytics.totalSessions) * 100 : 0;

      return {
        averageLoadTime: Math.round(analytics.avgLoadTime || 0),
        averageLCP: Math.round(analytics.avgLCP || 0),
        averageFID: Math.round(analytics.avgFID || 0),
        averageCLS: Math.round((analytics.avgCLS || 0) * 1000) / 1000, // Keep 3 decimals
        slowPages,
        deviceBreakdown,
        errorRate: Math.round(errorRate * 100) / 100
      };
    } catch (error) {
      console.error('Error getting performance analytics:', error);
      return {
        averageLoadTime: 0,
        averageLCP: 0,
        averageFID: 0,
        averageCLS: 0,
        slowPages: [],
        deviceBreakdown: {},
        errorRate: 0
      };
    }
  }

  /**
   * Error Tracking
   */

  /**
   * Log error
   */
  static async logError(
    error: Omit<PerformanceError, 'id' | 'timestamp' | 'resolved'>
  ): Promise<string> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<PerformanceError>(this.ERRORS_COLLECTION);

      const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

      const errorRecord: PerformanceError = {
        ...error,
        id: errorId,
        resolved: false,
        timestamp: new Date()
      };

      await collection.insertOne(errorRecord);

      // If critical error, could trigger alerts here
      if (error.severity === 'critical') {
        console.error('CRITICAL ERROR LOGGED:', errorRecord);
      }

      return errorId;
    } catch (logError) {
      console.error('Error logging error (meta!):', logError);
      return '';
    }
  }

  /**
   * Get error statistics
   */
  static async getErrorStats(
    options: {
      startDate?: Date;
      endDate?: Date;
      severity?: PerformanceError['severity'];
    } = {}
  ): Promise<{
    totalErrors: number;
    unresolvedErrors: number;
    errorsByType: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    recentErrors: PerformanceError[];
  }> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<PerformanceError>(this.ERRORS_COLLECTION);

      const query: any = {};
      
      if (options.startDate || options.endDate) {
        query.timestamp = {};
        if (options.startDate) query.timestamp.$gte = options.startDate;
        if (options.endDate) query.timestamp.$lte = options.endDate;
      }

      if (options.severity) {
        query.severity = options.severity;
      }

      const [stats, recentErrors] = await Promise.all([
        collection.aggregate([
          { $match: query },
          {
            $group: {
              _id: null,
              totalErrors: { $sum: 1 },
              unresolvedErrors: {
                $sum: { $cond: [{ $eq: ['$resolved', false] }, 1, 0] }
              },
              types: { $push: '$type' },
              severities: { $push: '$severity' }
            }
          }
        ]).toArray(),
        collection.find(query)
          .sort({ timestamp: -1 })
          .limit(10)
          .toArray()
      ]);

      const statsData = stats[0] || {
        totalErrors: 0,
        unresolvedErrors: 0,
        types: [],
        severities: []
      };

      // Count by type
      const errorsByType: Record<string, number> = {};
      statsData.types.forEach((type: string) => {
        errorsByType[type] = (errorsByType[type] || 0) + 1;
      });

      // Count by severity
      const errorsBySeverity: Record<string, number> = {};
      statsData.severities.forEach((severity: string) => {
        errorsBySeverity[severity] = (errorsBySeverity[severity] || 0) + 1;
      });

      return {
        totalErrors: statsData.totalErrors,
        unresolvedErrors: statsData.unresolvedErrors,
        errorsByType,
        errorsBySeverity,
        recentErrors: recentErrors.map((error: any) => ({
          ...error,
          _id: error._id?.toString()
        }))
      };
    } catch (error) {
      console.error('Error getting error stats:', error);
      return {
        totalErrors: 0,
        unresolvedErrors: 0,
        errorsByType: {},
        errorsBySeverity: {},
        recentErrors: []
      };
    }
  }

  /**
   * Database Optimization
   */

  /**
   * Ensure database indexes
   */
  static async ensureIndexes(): Promise<DatabaseOptimization[]> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');

      const optimizations: DatabaseOptimization[] = [
        // Performance Cache indexes
        {
          collectionName: this.CACHE_COLLECTION,
          indexName: 'cache_key_expires',
          indexDefinition: { key: 1, expiresAt: 1 },
          estimatedImprovement: 'Fast cache lookups and automatic expiration',
          implemented: false
        },
        {
          collectionName: this.CACHE_COLLECTION,
          indexName: 'cache_category_created',
          indexDefinition: { category: 1, createdAt: -1 },
          estimatedImprovement: 'Efficient category-based cache management',
          implemented: false
        },

        // Performance Metrics indexes
        {
          collectionName: this.METRICS_COLLECTION,
          indexName: 'metrics_timestamp',
          indexDefinition: { timestamp: -1 },
          estimatedImprovement: 'Fast time-based analytics queries',
          implemented: false
        },
        {
          collectionName: this.METRICS_COLLECTION,
          indexName: 'metrics_user_page',
          indexDefinition: { userId: 1, pageUrl: 1, timestamp: -1 },
          estimatedImprovement: 'User-specific performance tracking',
          implemented: false
        },

        // Error tracking indexes
        {
          collectionName: this.ERRORS_COLLECTION,
          indexName: 'errors_timestamp_severity',
          indexDefinition: { timestamp: -1, severity: 1 },
          estimatedImprovement: 'Fast error analytics and alerting',
          implemented: false
        },

        // User-related collections (if not already indexed)
        {
          collectionName: 'savedMealPlans',
          indexName: 'saved_plans_user_created',
          indexDefinition: { userId: 1, createdAt: -1 },
          estimatedImprovement: 'Fast user meal plan retrieval',
          implemented: false
        },
        {
          collectionName: 'userRecipeCollections',
          indexName: 'collections_user_updated',
          indexDefinition: { userId: 1, updatedAt: -1 },
          estimatedImprovement: 'Efficient user collection queries',
          implemented: false
        },
        {
          collectionName: 'userRecipes',
          indexName: 'user_recipes_status_created',
          indexDefinition: { userId: 1, status: 1, createdAt: -1 },
          estimatedImprovement: 'Fast user recipe filtering',
          implemented: false
        }
      ];

      // Attempt to create indexes
      for (const optimization of optimizations) {
        try {
          const collection = db.collection(optimization.collectionName);
          await collection.createIndex(
            optimization.indexDefinition,
            { name: optimization.indexName, background: true }
          );
          optimization.implemented = true;
          console.log(`Created index: ${optimization.indexName}`);
        } catch (indexError) {
          console.warn(`Failed to create index ${optimization.indexName}:`, indexError);
          optimization.implemented = false;
        }
      }

      return optimizations;
    } catch (error) {
      console.error('Error ensuring indexes:', error);
      return [];
    }
  }

  /**
   * Cleanup expired cache entries
   */
  private static async cleanupExpiredCache(): Promise<number> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<CacheEntry>(this.CACHE_COLLECTION);

      const result = await collection.deleteMany({
        expiresAt: { $lt: new Date() }
      });

      if (result.deletedCount && result.deletedCount > 0) {
        console.log(`Cleaned up ${result.deletedCount} expired cache entries`);
      }

      return result.deletedCount || 0;
    } catch (error) {
      console.error('Error cleaning up expired cache:', error);
      return 0;
    }
  }

  /**
   * Cleanup old performance metrics (keep last 30 days)
   */
  private static async cleanupOldMetrics(): Promise<number> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<PerformanceMetrics>(this.METRICS_COLLECTION);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);

      const result = await collection.deleteMany({
        timestamp: { $lt: cutoffDate }
      });

      if (result.deletedCount && result.deletedCount > 0) {
        console.log(`Cleaned up ${result.deletedCount} old performance metrics`);
      }

      return result.deletedCount || 0;
    } catch (error) {
      console.error('Error cleaning up old metrics:', error);
      return 0;
    }
  }

  /**
   * Get system health status
   */
  static async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: {
      cacheHitRate: number;
      averageResponseTime: number;
      errorRate: number;
      dbConnectionTime: number;
    };
    issues: string[];
  }> {
    try {
      const startTime = Date.now();
      
      // Test database connection
      const client = await clientPromise;
      const db = client.db('smartplates');
      await db.admin().ping();
      const dbConnectionTime = Date.now() - startTime;

      // Get cache stats
      const cacheStats = await this.getCacheStats();
      
      // Get recent performance metrics
      const recentMetrics = await this.getPerformanceAnalytics({
        startDate: new Date(Date.now() - (24 * 60 * 60 * 1000)) // Last 24 hours
      });

      // Get error stats
      const errorStats = await this.getErrorStats({
        startDate: new Date(Date.now() - (24 * 60 * 60 * 1000))
      });

      const issues: string[] = [];
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

      // Health checks
      if (dbConnectionTime > 1000) {
        issues.push('Slow database connection');
        status = 'degraded';
      }

      if (cacheStats.hitRate < 0.5) {
        issues.push('Low cache hit rate');
        if (status === 'healthy') status = 'degraded';
      }

      if (recentMetrics.averageLoadTime > 3000) {
        issues.push('Slow page load times');
        status = 'degraded';
      }

      if (recentMetrics.errorRate > 5) {
        issues.push('High error rate');
        status = 'unhealthy';
      }

      return {
        status,
        metrics: {
          cacheHitRate: cacheStats.hitRate,
          averageResponseTime: recentMetrics.averageLoadTime,
          errorRate: recentMetrics.errorRate,
          dbConnectionTime
        },
        issues
      };
    } catch (error) {
      console.error('Error getting system health:', error);
      return {
        status: 'unhealthy',
        metrics: {
          cacheHitRate: 0,
          averageResponseTime: 0,
          errorRate: 100,
          dbConnectionTime: 0
        },
        issues: ['System health check failed']
      };
    }
  }
}