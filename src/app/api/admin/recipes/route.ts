/**
 * Admin Recipes API Route
 *
 * Provides recipe data for admin management from all collections
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCollection, COLLECTIONS } from '@/lib/db';
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

    console.log('[Admin API] Fetching recipes from MongoDB');
    
    // Get recipes from all sources
    const adminRecipesPromise = getCollection(COLLECTIONS.RECIPES)
      .then(collection => {
        console.log('[Admin API] Querying admin recipes collection');
        return collection.find({}).sort({ createdAt: -1 }).limit(500).toArray();
      })
      .catch(err => {
        console.error('[Admin API] Error fetching admin recipes:', err);
        return [];
      });
      
    const userRecipesPromise = getCollection(COLLECTIONS.USER_RECIPES)
      .then(collection => {
        console.log('[Admin API] Querying user recipes collection');
        return collection.find({}).sort({ createdAt: -1 }).limit(500).toArray();
      })
      .catch(err => {
        console.error('[Admin API] Error fetching user recipes:', err);
        return [];
      });
      
    const spoonacularRecipesPromise = getCollection('spoonacular_recipes')
      .then(collection => {
        console.log('[Admin API] Querying spoonacular recipes collection');
        return collection.find({}).sort({ createdAt: -1 }).limit(500).toArray();
      })
      .catch(err => {
        console.error('[Admin API] Error fetching spoonacular recipes:', err);
        return [];
      });
    
    const [adminRecipes, userRecipes, spoonacularRecipes] = await Promise.all([
      adminRecipesPromise,
      userRecipesPromise,
      spoonacularRecipesPromise
    ]);
    
    console.log('[Admin API] Recipe counts:', {
      admin: adminRecipes.length,
      user: userRecipes.length,
      spoonacular: spoonacularRecipes.length
    });

    const allRecipes: any[] = [];

    // Transform admin recipes
    adminRecipes.forEach(recipe => {
      allRecipes.push({
        _id: recipe._id.toString(),
        title: recipe.title || 'Untitled Recipe',
        author: recipe.authorName || 'Admin',
        authorId: recipe.authorId || 'admin',
        authorType: 'admin',
        status: recipe.status || 'approved',
        visibility: recipe.isPublic ? 'public' : 'private',
        likes: recipe.likes || 0,
        reviews: recipe.totalReviews || 0,
        averageRating: recipe.averageRating || 0,
        createdAt: recipe.createdAt || new Date(),
        reportCount: 0,
        source: 'admin_upload',
        collection: 'recipes'
      });
    });

    // Transform user recipes
    userRecipes.forEach(recipe => {
      allRecipes.push({
        _id: recipe._id.toString(),
        title: recipe.title || 'Untitled Recipe',
        author: recipe.authorName || 'User',
        authorId: recipe.authorId || 'user',
        authorType: recipe.authorType || 'user',
        status: recipe.status || 'under-review',
        visibility: recipe.isPublic ? 'public' : 'private',
        likes: recipe.likes || 0,
        reviews: recipe.totalReviews || 0,
        averageRating: recipe.averageRating || 0,
        createdAt: recipe.createdAt || new Date(),
        reportCount: 0,
        source: 'user_upload',
        collection: 'userRecipes'
      });
    });

    // Transform spoonacular recipes
    spoonacularRecipes.forEach(recipe => {
      allRecipes.push({
        _id: recipe._id.toString(),
        spoonacularId: recipe.id || recipe.spoonacularId,
        title: recipe.title || 'Untitled Recipe',
        author: 'Spoonacular',
        authorId: 'spoonacular',
        authorType: 'api',
        status: 'published',
        visibility: 'public',
        likes: recipe.likesCount || 0,
        reviews: recipe.ratingsCount || 0,
        averageRating: recipe.rating || 0,
        createdAt: recipe.createdAt || new Date(),
        reportCount: 0,
        source: 'spoonacular_api',
        collection: 'spoonacular_recipes'
      });
    });

    // Sort by creation date (newest first)
    allRecipes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ 
      recipes: allRecipes,
      counts: {
        admin: adminRecipes.length,
        user: userRecipes.length,
        spoonacular: spoonacularRecipes.length,
        total: allRecipes.length
      }
    });
  } catch (error) {
    console.error('Error fetching admin recipes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}