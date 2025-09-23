/**
 * Recipe Cache Refresh API Route
 * 
 * Allows manual refresh of the recipe cache
 */

import { NextResponse } from 'next/server';
import { refreshCache } from '@/services/recipeCacheService';

export async function POST() {
  try {
    console.log('🔄 Manual cache refresh requested');
    
    const refreshedData = await refreshCache();
    
    return NextResponse.json({
      success: true,
      message: `Cache refreshed successfully with ${refreshedData.totalCount} recipes`,
      data: {
        totalRecipes: refreshedData.totalCount,
        lastUpdated: new Date(refreshedData.lastUpdated).toISOString(),
        categories: Object.keys(refreshedData.categories)
      }
    });

  } catch (error) {
    console.error('❌ Failed to refresh cache:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to refresh cache',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to refresh the recipe cache',
    endpoint: '/api/recipes/refresh-cache',
    usage: 'Send a POST request to manually refresh the Spoonacular recipe cache'
  });
}