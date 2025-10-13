/**
 * API Route for User Recipes
 *
 * GET /api/users/recipes?userId=<userId> - Fetches all recipes uploaded by a specific user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCollection, toObjectId } from '@/lib/db';
import { COLLECTIONS } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const userRecipesCollection = await getCollection(COLLECTIONS.USER_RECIPES);
    
    // Find all recipes where authorId matches the provided userId, checking both as ObjectId and as a string.
    const recipes = await userRecipesCollection.find({
      $or: [
        { authorId: toObjectId(userId) },
        { authorId: userId }
      ]
    }).toArray();

    return NextResponse.json({ recipes });
  } catch (error) {
    console.error('Failed to fetch user recipes:', error);
    return NextResponse.json({ error: 'An error occurred while fetching recipes.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { recipeId } = await request.json();

    if (!recipeId) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 });
    }

    const userRecipesCollection = await getCollection(COLLECTIONS.USER_RECIPES);

    // --- Start of Debugging ---
    console.log('--- DELETE RECIPE DEBUG ---');
    console.log('Session User ID:', session.user.id);
    console.log('Recipe ID from request:', recipeId);

    const recipeToDelete = await userRecipesCollection.findOne({ _id: toObjectId(recipeId) });
    console.log('Recipe found in DB:', recipeToDelete);
    // --- End of Debugging ---

    const result = await userRecipesCollection.deleteOne({
      _id: toObjectId(recipeId),
      $or: [
        { authorId: toObjectId(session.user.id) },
        { authorId: session.user.id },
      ],
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Recipe not found or user not authorized to delete it.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Recipe deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete recipe:', error);
    return NextResponse.json({ error: 'An error occurred while deleting the recipe.' }, { status: 500 });
  }
}
