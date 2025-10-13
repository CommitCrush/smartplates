/**
 * API to manually create test collections and documents
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getCollection, COLLECTIONS } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    // Create a test recipe in admin collection
    const adminRecipesCollection = await getCollection(COLLECTIONS.RECIPES);
    
    const testRecipe = {
      title: 'Test Admin Recipe',
      description: 'This is a test recipe created by admin',
      ingredients: [
        { id: '1', name: 'Test Ingredient', amount: 1, unit: 'Stück' }
      ],
      instructions: [
        { id: '1', stepNumber: 1, instruction: 'Test instruction' }
      ],
      servings: 4,
      prepTime: 15,
      cookTime: 30,
      totalTime: 45,
      difficulty: 'easy',
      category: 'test',
      cuisine: 'international',
      dietaryTags: [],
      allergens: [],
      customTags: ['test'],
      images: [],
      primaryImageUrl: '',
      source: '',
      isOriginal: true,
      isPublic: true,
      authorId: session.user.id,
      authorName: session.user.name || session.user.email,
      authorType: 'admin',
      status: 'approved',
      views: 0,
      likes: 0,
      saves: 0,
      likedBy: [],
      savedBy: [],
      cookedBy: [],
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
      searchTags: ['test', 'easy'],
      slug: 'test-admin-recipe-' + Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: new Date(),
    };

    const result = await adminRecipesCollection.insertOne(testRecipe);

    return NextResponse.json({
      success: true,
      message: 'Test recipe created in admin collection',
      data: {
        insertedId: result.insertedId,
        collection: COLLECTIONS.RECIPES
      }
    });

  } catch (error) {
    console.error('Create test recipe error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error instanceof Error ? error.stack : 'Unknown error'
      },
      { status: 500 }
    );
  }
}