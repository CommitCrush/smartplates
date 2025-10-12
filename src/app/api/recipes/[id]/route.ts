
import { NextRequest, NextResponse } from 'next/server';
import { findRecipeById, deleteRecipe, updateRecipe } from '@/services/recipeService';
import { getSpoonacularRecipe } from '@/services/spoonacularService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } } // Corrected parameter handling
) {
  try {
    const { id } = context.params; // Corrected destructuring

    if (!id) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 });
    }

    let recipe;
    // Check if the ID is for Spoonacular or a local recipe
    if (id.startsWith('spoonacular-')) {
      recipe = await getSpoonacularRecipe(id);
    } else {
      recipe = await findRecipeById(id);
    }

    if (!recipe) {
      console.log(`Recipe with id ${id} not found in any collection.`);
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    return NextResponse.json(recipe);

  } catch (error) {
    console.error('Recipe fetch error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } } // Corrected parameter handling
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = context.params; // Corrected destructuring

    if (id.startsWith('spoonacular-')) {
      return NextResponse.json({ error: 'Cannot delete external recipes' }, { status: 403 });
    }

    const recipe = await findRecipeById(id);
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    const isOwner = recipe.authorId && recipe.authorId === session.user.id;
    const isAdmin = session.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const ok = await deleteRecipe(id);
    if (!ok) {
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Recipe delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } } // Corrected parameter handling
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = context.params; // Corrected destructuring

    if (id.startsWith('spoonacular-')) {
      return NextResponse.json({ error: 'Cannot update external recipes' }, { status: 403 });
    }

    const current = await findRecipeById(id);
    if (!current) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });

    const isOwner = current.authorId && current.authorId === session.user.id;
    const isAdmin = session.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const updated = await updateRecipe(id, body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Recipe update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
