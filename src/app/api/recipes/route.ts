/**
 * Recipes API Route - CRUD Operations
 * 
 * Handles recipe listing, filtering, and creation operations
 * Integrated with Spoonacular API for external recipe data
 */

import { NextRequest, NextResponse } from 'next/server';
import { Recipe } from '@/types/recipe';
import type { CreateRecipeInput } from '@/types/recipe.d';
import { createRecipe } from '@/models/Recipe_Complex';


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
      try {
        console.log('--- API /api/recipes GET called ---', request.url);
        const { searchParams } = new URL(request.url);
        // Filter-Parameter extrahieren
        const filters = {
          category: searchParams.get('category') || undefined,
          difficulty: searchParams.get('difficulty') || undefined,
          cuisine: searchParams.get('cuisine') || undefined,
          search: searchParams.get('search') || undefined,
          dietaryRestrictions: searchParams.getAll('dietaryRestrictions').filter(Boolean),
          tags: searchParams.getAll('tags').filter(Boolean),
          maxTime: searchParams.get('maxTime') ? parseInt(searchParams.get('maxTime')!) : undefined,
          allergy: searchParams.get('allergy') || undefined,
        };
        // Pagination
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '100');

        let recipes: Recipe[] = [];
        let total = 0;
        let source = 'mongodb';

        // 1. Suche in spezieller MongoDB-Collection (spoonacular_recipes)
        const { getCollection } = await import('@/lib/db');
        const spoonacularCollection = await getCollection<Recipe>('spoonacular_recipes');
        const mongoQuery: any = {};
        if (filters.search) {
          mongoQuery.$or = [
            { title: { $regex: filters.search, $options: 'i' } },
            { description: { $regex: filters.search, $options: 'i' } }
          ];
        }
        if (filters.category) mongoQuery.dishTypes = filters.category;
        if (filters.cuisine) mongoQuery.cuisines = filters.cuisine;
        if (filters.maxTime) mongoQuery.readyInMinutes = { $lte: filters.maxTime };
        // Difficulty-Filter wird clientseitig gemacht

        const mongoRecipes = await spoonacularCollection.find(mongoQuery).skip((page - 1) * limit).limit(limit).toArray();
        recipes = mongoRecipes;
        total = await spoonacularCollection.countDocuments(mongoQuery);
        source = 'mongodb';

        // 2. Fallback: Spoonacular API, falls keine Rezepte gefunden
        if (!recipes || recipes.length === 0) {
          try {
            const { searchSpoonacularRecipes } = await import('@/services/spoonacularService');
            const spoonacularOptions: any = {
              number: limit,
              offset: (page - 1) * limit,
            };
            if (filters.category) spoonacularOptions.type = filters.category;
            if (filters.cuisine) spoonacularOptions.cuisine = filters.cuisine;
            if (filters.dietaryRestrictions.length > 0) spoonacularOptions.diet = filters.dietaryRestrictions.join(',');
            if (filters.tags.length > 0) spoonacularOptions.tags = filters.tags.join(',');
            if (filters.maxTime) spoonacularOptions.maxReadyTime = filters.maxTime;
            if (filters.allergy) spoonacularOptions.intolerances = filters.allergy;

            const result = await searchSpoonacularRecipes(filters.search || '', spoonacularOptions);
            recipes = result.recipes || [];
            total = result.totalResults || recipes.length;
            source = 'spoonacular';

            // Speichere alle Spoonacular-Rezepte in die spezielle Collection
            if (recipes.length > 0) {
              // Verhindere Duplikate anhand der Spoonacular-ID
              const existingIds = new Set((await spoonacularCollection.find({ id: { $in: recipes.map(r => r.id) } }).toArray()).map(r => r.id));
              const newRecipes = recipes.filter(r => !existingIds.has(r.id));
              if (newRecipes.length > 0) {
                await spoonacularCollection.insertMany(newRecipes);
              }
            }
          } catch (spError) {
            console.warn('⚠️ Spoonacular API fallback failed:', spError);
            recipes = [];
            total = 0;
            source = 'fallback-needed';
          }
        }

        return NextResponse.json({ recipes, total, source });
      } catch (error) {
        console.error('❌ API /api/recipes error:', error);
        return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
      }
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

    if (!recipeData.extendedIngredients || recipeData.extendedIngredients.length === 0) {
      return NextResponse.json(
        { error: 'At least one ingredient is required' },
        { status: 400 }
      );
    }

    if (!recipeData.analyzedInstructions || recipeData.analyzedInstructions.length === 0) {
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
