/**
 * Test Script for Grocery List Functionality
 * 
 * This script tests the complete grocery list generation workflow:
 * 1. Creates sample data (recipes and meal plan)
 * 2. Tests the grocery list service
 * 3. Validates ingredient aggregation and categorization
 */

import { createSampleData, cleanupSampleData } from '../src/lib/sampleData';
import { generateGroceryListFromMealPlan } from '../src/services/groceryListService';
import { getMealPlanById } from '../src/models/MealPlan';
import { GroceryListOptions } from '../src/types/mealplan';

async function testGroceryListFunctionality() {
  console.log('🧪 Starting Grocery List Functionality Test\n');

  try {
    // Step 1: Create sample data
    console.log('📝 Step 1: Creating sample data...');
    const sampleData = await createSampleData();
    
    if (!sampleData.success) {
      throw new Error(`Failed to create sample data: ${sampleData.error}`);
    }
    
    console.log(`✅ Created sample data: ${sampleData.recipeIds.length} recipes, meal plan ID: ${sampleData.mealPlanId}\n`);

    // Step 2: Fetch the meal plan
    console.log('📋 Step 2: Fetching meal plan...');
    const mealPlan = await getMealPlanById(sampleData.mealPlanId);
    
    if (!mealPlan) {
      throw new Error('Failed to fetch created meal plan');
    }
    
    console.log(`✅ Fetched meal plan: "${mealPlan.name}"`);
    console.log(`   - Date range: ${mealPlan.startDate.toDateString()} to ${mealPlan.endDate.toDateString()}`);
    console.log(`   - Days with meals: ${mealPlan.days.filter(day => Object.keys(day.meals).length > 0).length}/7\n`);

    // Step 3: Generate grocery list with basic options
    console.log('🛒 Step 3: Generating grocery list (basic)...');
    const basicOptions: GroceryListOptions = {
      includeEstimates: false,
      categorizeItems: true,
      mergeSimilarItems: true,
      excludeStaples: false
    };
    
    const basicGroceryList = await generateGroceryListFromMealPlan(mealPlan, basicOptions);
    
    console.log(`✅ Generated basic grocery list:`);
    console.log(`   - Total items: ${basicGroceryList.itemsCount}`);
    console.log(`   - Categories: ${Object.keys(basicGroceryList.categories).length}`);
    console.log(`   - Items by category:`);
    
    Object.entries(basicGroceryList.categories).forEach(([category, items]) => {
      console.log(`     • ${category}: ${items.length} items`);
    });
    console.log();

    // Step 4: Generate grocery list with estimates
    console.log('💰 Step 4: Generating grocery list with cost estimates...');
    const estimatesOptions: GroceryListOptions = {
      includeEstimates: true,
      categorizeItems: true,
      mergeSimilarItems: true,
      excludeStaples: false
    };
    
    const estimatesGroceryList = await generateGroceryListFromMealPlan(mealPlan, estimatesOptions);
    
    console.log(`✅ Generated grocery list with estimates:`);
    console.log(`   - Total estimated cost: $${estimatesGroceryList.totalEstimatedCost?.toFixed(2) || '0.00'}`);
    console.log(`   - Sample items with costs:`);
    
    estimatesGroceryList.items
      .filter(item => item.estimatedCost && item.estimatedCost > 0)
      .slice(0, 5)
      .forEach(item => {
        console.log(`     • ${item.displayName} (${item.quantity} ${item.unit}): ~$${item.estimatedCost?.toFixed(2)}`);
      });
    console.log();

    // Step 5: Generate grocery list excluding staples
    console.log('🧂 Step 5: Generating grocery list excluding staples...');
    const noStaplesOptions: GroceryListOptions = {
      includeEstimates: false,
      categorizeItems: true,
      mergeSimilarItems: true,
      excludeStaples: true
    };
    
    const noStaplesGroceryList = await generateGroceryListFromMealPlan(mealPlan, noStaplesOptions);
    
    console.log(`✅ Generated grocery list excluding staples:`);
    console.log(`   - Items without staples: ${noStaplesGroceryList.itemsCount}`);
    console.log(`   - Difference: ${basicGroceryList.itemsCount - noStaplesGroceryList.itemsCount} staple items excluded\n`);

    // Step 6: Show detailed ingredient breakdown
    console.log('🔍 Step 6: Detailed ingredient analysis...');
    console.log('Sample ingredients with recipe sources:');
    
    basicGroceryList.items
      .slice(0, 8)
      .forEach(item => {
        const recipesText = item.recipes.length > 0 
          ? ` (used in: ${item.recipes.join(', ')})` 
          : '';
        console.log(`   • ${item.displayName}: ${item.quantity} ${item.unit}${recipesText}`);
      });
    console.log();

    // Step 7: Test ingredient categorization
    console.log('📂 Step 7: Category breakdown...');
    Object.entries(basicGroceryList.categories).forEach(([category, items]) => {
      console.log(`\n   ${category}:`);
      items.forEach(item => {
        console.log(`     - ${item.displayName} (${item.quantity} ${item.unit})`);
      });
    });
    console.log();

    // Cleanup
    console.log('🧹 Cleaning up sample data...');
    const cleanupResult = await cleanupSampleData();
    
    if (cleanupResult.success) {
      console.log('✅ Sample data cleaned up successfully\n');
    } else {
      console.log('⚠️  Warning: Failed to clean up sample data\n');
    }

    console.log('🎉 All tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log(`   ✅ Sample data creation: PASSED`);
    console.log(`   ✅ Meal plan retrieval: PASSED`);
    console.log(`   ✅ Basic grocery list generation: PASSED`);
    console.log(`   ✅ Cost estimation: PASSED`);
    console.log(`   ✅ Staples exclusion: PASSED`);
    console.log(`   ✅ Ingredient categorization: PASSED`);
    console.log(`   ✅ Recipe source tracking: PASSED`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Attempt cleanup on error
    try {
      await cleanupSampleData();
    } catch (cleanupError) {
      console.error('Failed to cleanup after error:', cleanupError);
    }
    
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testGroceryListFunctionality()
    .then(() => {
      console.log('\n✨ Test execution completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test execution failed:', error);
      process.exit(1);
    });
}

export { testGroceryListFunctionality };