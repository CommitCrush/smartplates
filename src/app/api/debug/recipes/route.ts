/**
 * API to get recipes from both admin and user collections
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getCollection, COLLECTIONS } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get recipes from both collections
    const adminRecipesCollection = await getCollection(COLLECTIONS.RECIPES);
    const userRecipesCollection = await getCollection(COLLECTIONS.USER_RECIPES);

    const adminRecipes = await adminRecipesCollection.find({}).toArray();
    const userRecipes = await userRecipesCollection.find({}).toArray();

    return NextResponse.json({
      success: true,
      data: {
        adminRecipes: {
          collection: COLLECTIONS.RECIPES,
          count: adminRecipes.length,
          recipes: adminRecipes.map(recipe => ({
            _id: recipe._id,
            title: recipe.title,
            authorType: recipe.authorType,
            authorName: recipe.authorName,
            status: recipe.status,
            createdAt: recipe.createdAt
          }))
        },
        userRecipes: {
          collection: COLLECTIONS.USER_RECIPES,
          count: userRecipes.length,
          recipes: userRecipes.map(recipe => ({
            _id: recipe._id,
            title: recipe.title,
            authorType: recipe.authorType,
            authorName: recipe.authorName,
            status: recipe.status,
            createdAt: recipe.createdAt
          }))
        }
      }
    });

  } catch (error) {
    console.error('Get recipes error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}