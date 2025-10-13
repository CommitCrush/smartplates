/**
 * API Route for User Recipes
 *
 * GET /api/users/recipes?userId=<userId> - Fetches all recipes uploaded by a specific user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCollection, toObjectId } from '@/lib/db';
import { COLLECTIONS } from '@/lib/db';

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
