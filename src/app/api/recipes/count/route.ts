/**
 * Recipe Count API Endpoint
 * 
 * Returns the total count of recipes in the system using MongoDB service
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRecipeCount } from '@/services/recipeService';
import { getCollection, COLLECTIONS } from '@/lib/db';
import logger from '@/utils/logger';

export async function GET(request: NextRequest) {
  try {
    // Use our MongoDB recipe service to get total count
    const totalCount = await getRecipeCount();
    
    // Get breakdown by collection for admin insights
    let breakdown = {};
    try {
      const spoonacularCollection = await getCollection('spoonacular_recipes');
      const recipesCollection = await getCollection(COLLECTIONS.RECIPES);
      const userRecipesCollection = await getCollection(COLLECTIONS.USER_RECIPES);
      
      const [spoonacularCount, adminRecipeCount, userRecipeCount] = await Promise.all([
        spoonacularCollection.countDocuments(),
        recipesCollection.countDocuments(),
        userRecipesCollection.countDocuments()
      ]);
      
      breakdown = {
        spoonacularRecipes: spoonacularCount,
        adminRecipes: adminRecipeCount,
        userRecipes: userRecipeCount,
        total: totalCount
      };
    } catch (breakdownError) {
      logger.warn('Could not get detailed breakdown:', breakdownError);
      breakdown = {
        total: totalCount,
        error: 'Detailed breakdown not available'
      };
    }

    logger.info(`Recipe count requested: ${totalCount} total recipes`);
    
    return NextResponse.json({
      success: true,
      count: totalCount,
      breakdown
    });

  } catch (error) {
    logger.error('Recipe count API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get recipe count',
        count: 0 // Fallback
      },
      { status: 500 }
    );
  }
}