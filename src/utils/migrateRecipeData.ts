/**
 * Recipe Migration Utility
 * 
 * Migrates existing recipes in MongoDB to include missing fields:
 * - cookingMinutes
 * - preparationMinutes
 */

import { connectToDatabase } from '@/lib/mongodb';
import Recipe from '@/models/Recipe';

interface SpoonacularRecipeDetails {
  id: number;
  title: string;
  preparationMinutes?: number;
  cookingMinutes?: number;
  readyInMinutes: number;
}

/**
 * Fetch recipe details from Spoonacular API
 */
async function fetchSpoonacularRecipeDetails(id: number): Promise<SpoonacularRecipeDetails | null> {
  try {
    const apiKey = process.env.SPOONACULAR_API_KEY;
    if (!apiKey) {
      throw new Error('SPOONACULAR_API_KEY is not configured');
    }

    const response = await fetch(
      `https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}&includeNutrition=false`
    );
    
    if (!response.ok) {
      console.error(`Failed to fetch recipe ${id}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    return {
      id: data.id,
      title: data.title,
      preparationMinutes: data.preparationMinutes || null,
      cookingMinutes: data.cookingMinutes || null,
      readyInMinutes: data.readyInMinutes
    };
    
  } catch (error) {
    console.error(`Error fetching recipe ${id}:`, error);
    return null;
  }
}

/**
 * Migrate recipes to include missing time fields
 */
export async function migrateRecipeTimeFields() {
  try {
    console.log('Starting recipe migration...');
    
    await connectToDatabase();
    
    // Get all Spoonacular recipes that don't have the new fields
    const recipesToUpdate = await Recipe.find({
      spoonacularId: { $exists: true, $ne: null },
      $or: [
        { cookingMinutes: { $exists: false } },
        { preparationMinutes: { $exists: false } },
        { cookingMinutes: null },
        { preparationMinutes: null }
      ]
    }).limit(50); // Process in batches to respect API limits
    
    console.log(`Found ${recipesToUpdate.length} recipes to update`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const recipe of recipesToUpdate) {
      try {
        console.log(`Processing: ${recipe.title} (ID: ${recipe.spoonacularId})`);
        
        // Skip if spoonacularId is not available
        if (!recipe.spoonacularId) {
          console.log(`⚠️ Skipping recipe without spoonacularId: ${recipe.title}`);
          continue;
        }
        
        // Fetch updated data from Spoonacular
        const spoonacularData = await fetchSpoonacularRecipeDetails(recipe.spoonacularId);
        
        if (spoonacularData) {
          // Update the recipe with missing fields
          await Recipe.findByIdAndUpdate(recipe._id, {
            $set: {
              cookingMinutes: spoonacularData.cookingMinutes,
              preparationMinutes: spoonacularData.preparationMinutes
            }
          });
          
          console.log(`✅ Updated: ${recipe.title}`);
          console.log(`   - Prep: ${spoonacularData.preparationMinutes || 'N/A'} min`);
          console.log(`   - Cook: ${spoonacularData.cookingMinutes || 'N/A'} min`);
          successCount++;
        } else {
          console.log(`❌ Failed to fetch data for: ${recipe.title}`);
          errorCount++;
        }
        
        // Rate limiting - wait 200ms between requests to respect API limits
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`❌ Error updating recipe ${recipe.title}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n📊 Migration completed:');
    console.log(`   - Successfully updated: ${successCount} recipes`);
    console.log(`   - Errors: ${errorCount} recipes`);
    console.log(`   - Total processed: ${recipesToUpdate.length} recipes`);
    
    return {
      success: true,
      processed: recipesToUpdate.length,
      successful: successCount,
      errors: errorCount
    };
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Validate migration results
 */
export async function validateMigration() {
  try {
    await connectToDatabase();
    
    const totalRecipes = await Recipe.countDocuments({ spoonacularId: { $exists: true } });
    const recipesWithCookingMinutes = await Recipe.countDocuments({ 
      spoonacularId: { $exists: true },
      cookingMinutes: { $exists: true, $ne: null }
    });
    const recipesWithPrepMinutes = await Recipe.countDocuments({ 
      spoonacularId: { $exists: true },
      preparationMinutes: { $exists: true, $ne: null }
    });
    
    console.log('\n📋 Migration Validation:');
    console.log(`   - Total Spoonacular recipes: ${totalRecipes}`);
    console.log(`   - Recipes with cookingMinutes: ${recipesWithCookingMinutes}`);
    console.log(`   - Recipes with preparationMinutes: ${recipesWithPrepMinutes}`);
    console.log(`   - Completion rate: ${Math.round((recipesWithCookingMinutes / totalRecipes) * 100)}%`);
    
    return {
      totalRecipes,
      recipesWithCookingMinutes,
      recipesWithPrepMinutes,
      completionRate: Math.round((recipesWithCookingMinutes / totalRecipes) * 100)
    };
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    return null;
  }
}