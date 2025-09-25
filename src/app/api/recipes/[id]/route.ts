import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, COLLECTIONS } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    const recipesCollection = db.collection(COLLECTIONS.RECIPES);

    let recipe = null;

    // Check if it's a Spoonacular recipe ID
    if (id.startsWith('spoonacular-')) {
      const spoonacularId = id.replace('spoonacular-', '');
      
     // Try to get from cache service
try {
  const { getRecipeInternal } = await import('@/services/spoonacularCacheService.server');
  const cachedRecipe = await getRecipeInternal(spoonacularId);
  
  if (cachedRecipe) {
    return NextResponse.json(cachedRecipe);
  }
} catch (cacheError) {
  console.error('Cache service error:', cacheError);
}
      
      // Fallback: search in MongoDB cache
      try {
        const cachedResult = await db.collection('spoonacularcaches').findOne({
          recipeId: spoonacularId
        });
        
        if (cachedResult) {
          return NextResponse.json(cachedResult.data);
        }
      } catch (dbError) {
        console.error('Database cache error:', dbError);
      }
      
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Handle regular MongoDB recipe IDs
    try {
      // Try as ObjectId first
      recipe = await recipesCollection.findOne({ _id: new ObjectId(id) });
    } catch (objectIdError) {
      // If ObjectId fails, try as string ID
      recipe = await recipesCollection.findOne({ id: id });
    }

    if (!recipe) {
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