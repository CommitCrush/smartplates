import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCollection } from '@/lib/db';

/**
 * GET /api/admin/debug/spoonacular - Debug spoonacular recipes structure
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Get some sample spoonacular recipes to understand the structure
    const spoonacularCollection = await getCollection('spoonacular_recipes');
    const sampleRecipes = await spoonacularCollection.find({}).limit(5).toArray();

    const debugInfo = {
      totalCount: await spoonacularCollection.countDocuments(),
      sampleRecipes: sampleRecipes.map(recipe => ({
        _id: recipe._id?.toString(),
        id: recipe.id,
        spoonacularId: recipe.spoonacularId,
        title: recipe.title,
        source: recipe.source,
        hasSpoonacularId: !!recipe.spoonacularId,
        hasId: !!recipe.id,
        allFields: Object.keys(recipe)
      }))
    };

    return NextResponse.json(debugInfo);

  } catch (error) {
    console.error('Error debugging spoonacular recipes:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}