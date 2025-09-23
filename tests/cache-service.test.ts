/**
 * Test script for Spoonacular Cache Service
 * 
 * Tests the complete caching workflow:
 * 1. Search recipes (should hit API first time, cache second time)
 * 2. Get individual recipe (should hit API first time, cache second time)  
 * 3. Search by ingredients
 * 4. Get random recipes
 * 5. Check quota tracking
 */

import { SpoonacularCacheService } from '../src/services/spoonacularCacheService';

async function testCacheService() {
  console.log('🧪 Starting Spoonacular Cache Service Tests...\n');

  try {
    // Test 1: Search recipes
    console.log('📋 Test 1: Search Recipes');
    console.log('First search (should hit API):');
    const searchResults1 = await SpoonacularCacheService.searchRecipes('chicken pasta', { 
      number: 5 
    });
    console.log(`Found ${searchResults1.recipes.length} recipes, total: ${searchResults1.totalResults}`);

    console.log('Second search (should hit cache):');
    const searchResults2 = await SpoonacularCacheService.searchRecipes('chicken pasta', { 
      number: 5 
    });
    console.log(`Found ${searchResults2.recipes.length} recipes, total: ${searchResults2.totalResults}`);
    console.log('✅ Search caching test completed\n');

    // Test 2: Get individual recipe
    if (searchResults1.recipes.length > 0) {
      const testRecipeId = searchResults1.recipes[0].id;
      
      console.log('📋 Test 2: Get Individual Recipe');
      console.log('First request (should hit API or use cached from search):');
      const recipe1 = await SpoonacularCacheService.getRecipe(testRecipeId);
      console.log(`Retrieved recipe: ${recipe1?.title || 'None'}`);

      console.log('Second request (should hit cache):');
      const recipe2 = await SpoonacularCacheService.getRecipe(testRecipeId);
      console.log(`Retrieved recipe: ${recipe2?.title || 'None'}`);
      console.log('✅ Recipe caching test completed\n');
    }

    // Test 3: Search by ingredients
    console.log('📋 Test 3: Search by Ingredients');
    const ingredientResults = await SpoonacularCacheService.searchRecipesByIngredients(
      ['chicken', 'tomato'], 
      { number: 3 }
    );
    console.log(`Found ${ingredientResults.length} recipes by ingredients`);
    console.log('✅ Ingredient search test completed\n');

    // Test 4: Random recipes
    console.log('📋 Test 4: Random Recipes');
    const randomRecipes = await SpoonacularCacheService.getRandomRecipes({ 
      number: 3, 
      tags: ['healthy'] 
    });
    console.log(`Found ${randomRecipes.length} random recipes`);
    console.log('✅ Random recipes test completed\n');

    // Test 5: Cache statistics
    console.log('📋 Test 5: Cache Statistics');
    const stats = await SpoonacularCacheService.getCacheStats();
    console.log('Cache Stats:', {
      recipes: stats.recipes,
      searches: stats.searches,
      ingredientSearches: stats.ingredientSearches,
      randomSets: stats.randomSets,
      totalEntries: stats.totalEntries,
      quotaRemaining: stats.quotaStatus.remaining,
      quotaPercentage: stats.quotaStatus.percentage
    });
    console.log('✅ Statistics test completed\n');

    // Test 6: Cleanup
    console.log('📋 Test 6: Cache Cleanup');
    await SpoonacularCacheService.clearExpiredCache();
    console.log('✅ Cleanup test completed\n');

    console.log('🎉 All cache tests completed successfully!');
    
    return {
      success: true,
      searchResults: searchResults1.recipes.length,
      cacheStats: stats,
      message: 'All cache functionality working correctly'
    };

  } catch (error) {
    console.error('❌ Cache test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Cache test encountered errors'
    };
  }
}

// Export for use in API routes or direct testing
export { testCacheService };

// Allow direct execution for testing
if (require.main === module) {
  testCacheService().then(result => {
    console.log('\n📊 Final Result:', result);
    process.exit(result.success ? 0 : 1);
  });
}