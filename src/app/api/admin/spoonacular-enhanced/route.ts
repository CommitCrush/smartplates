/**
 * Enhanced Spoonacular API Endpoint
 * 
 * Provides advanced Spoonacular operations with enhanced caching,
 * performance monitoring, and optimization features.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  warmupPopularRecipesCache,
  getCacheAnalytics,
  optimizeCache,
  performHealthCheck,
  performanceMonitor
} from '@/services/spoonacularEnhancements.server';

// ========================================
// GET /api/admin/spoonacular-enhanced
// ========================================
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow admin access
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'analytics':
        const analytics = await getCacheAnalytics();
        return NextResponse.json({
          success: true,
          data: analytics
        });

      case 'performance':
        const stats = performanceMonitor.getStats();
        return NextResponse.json({
          success: true,
          data: {
            overall: stats,
            byOperation: {
              search: performanceMonitor.getStats('search_recipes'),
              cache: performanceMonitor.getStats('cache_lookup'),
              retry: performanceMonitor.getStats('retry')
            }
          }
        });

      case 'health':
        const health = await performHealthCheck();
        return NextResponse.json({
          success: true,
          data: health
        });

      default:
        // Default: Return overview
        const [analyticsData, healthData, performanceData] = await Promise.all([
          getCacheAnalytics(),
          performHealthCheck(),
          Promise.resolve(performanceMonitor.getStats())
        ]);

        return NextResponse.json({
          success: true,
          data: {
            overview: {
              status: healthData.status,
              totalRecipes: analyticsData.totalCachedRecipes,
              cacheHitRate: analyticsData.cacheHitRate,
              quotaUsage: analyticsData.quotaUsage,
              avgResponseTime: performanceData.avgDuration
            },
            analytics: analyticsData,
            health: healthData,
            performance: performanceData
          }
        });
    }
  } catch (error) {
    console.error('Enhanced Spoonacular API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ========================================
// POST /api/admin/spoonacular-enhanced
// ========================================
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow admin access
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { action, options = {} } = await request.json();

    switch (action) {
      case 'warmup':
        console.log('🔥 Admin initiated cache warmup');
        const warmupResult = await warmupPopularRecipesCache();
        return NextResponse.json({
          success: true,
          message: `Cache warmed successfully: ${warmupResult.warmed} recipes cached, ${warmupResult.errors} errors`,
          data: warmupResult
        });

      case 'optimize':
        console.log('🧹 Admin initiated cache optimization');
        const optimizeResult = await optimizeCache();
        return NextResponse.json({
          success: true,
          message: `Cache optimized: ${optimizeResult.cleaned} entries cleaned, ${optimizeResult.spaceSaved} space saved`,
          data: optimizeResult
        });

      case 'clear-metrics':
        console.log('📊 Admin cleared performance metrics');
        performanceMonitor.clearOldMetrics();
        return NextResponse.json({
          success: true,
          message: 'Performance metrics cleared successfully'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: warmup, optimize, clear-metrics' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Enhanced Spoonacular POST error:', error);
    return NextResponse.json(
      { 
        error: 'Operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ========================================
// PUT /api/admin/spoonacular-enhanced
// ========================================
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow admin access
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { settings } = await request.json();

    // This could be used to update cache settings, quotas, etc.
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully (placeholder)',
      data: { settings }
    });
  } catch (error) {
    console.error('Enhanced Spoonacular PUT error:', error);
    return NextResponse.json(
      { 
        error: 'Settings update failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}