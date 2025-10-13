/**
 * Admin Recipes Count API Route
 * 
 * Provides accurate recipe counts from database collections
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCollection, COLLECTIONS } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'total') {
      // Count ALL recipes from all collections
      const [spoonacularCount, adminCount, userCount] = await Promise.all([
        // Spoonacular recipes collection
        getCollection('spoonacular_recipes').then(col => col.countDocuments()).catch(() => 0),
        
        // Admin uploaded recipes collection
        getCollection(COLLECTIONS.RECIPES).then(col => col.countDocuments()).catch(() => 0),
        
        // User uploaded recipes collection  
        getCollection(COLLECTIONS.USER_RECIPES).then(col => col.countDocuments()).catch(() => 0)
      ]);

      const totalCount = spoonacularCount + adminCount + userCount;

      return NextResponse.json({
        totalCount,
        breakdown: {
          spoonacular: spoonacularCount,
          admin: adminCount,
          user: userCount
        }
      });
    }

    if (type === 'spoonacular') {
      // Count ONLY Spoonacular recipes
      const spoonacularCount = await getCollection('spoonacular_recipes')
        .then(col => col.countDocuments())
        .catch(() => 0);

      return NextResponse.json({
        spoonacularCount,
        type: 'spoonacular'
      });
    }

    // Original functionality for specific user recipes
    const userEmail = session.user.email;
    const userId = session.user.id;

    let count = 0;

    switch (type) {
      case 'admin':
        const adminCollection = await getCollection(COLLECTIONS.RECIPES);
        count = await adminCollection.countDocuments({ 
          $or: [
            { authorId: userEmail },
            { authorId: userId },
            { createdBy: userEmail },
            { author: userEmail }
          ]
        });
        break;
        
      case 'user':
        const userCollection = await getCollection(COLLECTIONS.USER_RECIPES);
        count = await userCollection.countDocuments({ 
          $or: [
            { authorId: userEmail },
            { authorId: userId },
            { createdBy: userEmail },
            { author: userEmail }
          ]
        });
        break;
        
      default:
        // Get total count of recipes created by this admin
        const [adminCount, userCount] = await Promise.all([
          getCollection(COLLECTIONS.RECIPES).then(col => 
            col.countDocuments({ 
              $or: [
                { authorId: userEmail },
                { authorId: userId },
                { createdBy: userEmail },
                { author: userEmail }
              ]
            })
          ),
          getCollection(COLLECTIONS.USER_RECIPES).then(col => 
            col.countDocuments({ 
              $or: [
                { authorId: userEmail },
                { authorId: userId },
                { createdBy: userEmail },
                { author: userEmail }
              ]
            })
          )
        ]);
        count = adminCount + userCount;
    }

    return NextResponse.json({ 
      count, 
      type, 
      searchedFor: { userEmail, userId },
      debug: process.env.NODE_ENV === 'development' 
    });
    
  } catch (error) {
    console.error('❌ Admin Recipe Count API Error:', error);
    return NextResponse.json(
      { error: 'Failed to get recipe count' }, 
      { status: 500 }
    );
  }
}