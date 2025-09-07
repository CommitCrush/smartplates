/**
 * Recipes API Route - Protected
 * 
 * Handles recipe creation and listing.
 * GET: Get all recipes (public, with optional auth for personalization)
 * POST: Create new recipe (authenticated users only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, handleCors, rateLimit, optionalAuth } from '@/middleware/authMiddleware';
import { getRecipeCards, createRecipe } from '@/models/Recipe';
import { CreateRecipeInput, RecipeFilter } from '@/types/recipe';
import { User } from '@/types/user';
import { isValidObjectId } from '@/lib/db';

/**
 * GET /api/recipes
 * Gets all public recipes with optional filtering and pagination
 * This is a public endpoint, but shows different content for authenticated users
 */
export async function GET(request: NextRequest) {
  try {
    // Handle CORS preflight
    const corsResponse = handleCors(request);
    if (corsResponse) return corsResponse;
    
    // Apply rate limiting
    const rateLimitResponse = rateLimit(request, 200, 15 * 60 * 1000);
    if (rateLimitResponse) return rateLimitResponse;
    
    // Check for optional authentication
    const authResult = await optionalAuth(request);
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50); // Max 50 items
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter: RecipeFilter = {
      isPublic: true  // Only show public recipes for general listing
    };
    
    // Add optional filters
    if (searchParams.get('category')) {
      const categoryId = searchParams.get('category')!;
      if (isValidObjectId(categoryId)) {
        filter.categoryId = categoryId;
      }
    }
    
    if (searchParams.get('difficulty')) {
      filter.difficulty = searchParams.get('difficulty') as 'easy' | 'medium' | 'hard';
    }
    
    if (searchParams.get('mealType')) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filter.mealType = searchParams.get('mealType') as any;
    }
    
    if (searchParams.get('maxPrepTime')) {
      filter.maxPrepTime = parseInt(searchParams.get('maxPrepTime')!);
    }
    
    if (searchParams.get('search')) {
      filter.searchTerm = searchParams.get('search')!;
    }
    
    if (searchParams.get('tags')) {
      filter.tags = searchParams.get('tags')!.split(',');
    }
    
    // Get recipe cards from database
    const recipes = await getRecipeCards(filter, limit, skip);
    
    return NextResponse.json({
      success: true,
      data: recipes,
      pagination: {
        page,
        limit,
        total: recipes.length,
        hasMore: recipes.length === limit
      },
      isAuthenticated: authResult.success,
      user: authResult.user ? {
        _id: authResult.user._id,
        name: authResult.user.name,
        role: authResult.user.role
      } : null
    });
    
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch recipes' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recipes
 * Creates a new recipe (authenticated users only)
 */
async function createRecipeHandler(request: NextRequest, user: User) {
  try {
    // Handle CORS preflight
    const corsResponse = handleCors(request);
    if (corsResponse) return corsResponse;
    
    // Apply rate limiting
    const rateLimitResponse = rateLimit(request, 20, 15 * 60 * 1000);
    if (rateLimitResponse) return rateLimitResponse;
    
    // Parse request body
    const recipeData: CreateRecipeInput = await request.json();
    
    // Validate required fields
    if (!recipeData.title || !recipeData.description || !recipeData.ingredients || !recipeData.instructions) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Title, description, ingredients, and instructions are required' 
        },
        { status: 400 }
      );
    }
    
    // Validate category ID
    if (!recipeData.categoryId || !isValidObjectId(recipeData.categoryId.toString())) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Valid category ID is required' 
        },
        { status: 400 }
      );
    }
    
    // Set the author to the authenticated user
    recipeData.authorId = user._id!;
    
    // Create recipe in database
    const newRecipe = await createRecipe(recipeData);
    
    return NextResponse.json({
      success: true,
      data: newRecipe,
      message: 'Recipe created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create recipe' 
      },
      { status: 500 }
    );
  }
}

// POST endpoint requires authentication (any authenticated user can create recipes)
export const POST = withAuth(createRecipeHandler, false);
