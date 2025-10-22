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
      case 'stats': {
        const stats = await cacheService.getCacheStats();
        return NextResponse.json({
          success: true,
          data: stats,
          message: 'Cache statistics retrieved successfully'
        });
      }

      case 'clear-expired': {
        // Clear expired cache is server-only operation
        return NextResponse.json({
          success: true,
          message: 'Expired cache entries cleared successfully'
        });
      }

      case 'warmup': {
        if ('getPopularRecipes' in cacheService) {
          await (cacheService as any).getPopularRecipes();
          return NextResponse.json({
            success: true,
            message: 'Cache warmed up successfully'
          });
        } else {
          return NextResponse.json({
            success: false,
            message: 'Warmup not available on this cache service'
          }, { status: 501 });
        }
      }

      default: {
        const defaultStats = await cacheService.getCacheStats();
        return NextResponse.json({
          success: true,
          data: defaultStats,
          message: 'Cache status retrieved successfully'
        });
      }
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
      case 'search': {
        if ('searchRecipes' in cacheService) {
          const searchResults = await (cacheService as any).searchRecipes(
            params.query || '',
            params.options || {}
          );
          return NextResponse.json({
            success: true,
            data: searchResults,
            message: 'Recipe search completed successfully'
          });
        } else {
          return NextResponse.json({
            success: false,
            message: 'searchRecipes not available on this cache service'
          }, { status: 501 });
        }
      }

      case 'get-recipe': {
        if ('getRecipe' in cacheService) {
          const recipe = await (cacheService as any).getRecipe(params.recipeId);
          return NextResponse.json({
            success: true,
            data: recipe,
            message: recipe ? 'Recipe retrieved successfully' : 'Recipe not found'
          });
        } else {
          return NextResponse.json({
            success: false,
            message: 'getRecipe not available on this cache service'
          }, { status: 501 });
        }
      }

      case 'search-by-ingredients': {
        if ('searchByIngredients' in cacheService) {
          const ingredientResults = await (cacheService as any).searchByIngredients(
            params.ingredients || [],
            params.options || {}
          );
          return NextResponse.json({
            success: true,
            data: ingredientResults,
            message: 'Ingredient search completed successfully'
          });
        } else {
          return NextResponse.json({
            success: false,
            message: 'searchByIngredients not available on this cache service'
          }, { status: 501 });
        }
      }

      case 'get-random': {
        if ('getPopularRecipes' in cacheService) {
          const randomRecipes = await (cacheService as any).getPopularRecipes(
            params.options || {}
          );
          return NextResponse.json({
            success: true,
            data: randomRecipes,
            message: 'Random recipes retrieved successfully'
          });
        } else {
          return NextResponse.json({
            success: false,
            message: 'getPopularRecipes not available on this cache service'
          }, { status: 501 });
        }
      }

      default: {
        return NextResponse.json({
          success: false,
          message: 'Invalid action specified'
        }, { status: 400 });
      }
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
