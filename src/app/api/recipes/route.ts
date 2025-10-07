export {};
/**
 * Recipes API Route - CRUD Operations
 * 
 * Handles recipe listing, filtering, and creation operations
 * Integrated with Spoonacular API for external recipe data
 */

import { NextRequest, NextResponse } from 'next/server';
import { Recipe } from '@/types/recipe';
import { searchRecipesMongo, createUserRecipe, updateRecipe } from '@/services/recipeService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';


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
  const authorId = searchParams.get('authorId') || undefined;
  const randomize = searchParams.get('randomize') === 'true';

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

    // Primary: use central recipeService (Mongo-first)
    const { recipes: mongoRecipes, total: mongoTotal } = await searchRecipesMongo(
      { query: filters.query, type: filters.type, diet: filters.diet, intolerances: filters.intolerances || undefined, maxReadyTime: filters.maxReadyTime, authorId },
      { page, limit },
      randomize
    );
    recipes = mongoRecipes;
    total = mongoTotal;
    source = 'mongodb';

    // If no cached results, try relaxed Mongo-only fallbacks before external API
    if (!recipes || recipes.length === 0) {


        // Service-based relaxed attempts are handled below
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

        // Apply random shuffle if requested
        if (randomize && recipes.length > 0) {
          recipes = recipes.sort(() => Math.random() - 0.5);
        }

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
  // Mark that an external fallback would be needed but is unavailable
  source = 'fallback-needed';
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const recipeData = await request.json();

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

    if (!recipeData.category && !recipeData.categoryId) {
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

    // Map incoming structure to createUserRecipe when needed
    const userRecipe = await createUserRecipe({
      userId: session.user.id,
      title: recipeData.title,
      description: recipeData.description,
      servings: recipeData.servings,
      image: recipeData.image,
      readyInMinutes: (recipeData.prepTime ?? 0) + (recipeData.cookTime ?? 0),
      ingredients: (recipeData.extendedIngredients || []).map((ing: any) => ({
        name: ing.name,
        amount: ing.amount ?? ing.originalAmount ?? 0,
        unit: ing.unit ?? ing.measure ?? '',
        notes: ing.notes,
      })),
      instructions: (recipeData.analyzedInstructions?.[0]?.steps || []).map((s: any, idx: number) => ({
        stepNumber: s.number ?? idx + 1,
        instruction: s.step ?? String(s),
        time: s.length?.number,
        temperature: undefined,
      })),
      category: recipeData.category,
      cuisine: recipeData.cuisine,
      dietaryTags: recipeData.tags || recipeData.dietaryRestrictions,
      isPublic: recipeData.isPublic ?? true,
    });

    return NextResponse.json(userRecipe, { status: 201 });
  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/recipes - Update recipe by id
 * Body: { id: string, updates: Partial<Recipe> }
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id, updates } = await request.json();
    if (!id || !updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Authorization will be enforced in [id]/route.ts for per-id updates; here we allow update if owner matches
    const current = await (await import('@/services/recipeService')).findRecipeById(id);
    if (!current) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    const isOwner = current.authorId && current.authorId === session.user.id;
    const isAdmin = (session.user as any).role === 'admin';
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await updateRecipe(id, updates);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating recipe:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
