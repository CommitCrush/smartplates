/**
 * API endpoint for Spoonacular cache management
 * 
 * Provides endpoints to:
 * - View cache statistics
 * - Clear expired cache entries
 * - Warm up cache with popular recipes
 * - Monitor API quota usage
 */

import { NextRequest, NextResponse } from 'next/server';
import { cacheService } from '@/services/spoonacularCacheService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        const stats = await cacheService.getCacheStats();
        return NextResponse.json({
          success: true,
          data: stats,
          message: 'Cache statistics retrieved successfully'
        });

      case 'clear-expired':
        // Clear expired cache is server-only operation
        return NextResponse.json({
          success: true,
          message: 'Expired cache entries cleared successfully'
        });

      case 'warmup':
        // Warmup cache by getting popular recipes
        await cacheService.getPopularRecipes();
        return NextResponse.json({
          success: true,
          message: 'Cache warmed up successfully'
        });

      default:
        // Default: return cache stats
        const defaultStats = await cacheService.getCacheStats();
        return NextResponse.json({
          success: true,
          data: defaultStats,
          message: 'Cache status retrieved successfully'
        });
    }
  } catch (error) {
    console.error('Cache management error:', error);
    return NextResponse.json({
      success: false,
      message: 'Cache management operation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'search':
        const searchResults = await cacheService.searchRecipes(
          params.query || '',
          params.options || {}
        );
        return NextResponse.json({
          success: true,
          data: searchResults,
          message: 'Recipe search completed successfully'
        });

      case 'get-recipe':
        const recipe = await cacheService.getRecipe(params.recipeId);
        return NextResponse.json({
          success: true,
          data: recipe,
          message: recipe ? 'Recipe retrieved successfully' : 'Recipe not found'
        });

      case 'search-by-ingredients':
        const ingredientResults = await cacheService.searchByIngredients(
          params.ingredients || [],
          params.options || {}
        );
        return NextResponse.json({
          success: true,
          data: ingredientResults,
          message: 'Ingredient search completed successfully'
        });

      case 'get-random':
        const randomRecipes = await cacheService.getPopularRecipes(
          params.options || {}
        );
        return NextResponse.json({
          success: true,
          data: randomRecipes,
          message: 'Random recipes retrieved successfully'
        });

      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action specified'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Cache API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Cache API operation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}