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

    // Check if it's a preloaded recipe ID
    if (id.startsWith('preloaded-')) {
      try {
        const { PRELOADED_RECIPES } = await import('@/services/preloadedRecipes');
        const preloadedRecipe = PRELOADED_RECIPES.find(r => r.id === id);
        
        if (preloadedRecipe) {
          return NextResponse.json(preloadedRecipe);
        }
      } catch (preloadedError) {
        console.error('Preloaded recipes error:', preloadedError);
      }
      
      return NextResponse.json({ error: 'Preloaded recipe not found' }, { status: 404 });
    }

    // Check if it's a Spoonacular recipe ID
    if (id.startsWith('spoonacular-') || /^\d+$/.test(id)) {
      const spoonacularId = id.startsWith('spoonacular-') ? id.replace('spoonacular-', '') : id;
      
      console.log(`🔍 Fetching recipe ${spoonacularId} - Priority: API → Cache → Preloaded`);

      // 1. PRIORITY: Try Spoonacular API directly first
      try {
        const spoonacularApiKey = process.env.SPOONACULAR_API_KEY;
        if (spoonacularApiKey) {
          console.log(`🌐 Trying Spoonacular API for recipe ${spoonacularId}`);
          const spoonacularUrl = `https://api.spoonacular.com/recipes/${spoonacularId}/information?apiKey=${spoonacularApiKey}&includeNutrition=true`;
          
          const response = await fetch(spoonacularUrl);
          if (response.ok) {
            const recipeData = await response.json();
            console.log(`✅ Successfully fetched recipe ${spoonacularId} from Spoonacular API`);
            
            // Save to MongoDB cache for future use
            try {
              await db.collection('spoonacularcaches').insertOne({
                recipeId: parseInt(spoonacularId),
                data: recipeData,
                cachedAt: new Date(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Cache for 7 days
              });
              console.log(`💾 Successfully cached recipe ${spoonacularId} in MongoDB`);
            } catch (cacheInsertError) {
              console.error('Failed to cache recipe:', cacheInsertError);
            }
            
            return NextResponse.json(recipeData);
          } else {
            console.log(`⚠️ Spoonacular API returned ${response.status} for recipe ${spoonacularId}`);
          }
        } else {
          console.log('⚠️ No Spoonacular API key found');
        }
      } catch (apiError) {
        console.error(`❌ Spoonacular API error for recipe ${spoonacularId}:`, apiError);
      }

      // 2. FALLBACK: Try MongoDB cache
      try {
        console.log(`💾 Trying MongoDB cache for recipe ${spoonacularId}`);
        const cachedResult = await db.collection('spoonacularcaches').findOne({
          recipeId: parseInt(spoonacularId)
        });
        
        if (cachedResult && cachedResult.data) {
          console.log(`✅ Found recipe ${spoonacularId} in MongoDB cache`);
          return NextResponse.json(cachedResult.data);
        } else {
          console.log(`❌ Recipe ${spoonacularId} not found in MongoDB cache`);
        }
      } catch (dbError) {
        console.error('Database cache error:', dbError);
      }

      // 3. FALLBACK: Try cache service (compatibility layer)
      try {
        console.log(`🔧 Trying cache service for recipe ${spoonacularId}`);
        const { getRecipeInternal } = await import('@/services/spoonacularCacheService.server');
        const cachedRecipe = await getRecipeInternal(spoonacularId);
        
        if (cachedRecipe) {
          console.log(`✅ Found recipe ${spoonacularId} in cache service`);
          return NextResponse.json(cachedRecipe);
        }
      } catch (cacheError) {
        console.error('Cache service error:', cacheError);
      }

      // 4. LAST RESORT: Try preloaded recipes
      try {
        console.log(`📦 Trying preloaded recipes as last resort for recipe ${spoonacularId}`);
        const { PRELOADED_RECIPES } = await import('@/services/preloadedRecipes');
        const preloadedRecipe = PRELOADED_RECIPES.find(r => r.id === `preloaded-${spoonacularId}`);
        
        if (preloadedRecipe) {
          console.log(`✅ Found preloaded recipe for ${spoonacularId}`);
          return NextResponse.json(preloadedRecipe);
        }
      } catch (preloadedError) {
        console.error('Preloaded recipes error:', preloadedError);
      }
      
      console.log(`❌ Recipe ${spoonacularId} not found in any source`);
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