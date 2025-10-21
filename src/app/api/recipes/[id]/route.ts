// Recipe API route with real MongoDB implementation
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getRecipeById } from '@/services/recipeService';
import logger from '@/utils/logger';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } 
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 });
    }

    logger.info(`Fetching recipe with ID: ${id}`);
    
    // Use our MongoDB recipe service to get the recipe
    const recipe = await getRecipeById(id);

    if (!recipe) {
      logger.warn(`Recipe not found: ${id}`);
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    logger.info(`Successfully found recipe: ${recipe.title || 'Untitled'}`);
    return NextResponse.json(recipe, { status: 200 });

  } catch (error) {
    logger.error('Recipe fetch error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    logger.info(`Attempting to delete recipe: ${id}`);
    
    // For now, only allow deletion of user-created recipes
    // This is a security measure - admin deletion should use admin routes
    const recipe = await getRecipeById(id);
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // TODO: Implement deleteUserRecipe in recipeService
    logger.warn('Recipe deletion not yet implemented');
    return NextResponse.json({ error: 'Recipe deletion not yet implemented' }, { status: 501 });
    
  } catch (error) {
    logger.error('Recipe delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const updates = await request.json();

    logger.info(`Attempting to update recipe: ${id}`);
    
    // Check if recipe exists first
    const recipe = await getRecipeById(id);
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // TODO: Implement updateUserRecipe in recipeService
    logger.warn('Recipe update not yet implemented');
    return NextResponse.json({ error: 'Recipe update not yet implemented' }, { status: 501 });
    
  } catch (error) {
    logger.error('Recipe update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}