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

    // Unified filter extraction matching client params
    const filters = {
      query: searchParams.get('search') || '',
      type: searchParams.get('type') || undefined,
      diet: searchParams.get('diet') || undefined,
      intolerances: searchParams.get('intolerances') || undefined,
      maxReadyTime: searchParams.get('maxReadyTime') ? parseInt(searchParams.get('maxReadyTime') as string, 10) : undefined,
    } as const;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || searchParams.get('number') || '30', 10);

    console.log('Parsed Filters:', filters, 'page:', page, 'limit:', limit);

    let recipes: Recipe[] = [];
    let total = 0;
    let source: 'mongodb' | 'mongodb-relaxed' | 'spoonacular' | 'fallback-needed' = 'mongodb';
    let notice: string | undefined;

    // Build MongoDB query for cached recipes (collection: spoonacular_recipes)
    const { getCollection } = await import('@/lib/db');
    const spoonacularCollection = await getCollection<Recipe>('spoonacular_recipes');

    // Ensure indexes and dedupe once per process
    const { ensureUniqueIndexAndDedupe } = await import('@/lib/dedupe');
    await ensureUniqueIndexAndDedupe(spoonacularCollection as any);

    const mongoQuery: any = {};
    if (filters.query) {
      mongoQuery.$or = [
        { title: { $regex: filters.query, $options: 'i' } },
        { description: { $regex: filters.query, $options: 'i' } },
      ];
    }
    if (filters.type) {
      // dishTypes is an array; equality or $in both work, use $in for clarity
      mongoQuery.dishTypes = { $in: [filters.type] };
    }
    if (filters.diet) {
      // diets is an array of strings
      mongoQuery.diets = { $in: [filters.diet] };
    }
    if (typeof filters.maxReadyTime === 'number') {
      mongoQuery.readyInMinutes = { $lte: filters.maxReadyTime };
    }
    if (filters.intolerances) {
      // Exclude recipes whose extendedIngredients contain the intolerance keyword(s)
      const intoleranceKey = filters.intolerances.toLowerCase();
      const regexMap: Record<string, RegExp> = {
        egg: /\begg(s)?\b/i,
        gluten: /(gluten|wheat|flour|barley|rye)/i,
        dairy: /(milk|cheese|butter|cream|yogurt|lactose)/i,
        peanut: /peanut/i,
        seafood: /(fish|shrimp|prawn|crab|lobster|tuna|salmon)/i,
        sesame: /sesame/i,
        soy: /(soy|soya|tofu|soybean)/i,
        sulfite: /(sulfite|sulphite)/i,
        'tree nut': /(almond|walnut|hazelnut|cashew|pecan|pistachio|macadamia)/i,
        wheat: /(wheat|flour)/i,
      };
      const rx = regexMap[intoleranceKey] || new RegExp(intoleranceKey.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
      mongoQuery.extendedIngredients = { $not: { $elemMatch: { name: rx } } };
    }

    // Query MongoDB cache
    const mongoRecipes = await spoonacularCollection
      .find(mongoQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    recipes = mongoRecipes;
    total = await spoonacularCollection.countDocuments(mongoQuery);
    source = 'mongodb';

    // If no cached results, try relaxed Mongo-only fallbacks before external API
    if (!recipes || recipes.length === 0) {
      const relaxedAttempts: Array<{ label: string; query: any }> = [];

      // a) ignore intolerances
      if (mongoQuery.extendedIngredients) {
        const q: any = { ...mongoQuery };
        delete q.extendedIngredients;
        relaxedAttempts.push({ label: 'without intolerances', query: q });
      }
      // b) ignore diet
      if (mongoQuery.diets) {
        const q: any = { ...mongoQuery };
        delete q.diets;
        relaxedAttempts.push({ label: 'without diet', query: q });
      }
      // c) ignore type
      if (mongoQuery.dishTypes) {
        const q: any = { ...mongoQuery };
        delete q.dishTypes;
        relaxedAttempts.push({ label: 'without type', query: q });
      }
      // d) drop free-text query
      if (mongoQuery.$or) {
        const q: any = { ...mongoQuery };
        delete q.$or;
        relaxedAttempts.push({ label: 'without search term', query: q });
      }
      // e) last resort: no filters (just show something)
      relaxedAttempts.push({ label: 'unfiltered fallback', query: {} });

      for (const attempt of relaxedAttempts) {
        const alt = await spoonacularCollection
          .find(attempt.query)
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray();
        if (alt.length > 0) {
          recipes = alt;
          total = await spoonacularCollection.countDocuments(attempt.query);
          source = 'mongodb-relaxed';
          notice = `Keine exakte Übereinstimmung gefunden – zeige Ergebnisse ${attempt.label}.`;
          break;
        }
      }
    }

    // Fallback to Spoonacular if explicitly enabled and still nothing in cache
    const spoonacularEnabled = process.env.SPOONACULAR_ENABLED !== 'false';
    if ((!recipes || recipes.length === 0) && spoonacularEnabled) {
      try {
        const { searchSpoonacularRecipes } = await import('@/services/spoonacularService');
        const spoonacularOptions: any = {
          number: limit,
          offset: (page - 1) * limit,
        };
        if (filters.type) spoonacularOptions.type = filters.type;
        if (filters.diet) spoonacularOptions.diet = filters.diet;
        if (filters.intolerances) spoonacularOptions.intolerances = filters.intolerances;
        if (typeof filters.maxReadyTime === 'number') spoonacularOptions.maxReadyTime = filters.maxReadyTime;

        const result = await searchSpoonacularRecipes(filters.query || '', spoonacularOptions);
        recipes = result.recipes || [];
        total = result.totalResults || recipes.length;
        source = 'spoonacular';

        // Cache new recipes into MongoDB (avoid duplicates by id)
        if (recipes.length > 0) {
          try {
            await spoonacularCollection.insertMany(recipes, { ordered: false });
          } catch (e: any) {
            // ignore duplicate key errors on unordered bulk insert
            const isDup = e?.writeErrors?.every((we: any) => we?.code === 11000);
            if (!isDup) throw e;
          }
        }
      } catch (spError) {
        console.warn('⚠️ Spoonacular API fallback failed:', spError);
        recipes = recipes || [];
        total = recipes.length;
        source = source === 'mongodb-relaxed' ? source : 'fallback-needed';
        if (!notice) notice = 'Externer API-Fallback nicht verfügbar (Limit erreicht).';
      }
    }

    return NextResponse.json({ recipes, total, source, notice });
  } catch (error) {
    console.error('❌ API /api/recipes error:', error);
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
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
