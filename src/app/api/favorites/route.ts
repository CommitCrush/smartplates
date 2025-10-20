import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { findUserByEmail } from '@/models/User';
import { getCollection, getCachedQuery, invalidateCache } from '@/lib/db';
import { ObjectId } from 'mongodb';

interface FavoriteRecipe {
  _id?: ObjectId;
  userId: ObjectId;
  recipeId: string;
  recipeTitle: string;
  recipeImage?: string;
  createdAt: Date;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await findUserByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { recipeId, recipeTitle, recipeImage } = await req.json();

    if (!recipeId || !recipeTitle) {
      return NextResponse.json({ error: 'Recipe ID and title are required' }, { status: 400 });
    }

    const favoritesCollection = await getCollection<FavoriteRecipe>('favorites');

    // Ensure user._id is an ObjectId
    const userId =
      typeof user._id === 'string' ? new ObjectId(user._id) : user._id;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is missing' }, { status: 400 });
    }

    // Check if already favorited
    const existingFavorite = await favoritesCollection.findOne({
      userId: userId,
      recipeId: recipeId
    });

    if (existingFavorite) {
      // Remove from favorites (toggle off)
      await favoritesCollection.deleteOne({ _id: existingFavorite._id });
      
      // Invalidate user's favorites cache
      invalidateCache(`favorites:${userId}`);
      
      return NextResponse.json({ favorited: false, message: 'Recipe removed from favorites' });
    } else {
      // Add to favorites (toggle on)
      await favoritesCollection.insertOne({
        userId: userId,
        recipeId,
        recipeTitle,
        recipeImage: recipeImage || '/placeholder-recipe.svg',
        createdAt: new Date()
      });
      
      // Invalidate user's favorites cache
      invalidateCache(`favorites:${userId}`);
      
      return NextResponse.json({ favorited: true, message: 'Recipe added to favorites' });
    }

  } catch (error) {
    console.error('Favorites API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await findUserByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId =
      typeof user._id === 'string' ? new ObjectId(user._id) : user._id;

    // Use cached query with user ID as cache key
    const favorites = await getCachedQuery(
      `favorites:${userId}`,
      async () => {
        const favoritesCollection = await getCollection<FavoriteRecipe>('favorites');
        return favoritesCollection
          .find({ userId })
          .sort({ createdAt: -1 })
          .toArray();
      },
      60000 // 1 minute cache
    );

    return NextResponse.json({ favorites });

  } catch (error) {
    console.error('Get favorites API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}