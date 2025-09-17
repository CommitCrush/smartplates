/**
 * Individual Recipe API Routes
 * 
 * Handles CRUD operations for individual recipes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRecipe, updateRecipe, deleteRecipe } from '@/models/Recipe';
import { UpdateRecipeInput } from '@/types/recipe';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/recipes/[id] - Get single recipe
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const recipe = await getRecipe(id);
    
    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/recipes/[id] - Update recipe
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const updateData: UpdateRecipeInput = await request.json();

    // Basic validation
    if (!updateData.title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!updateData.description?.trim()) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    const updatedRecipe = await updateRecipe(id, updateData);
    
    if (!updatedRecipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedRecipe);
  } catch (error) {
    console.error('Error updating recipe:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/recipes/[id] - Delete recipe
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const deleted = await deleteRecipe(id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Recipe deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
