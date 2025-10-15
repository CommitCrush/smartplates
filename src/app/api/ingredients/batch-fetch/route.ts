import { NextRequest, NextResponse } from 'next/server';
import { batchFetchRecipeIngredients } from '@/utils/ingredientsFetcher';

export async function POST(request: NextRequest) {
  try {
    const { recipeIds } = await request.json();
    
    if (!Array.isArray(recipeIds)) {
      return NextResponse.json(
        { error: 'recipeIds must be an array' },
        { status: 400 }
      );
    }

    console.log(`🔍 API: Batch fetching ingredients for ${recipeIds.length} recipes`);

    const ingredientsMap = await batchFetchRecipeIngredients(recipeIds);

    // Convert Map to object for JSON serialization
    const result: Record<string, any[]> = {};
    ingredientsMap.forEach((ingredients, recipeId) => {
      result[recipeId] = ingredients;
    });

    console.log(`✅ API: Successfully fetched ingredients for ${Object.keys(result).length} recipes`);

    return NextResponse.json({ 
      success: true, 
      data: result,
      message: `Fetched ingredients for ${Object.keys(result).length} recipes`
    });

  } catch (error) {
    console.error('❌ API Error fetching ingredients:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch ingredients',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}