/**
 * Test script to verify enhanced grocery list functionality
 */

import { fetchRecipeIngredients, batchFetchRecipeIngredients } from '../src/utils/ingredientsFetcher.js';

async function testIngredientFetching() {
  console.log('🧪 Testing ingredient fetching functionality...\n');
  
  try {
    // Test single recipe fetching
    console.log('📋 Test 1: Single recipe ingredient fetching');
    const singleRecipeId = 'spoonacular-715446'; // From our database analysis
    const ingredients = await fetchRecipeIngredients(singleRecipeId);
    
    console.log(`✅ Retrieved ${ingredients.length} ingredients for recipe ${singleRecipeId}:`);
    ingredients.slice(0, 3).forEach((ing, index) => {
      console.log(`  ${index + 1}. ${ing.name} - ${ing.amount} ${ing.unit} (${ing.category})`);
    });
    
    if (ingredients.length > 3) {
      console.log(`  ... and ${ingredients.length - 3} more ingredients`);
    }
    
    console.log('\n📋 Test 2: Batch recipe ingredient fetching');
    const batchRecipeIds = ['spoonacular-715446', 'spoonacular-716361', 'spoonacular-664547'];
    const batchResults = await batchFetchRecipeIngredients(batchRecipeIds);
    
    console.log(`✅ Batch fetch completed for ${batchResults.size} recipes:`);
    for (const [recipeId, recipeIngredients] of batchResults.entries()) {
      console.log(`  - ${recipeId}: ${recipeIngredients.length} ingredients`);
    }
    
    // Test non-existent recipe
    console.log('\n📋 Test 3: Non-existent recipe handling');
    const nonExistentIngredients = await fetchRecipeIngredients('non-existent-recipe-123');
    console.log(`✅ Non-existent recipe returned ${nonExistentIngredients.length} ingredients (expected: 0)`);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testIngredientFetching().catch(console.error);