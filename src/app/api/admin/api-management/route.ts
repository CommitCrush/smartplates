/**
 * Admin API Management Route
 *
 * Endpoint for advanced Spoonacular API operations:
 * - Backfill recipe details from Spoonacular
 * - Import new recipes in bulk
 * - Manage API quota and rate limits
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/authMiddleware';
import { getCollection, COLLECTIONS } from '@/lib/db';
import { searchSpoonacularRecipes, getSpoonacularRecipe } from '@/services/spoonacularService';
import { Recipe } from '@/types/recipe';
import { ObjectId } from 'mongodb';

// Type for Spoonacular API response
interface SpoonacularRecipe {
  id: number | string;
  title: string;
  image?: string;
  summary?: string;
  extendedIngredients?: any[];
  analyzedInstructions?: any[];
  cuisines?: string[];
  dishTypes?: string[];
  diets?: string[];
  readyInMinutes?: number;
  servings?: number;
  [key: string]: any;
}

// Sleep helper function
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Import new recipes from Spoonacular API
 */
async function importRecipesHandler(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { query = '', limit = 20, cuisine } = body;

    // Get recipe collection
    const recipesCollection = await getCollection(COLLECTIONS.RECIPES);
    
    // Check how many recipes we already have from spoonacular
    const existingCount = await recipesCollection.countDocuments({ 
      source: 'spoonacular' 
    });

    // Determine which parameter to use based on the selected category
    const searchParams: {[key: string]: any} = { number: limit };
    
    // Check if the category belongs to a specific type
    const dietCategories = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'low-carb', 'keto', 'paleo'];
    const mealTypeCategories = ['breakfast', 'brunch', 'lunch', 'dinner', 'snack', 'appetizer', 'dessert', 'beverage', 'soup', 'salad'];
    
    if (cuisine) {
      if (dietCategories.includes(cuisine)) {
        searchParams.diet = cuisine;
      } else if (mealTypeCategories.includes(cuisine)) {
        searchParams.type = cuisine;
      } else {
        searchParams.cuisine = cuisine;
      }
    }
    
    // Search for recipes
    const searchResults = await searchSpoonacularRecipes(query, searchParams);
    
    if (!searchResults.recipes || searchResults.recipes.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No recipes found from Spoonacular API',
      }, { status: 404 });
    }

    // Filter out recipes that already exist in our database
    const filteredRecipes: SpoonacularRecipe[] = [];
    for (const recipe of searchResults.recipes as unknown as SpoonacularRecipe[]) {
      // Check if recipe already exists by spoonacularId
      const exists = await recipesCollection.findOne({ 
        $or: [
          { spoonacularId: recipe.id },
          { spoonacularId: parseInt(String(recipe.id), 10) }
        ] 
      });

      if (!exists) {
        filteredRecipes.push(recipe);
      }
    }

    // If we have no new recipes, return early
    if (filteredRecipes.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All recipes from this search already exist in the database',
        importedCount: 0,
        newTotal: existingCount,
        totalCount: searchResults.recipes.length,
        savedCount: 0,
        duplicateCount: searchResults.recipes.length
      });
    }

    // Import each recipe with full details
    const importedRecipes = [];
    let count = 0;
    
    for (const basicRecipe of filteredRecipes) {
      try {
        // Get full recipe details
        const recipeId = String(basicRecipe.id);
          
        const fullRecipe = await getSpoonacularRecipe(recipeId);
        
        if (!fullRecipe) {
          console.warn(`Failed to fetch full details for recipe ${recipeId}`);
          continue;
        }
        
        // Prepare the recipe for insertion
        const recipeToInsert = {
          ...fullRecipe,
          source: 'spoonacular',
          spoonacularId: parseInt(recipeId, 10) || null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Insert the recipe
        const result = await recipesCollection.insertOne(recipeToInsert as any);
        
        if (result.acknowledged) {
          count++;
          importedRecipes.push({
            id: result.insertedId,
            title: fullRecipe.title
          });
        }
        
        // Add a small delay between requests to avoid rate limiting
        await sleep(1000);
      } catch (error) {
        console.error('Error importing recipe:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${count} new recipes`,
      importedCount: count,
      newTotal: existingCount + count,
      recipes: importedRecipes,
      totalCount: filteredRecipes.length,
      savedCount: count,
      duplicateCount: filteredRecipes.length - count
    });
  } catch (error) {
    console.error('API management error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during recipe import',
    }, { status: 500 });
  }
}

/**
 * Handle backfill of recipe details
 */
async function backfillRecipesHandler(): Promise<NextResponse> {
  try {
    // Get recipe collection
    const recipesCollection = await getCollection(COLLECTIONS.RECIPES);

    // Find recipes that need backfill (missing extended ingredients or instructions)
    const incompleteRecipes = await recipesCollection.find({
      source: 'spoonacular',
      $or: [
        { extendedIngredients: { $exists: false } },
        { extendedIngredients: { $size: 0 } },
        { analyzedInstructions: { $exists: false } },
        { analyzedInstructions: { $size: 0 } }
      ]
    }, { 
      projection: { _id: 1, spoonacularId: 1, title: 1 },
      limit: 20 // Process in batches to avoid overloading
    }).toArray();

    if (incompleteRecipes.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No recipes need backfilling',
        backfilledCount: 0,
        totalChecked: 0
      });
    }

    // Process each incomplete recipe
    let backfilledCount = 0;
    const backfilledRecipes = [];

    for (const recipe of incompleteRecipes) {
      try {
        // Get the spoonacular ID
        const spoonId = recipe.spoonacularId || 
          (recipe._id ? String(recipe._id).replace('spoonacular-', '') : null);
        
        if (!spoonId) continue;

        // Fetch full recipe details
        const fullRecipe = await getSpoonacularRecipe(spoonId.toString());
        
        if (!fullRecipe) continue;

        // Update the recipe with missing details
        const updateResult = await recipesCollection.updateOne(
          { _id: recipe._id },
          { 
            $set: {
              extendedIngredients: fullRecipe.extendedIngredients,
              analyzedInstructions: fullRecipe.analyzedInstructions,
              cuisines: fullRecipe.cuisines,
              dishTypes: fullRecipe.dishTypes,
              diets: fullRecipe.diets,
              summary: fullRecipe.summary,
              readyInMinutes: fullRecipe.readyInMinutes,
              servings: fullRecipe.servings,
              updatedAt: new Date()
            } 
          }
        );

        if (updateResult.modifiedCount > 0) {
          backfilledCount++;
          backfilledRecipes.push({ 
            id: recipe._id, 
            title: recipe.title 
          });
        }

        // Add delay between API calls
        await sleep(1000);
      } catch (error) {
        console.error(`Error backfilling recipe ${recipe._id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully backfilled ${backfilledCount} recipes`,
      backfilledCount,
      recipes: backfilledRecipes,
      totalChecked: incompleteRecipes.length
    });
  } catch (error) {
    console.error('Backfill error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during backfill',
    }, { status: 500 });
  }
}

// HTTP Methods
export const POST = withAuth(importRecipesHandler, true);
export const PUT = withAuth(backfillRecipesHandler, true);