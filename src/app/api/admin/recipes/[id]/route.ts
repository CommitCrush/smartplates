import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCollection, COLLECTIONS } from '@/lib/db';
import { ObjectId } from 'mongodb';

/**
 * DELETE /api/admin/recipes/[id] - Delete a recipe by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    console.log('Attempting to delete recipe with ID:', id, 'from source:', source);

    let deletedCount = 0;
    let deletedFrom = '';
    let collectionName = '';

    // Handle special Spoonacular ID format (e.g., "spoonacular-632778")
    let actualId = id;
    let spoonacularId = null;
    
    if (id.startsWith('spoonacular-')) {
      spoonacularId = parseInt(id.replace('spoonacular-', ''));
      console.log('Extracted Spoonacular ID:', spoonacularId);
    }

    // Determine which collection to target based on source
    if (source === 'spoonacular') {
      try {
        const spoonacularCollection = await getCollection('spoonacular_recipes');
        
        // Try deletion by MongoDB ObjectId first
        let result = null;
        if (actualId && ObjectId.isValid(actualId)) {
          result = await spoonacularCollection.deleteOne({ _id: new ObjectId(actualId) });
          console.log('Tried deleting by MongoDB ObjectId:', actualId, 'Result:', result);
        }
        
        // If not found by ObjectId and we have a spoonacular ID, try by spoonacular ID
        if ((!result || result.deletedCount === 0) && spoonacularId) {
          result = await spoonacularCollection.deleteOne({ id: spoonacularId });
          console.log('Tried deleting by spoonacular ID field:', spoonacularId, 'Result:', result);
        }
        
        // Also try by spoonacularId field
        if ((!result || result.deletedCount === 0) && spoonacularId) {
          result = await spoonacularCollection.deleteOne({ spoonacularId: spoonacularId });
          console.log('Tried deleting by spoonacularId field:', spoonacularId, 'Result:', result);
        }
        
        if (result && result.deletedCount > 0) {
          deletedCount = result.deletedCount;
          deletedFrom = 'Spoonacular recipes';
          collectionName = 'spoonacular_recipes';
          console.log('Recipe deleted from spoonacular recipes collection');
        }
      } catch (error) {
        console.error('Failed to delete from spoonacular recipes:', error);
      }
    } else if (source === 'user') {
      try {
        const userRecipesCollection = await getCollection(COLLECTIONS.USER_RECIPES);
        const result = await userRecipesCollection.deleteOne({ _id: new ObjectId(actualId) });
        
        if (result.deletedCount > 0) {
          deletedCount = result.deletedCount;
          deletedFrom = 'User recipes';
          collectionName = COLLECTIONS.USER_RECIPES;
          console.log('Recipe deleted from user recipes collection');
        }
      } catch (error) {
        console.error('Failed to delete from user recipes:', error);
      }
    } else if (source === 'admin') {
      try {
        const recipesCollection = await getCollection(COLLECTIONS.RECIPES);
        const result = await recipesCollection.deleteOne({ _id: new ObjectId(actualId) });
        
        if (result.deletedCount > 0) {
          deletedCount = result.deletedCount;
          deletedFrom = 'Admin recipes';
          collectionName = COLLECTIONS.RECIPES;
          console.log('Recipe deleted from admin recipes collection');
        }
      } catch (error) {
        console.error('Failed to delete from admin recipes:', error);
      }
    } else {
      // If no source specified, try all collections (fallback to original behavior)
      const collections = [
        { name: COLLECTIONS.RECIPES, label: 'Admin recipes' },
        { name: COLLECTIONS.USER_RECIPES, label: 'User recipes' },
        { name: 'spoonacular_recipes', label: 'Spoonacular recipes' }
      ];

      for (const collection of collections) {
        try {
          const col = await getCollection(collection.name);
          let result = null;
          
          // For spoonacular recipes, try multiple ID formats
          if (collection.name === 'spoonacular_recipes' && spoonacularId) {
            // Try by spoonacular ID first
            result = await col.deleteOne({ id: spoonacularId });
            if (result.deletedCount === 0) {
              result = await col.deleteOne({ spoonacularId: spoonacularId });
            }
          }
          
          // Try by MongoDB ObjectId if spoonacular deletion failed or not applicable
          if ((!result || result.deletedCount === 0) && ObjectId.isValid(actualId)) {
            result = await col.deleteOne({ _id: new ObjectId(actualId) });
          }
          
          if (result && result.deletedCount > 0) {
            deletedCount = result.deletedCount;
            deletedFrom = collection.label;
            collectionName = collection.name;
            console.log(`Recipe deleted from ${collection.name} collection`);
            break;
          }
        } catch (error) {
          console.log(`Failed to delete from ${collection.name}:`, error);
        }
      }
    }

    if (deletedCount === 0) {
      return NextResponse.json(
        { error: 'Recipe not found or could not be deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Recipe deleted successfully from ${deletedFrom}`,
      deletedCount,
      deletedFrom,
      collection: collectionName,
      source: source || 'auto-detected'
    });

  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}