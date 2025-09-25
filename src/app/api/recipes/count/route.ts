/**
 * Recipe Count API Endpoint
 * 
 * Returns the total count of recipes in the system
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getCollection, COLLECTIONS } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get total recipe count from both user-uploaded recipes and cached Spoonacular recipes
    const recipesCollection = await getCollection(COLLECTIONS.RECIPES);
    const userRecipeCount = await recipesCollection.countDocuments();
    
    // Try to get Spoonacular cache count if available
    let spoonacularCacheCount = 0;
    try {
      const SpoonacularCacheModule = await import('@/models/SpoonacularCache');
      const SpoonacularCache = SpoonacularCacheModule.default.SpoonacularRecipeCache;
      spoonacularCacheCount = await SpoonacularCache.countDocuments();
    } catch (error) {
      console.log('Spoonacular cache collection not available or empty');
    }

    const totalCount = userRecipeCount + spoonacularCacheCount;

    return NextResponse.json({
      success: true,
      count: totalCount,
      breakdown: {
        userRecipes: userRecipeCount,
        cachedSpoonacularRecipes: spoonacularCacheCount,
        total: totalCount
      }
    });

  } catch (error) {
    console.error('Recipe count API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get recipe count',
        count: 0 // Fallback
      },
      { status: 500 }
    );
  }
}