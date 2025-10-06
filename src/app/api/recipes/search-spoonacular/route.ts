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

    let recipes: any[] = [];
    let total = 0;
    let source = 'mongodb';

    // 1. Suche in MongoDB
    try {
  const { getCollection } = await import('@/lib/db');
  const recipeCollection = await getCollection('recipes');
  const mongoQuery: any = {};
      if (query) {
        mongoQuery.$or = [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $elemMatch: { $regex: query, $options: 'i' } } }
        ];
      }
      if (category) mongoQuery.category = category;
      if (cuisine) mongoQuery.cuisine = cuisine;
      if (diet) mongoQuery.dietaryRestrictions = { $all: [diet] };
      if (ingredients) mongoQuery.ingredients = { $elemMatch: { name: { $in: ingredients.split(',').map(i => i.trim()) } } };

      const mongoRecipes = await recipeCollection.find(mongoQuery).skip(offset).limit(limit).toArray();
      recipes = mongoRecipes;
      total = await recipeCollection.countDocuments(mongoQuery);
      source = 'mongodb';
    } catch (dbError) {
      console.warn('MongoDB query failed, fallback to Spoonacular:', dbError);
    }

    // 2. Fallback: Spoonacular API
    if (!recipes || recipes.length === 0) {
      try {
        if (ingredients) {
          const ingredientList = ingredients.split(',').map(i => i.trim());
          const byIng = await searchRecipesByIngredients(ingredientList);
          recipes = byIng.recipes;
          total = byIng.totalResults;
          source = 'spoonacular';
        } else {
          const result = await searchSpoonacularRecipes(query, {
            cuisine: cuisine || undefined,
            diet: diet || undefined,
            type: category || undefined,
            number: limit,
            offset
          });
          recipes = result.recipes || [];
          total = result.totalResults || recipes.length;
          source = 'spoonacular';
        }
      } catch (spError) {
        console.warn('Spoonacular API fallback failed:', spError);
      }
    }

    return NextResponse.json({
      recipes,
      total,
      source,
      message: total > 0 ? `Gefunden: ${recipes.length} Rezepte (${source})` : 'Keine Rezepte gefunden'
    });

  } catch (error) {
    console.error('Spoonacular search error:', error);
    return NextResponse.json({
      success: false,
      error: 'Fehler bei der Rezeptsuche',
      message: error instanceof Error ? error.message : 'Unbekannter Fehler'
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