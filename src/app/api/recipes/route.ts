/**
 * Recipes API Route - CRUD Operations
 * 
 * Handles recipe listing, filtering, and creation operations
 * Integrated with Spoonacular API for external recipe data
 */

import { NextRequest, NextResponse } from 'next/server';
import { Recipe, CreateRecipeInput } from '@/types/recipe';
import { createRecipe } from '@/models/Recipe';


/**
 * GET /api/recipes - Get recipes with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    console.log('--- API /api/recipes GET called ---', request.url);
    const { searchParams } = new URL(request.url);
    console.log('Search Params:', searchParams.get('category'));
    
    // Filter-Parameter extrahieren
    // dietaryRestrictions und tags als Array verarbeiten
    const filters = {
      category: searchParams.get('category') || undefined,
      difficulty: searchParams.get('difficulty') || undefined,
      cuisine: searchParams.get('cuisine') || undefined,
      search: searchParams.get('search') || undefined,
      dietaryRestrictions: searchParams.getAll('dietaryRestrictions').filter(Boolean),
      tags: searchParams.getAll('tags').filter(Boolean),
      maxTime: searchParams.get('maxTime') ? parseInt(searchParams.get('maxTime')!) : undefined,
    };
    console.log('API Query Params:', filters);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');

    let recipes: Recipe[] = [];
    let total = 0;
    let source = 'mongodb';

    // 1. Suche in MongoDB
    try {
      const { getCollection, COLLECTIONS } = await import('@/lib/db');
      const recipeCollection = await getCollection<Recipe>(COLLECTIONS.RECIPES);
      const mongoQuery: any = {};
      if (filters.search) {
        mongoQuery.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
          { tags: { $elemMatch: { $regex: filters.search, $options: 'i' } } }
        ];
      }
      if (filters.category) mongoQuery.category = filters.category;
      if (filters.difficulty) mongoQuery.difficulty = filters.difficulty;
      if (filters.cuisine) mongoQuery.cuisine = filters.cuisine;
      if (filters.dietaryRestrictions && filters.dietaryRestrictions.length > 0) {
        mongoQuery.dietaryRestrictions = { $all: filters.dietaryRestrictions };
      }
      if (filters.tags && filters.tags.length > 0) {
        mongoQuery.tags = { $all: filters.tags };
      }
      if (filters.maxTime) mongoQuery.totalTime = { $lte: filters.maxTime };
      console.log('MongoDB Query:', mongoQuery);

      const mongoRecipes = await recipeCollection.find(mongoQuery).skip((page - 1) * limit).limit(limit).toArray();
      recipes = mongoRecipes;
      total = await recipeCollection.countDocuments(mongoQuery);
      source = 'mongodb';
    } catch (dbError) {
      console.warn('⚠️ MongoDB query failed, fallback to cache:', dbError);
    }

    // 2. Fallback: Spoonacular API, falls keine Rezepte gefunden
    if (!recipes || recipes.length === 0) {
      try {
        const { searchSpoonacularRecipes } = await import('@/services/spoonacularService');
        const spoonacularOptions: any = {
          number: limit,
          offset: (page - 1) * limit,
        };
        if (filters.category) spoonacularOptions.type = filters.category;
        if (filters.difficulty) spoonacularOptions.difficulty = filters.difficulty;
        if (filters.cuisine) spoonacularOptions.cuisine = filters.cuisine;
        if (filters.dietaryRestrictions.length > 0) spoonacularOptions.diet = filters.dietaryRestrictions.join(',');
        if (filters.tags.length > 0) spoonacularOptions.tags = filters.tags.join(',');
        if (filters.maxTime) spoonacularOptions.maxReadyTime = filters.maxTime;

        const result = await searchSpoonacularRecipes(filters.search || '', spoonacularOptions);
        recipes = result.recipes || [];
        total = result.totalResults || recipes.length;
        source = 'spoonacular';
      } catch (spError) {
        console.warn('⚠️ Spoonacular API fallback failed:', spError);
      }
    }

 

    // Response

    return NextResponse.json({
      recipes,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasNext: (page * limit) < total,
      hasPrev: page > 1,
      source,
      message: total > 0 ? `Found ${recipes.length} recipes (${source})` : 'No recipes found'
    });

  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recipes - Create new recipe
 */
export async function POST(request: NextRequest) {
  try {
    const recipeData: CreateRecipeInput = await request.json();

    // Basic validation
    if (!recipeData.title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!recipeData.description?.trim()) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    if (!recipeData.category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    if (!recipeData.difficulty) {
      return NextResponse.json(
        { error: 'Difficulty is required' },
        { status: 400 }
      );
    }

    if (!recipeData.ingredients || recipeData.ingredients.length === 0) {
      return NextResponse.json(
        { error: 'At least one ingredient is required' },
        { status: 400 }
      );
    }

    if (!recipeData.instructions || recipeData.instructions.length === 0) {
      return NextResponse.json(
        { error: 'At least one instruction is required' },
        { status: 400 }
      );
    }

    // Create recipe in database
    const newRecipe = await createRecipe(recipeData);

    return NextResponse.json(newRecipe, { status: 201 });

  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
