#!/usr/bin/env node

// Test script to verify enhanced grocery list functionality via API
console.log('🔄 Testing enhanced grocery list functionality via API...');

async function testIngredientAPI() {
  try {
    // Test the API endpoint with some sample recipe IDs
    const testRecipeIds = ['656329', '715538', '644387']; // Sample Spoonacular IDs
    
    console.log('🔍 Testing API with recipe IDs:', testRecipeIds);
    
    const response = await fetch('http://localhost:3000/api/ingredients/batch-fetch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipeIds: testRecipeIds }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ API Response:', {
        success: result.success,
        message: result.message,
        recipeCount: Object.keys(result.data || {}).length
      });

      if (result.success && result.data) {
        Object.entries(result.data).forEach(([recipeId, ingredients]) => {
          console.log(`  📋 Recipe ${recipeId}: ${Array.isArray(ingredients) ? ingredients.length : 0} ingredients`);
          if (Array.isArray(ingredients) && ingredients.length > 0) {
            console.log(`    📝 First ingredient: ${JSON.stringify(ingredients[0])}`);
          }
        });
        
        const totalIngredients = Object.values(result.data)
          .reduce((total, ingredients) => total + (Array.isArray(ingredients) ? ingredients.length : 0), 0);
        
        if (totalIngredients > 0) {
          console.log('✅ Enhanced grocery list functionality is working!');
          console.log(`📊 Total ingredients found: ${totalIngredients}`);
        } else {
          console.log('⚠️ No ingredients found in any recipes - may need to check data structure');
        }
      } else {
        console.log('⚠️ API returned no data');
      }
    } else {
      console.error('❌ API call failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Only run if the server is accessible
testIngredientAPI();