/**
 * Admin Recipes API Route
 *
 * Provides recipe data for admin management
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCollection } from '@/lib/db';
import { shouldBeAdmin } from '@/config/team';

export async function GET(): Promise<NextResponse> {
  try {
    // Check admin authentication using team config
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isAdmin = shouldBeAdmin(session.user.email);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get recipes from cache (limit to 100 for admin view)
    const spoonacularCollection = await getCollection('spoonacular_recipes');
    const recipes = await spoonacularCollection.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    // Transform to expected format
    const transformedRecipes = recipes.map(recipe => ({
      _id: recipe._id.toString(),
      title: recipe.title || 'Untitled Recipe',
      author: recipe.authorName || 'Unknown Author',
      authorId: recipe.authorId || 'spoonacular',
      status: 'published', // All cached recipes are published
      visibility: 'public',
      likes: recipe.likesCount || 0,
      reviews: recipe.ratingsCount || 0,
      averageRating: recipe.rating || 0,
      createdAt: recipe.createdAt || new Date(),
      reportCount: 0, // No reports in cache
    }));

    return NextResponse.json({ recipes: transformedRecipes });
  } catch (error) {
    console.error('Error fetching admin recipes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}