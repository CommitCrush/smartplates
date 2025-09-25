/**
 * Spoonacular Recipe Search API Route
 * 
 * Provides external recipe search functionality using Spoonacular API
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchSpoonacularRecipes, searchRecipesByIngredients } from '@/services/spoonacularService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('q') || '';
    const ingredients = searchParams.get('ingredients');
    const category = searchParams.get('category');
    const cuisine = searchParams.get('cuisine');
    const diet = searchParams.get('diet');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = parseInt(searchParams.get('offset') || '0');

    let result;

    // If ingredients are provided, search by ingredients
    if (ingredients) {
      const ingredientList = ingredients.split(',').map(i => i.trim());
      const searchResult = await searchRecipesByIngredients(ingredientList);
      result = { recipes: searchResult.recipes, totalResults: searchResult.totalResults };
    } else {
      // Otherwise, search by query
      result = await searchSpoonacularRecipes(query, {
        cuisine: cuisine || undefined,
        diet: diet || undefined,
        type: category || undefined,
        number: limit,
        offset
      });
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `Found ${result.recipes.length} recipes`
    });

  } catch (error) {
    console.error('Spoonacular search error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to search recipes',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST method for complex searches with body parameters
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      query = '', 
      ingredients = [], 
      filters = {},
      pagination = { limit: 12, offset: 0 }
    } = body;

    let result;

    if (ingredients && ingredients.length > 0) {
      result = await searchRecipesByIngredients(ingredients);
    } else {
      result = await searchSpoonacularRecipes(query, {
        ...filters,
        number: pagination.limit,
        offset: pagination.offset
      });
    }

    return NextResponse.json({
      success: true,
      data: result,
      pagination: {
        total: result.totalResults,
        limit: pagination.limit,
        offset: pagination.offset,
        hasMore: (pagination.offset + pagination.limit) < result.totalResults
      }
    });

  } catch (error) {
    console.error('Spoonacular search error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to search recipes',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}