/**
 * Script to check spoonacular_recipes collection extendedIngredients structure
 * This will help us understand why the grocery list generation isn't finding ingredients
 */

import { MongoClient } from 'mongodb';

// MongoDB connection using same config as the app
const MONGODB_URI = process.env.MONGODB_URL || 'mongodb+srv://Smartplate:YsMmEuFzlXS1oYOc@cluster0.qnzqj2i.mongodb.net/';
const DATABASE_NAME = 'smartplates';

async function checkSpoonacularIngredients() {
  let client;
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DATABASE_NAME);
    console.log(`✅ Connected to database: ${DATABASE_NAME}`);
    
    // Check if spoonacular_recipes collection exists
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    console.log('\n📂 Available collections:', collectionNames);
    
    if (!collectionNames.includes('spoonacular_recipes')) {
      console.log('❌ spoonacular_recipes collection not found');
      console.log('Available collections:', collectionNames);
      return;
    }
    
    const collection = db.collection('spoonacular_recipes');
    
    // Get total count
    const totalCount = await collection.countDocuments();
    console.log(`\n📊 Total recipes in spoonacular_recipes: ${totalCount}`);
    
    // Check recipes with extendedIngredients
    const withExtendedIngredients = await collection.countDocuments({
      extendedIngredients: { $exists: true, $ne: null, $not: { $size: 0 } }
    });
    console.log(`🥕 Recipes with extendedIngredients: ${withExtendedIngredients}`);
    
    // Check recipes without extendedIngredients
    const withoutExtendedIngredients = await collection.countDocuments({
      $or: [
        { extendedIngredients: { $exists: false } },
        { extendedIngredients: null },
        { extendedIngredients: { $size: 0 } }
      ]
    });
    console.log(`❌ Recipes without extendedIngredients: ${withoutExtendedIngredients}`);
    
    // Sample a few recipes to see their structure
    console.log('\n🔍 Sample recipes with extendedIngredients:');
    const sampleRecipes = await collection.find({
      extendedIngredients: { $exists: true, $ne: null, $not: { $size: 0 } }
    }).limit(3).toArray();
    
    sampleRecipes.forEach((recipe, index) => {
      console.log(`\n--- Recipe ${index + 1}: ${recipe.title} ---`);
      console.log(`ID: ${recipe._id}`);
      console.log(`SpoonacularId: ${recipe.id || recipe.spoonacularId}`);
      console.log(`ExtendedIngredients count: ${recipe.extendedIngredients?.length || 0}`);
      
      if (recipe.extendedIngredients && recipe.extendedIngredients.length > 0) {
        console.log('First ingredient structure:');
        const firstIngredient = recipe.extendedIngredients[0];
        console.log('  - id:', firstIngredient.id);
        console.log('  - name:', firstIngredient.name);
        console.log('  - nameClean:', firstIngredient.nameClean);
        console.log('  - original:', firstIngredient.original);
        console.log('  - amount:', firstIngredient.amount);
        console.log('  - unit:', firstIngredient.unit);
        console.log('  - aisle:', firstIngredient.aisle);
        console.log('  - measures:', firstIngredient.measures ? 'exists' : 'missing');
        
        if (firstIngredient.measures) {
          console.log('  - measures.metric:', firstIngredient.measures.metric);
          console.log('  - measures.us:', firstIngredient.measures.us);
        }
      }
    });
    
    // Check what collections have meal plan data
    console.log('\n🍽️ Checking meal plan collections...');
    const mealPlanCollections = ['mealplans', 'meal_plans', 'userMealPlans'];
    
    for (const collName of mealPlanCollections) {
      if (collectionNames.includes(collName)) {
        const count = await db.collection(collName).countDocuments();
        console.log(`📋 ${collName}: ${count} documents`);
        
        if (count > 0) {
          // Sample one meal plan to see structure
          const sampleMealPlan = await db.collection(collName).findOne();
          console.log(`Sample ${collName} structure:`, {
            _id: sampleMealPlan._id,
            userId: sampleMealPlan.userId,
            daysCount: sampleMealPlan.days?.length || 0,
            hasWeekStartDate: !!sampleMealPlan.weekStartDate,
            sampleDay: sampleMealPlan.days?.[0] ? {
              date: sampleMealPlan.days[0].date,
              breakfast: sampleMealPlan.days[0].breakfast?.length || 0,
              lunch: sampleMealPlan.days[0].lunch?.length || 0,
              dinner: sampleMealPlan.days[0].dinner?.length || 0,
              snacks: sampleMealPlan.days[0].snacks?.length || 0,
            } : 'no days'
          });
          
          // Check meal structure in meal plans
          if (sampleMealPlan.days && sampleMealPlan.days.length > 0) {
            const dayWithMeals = sampleMealPlan.days.find(day => 
              (day.breakfast && day.breakfast.length > 0) ||
              (day.lunch && day.lunch.length > 0) ||
              (day.dinner && day.dinner.length > 0) ||
              (day.snacks && day.snacks.length > 0)
            );
            
            if (dayWithMeals) {
              console.log('\n🍽️ Sample meal structure in meal plan:');
              const allMeals = [
                ...(dayWithMeals.breakfast || []),
                ...(dayWithMeals.lunch || []),
                ...(dayWithMeals.dinner || []),
                ...(dayWithMeals.snacks || [])
              ];
              
              if (allMeals.length > 0) {
                const sampleMeal = allMeals[0];
                console.log('Sample meal:', {
                  recipeId: sampleMeal.recipeId,
                  recipeName: sampleMeal.recipeName,
                  hasIngredients: !!sampleMeal.ingredients,
                  ingredientsCount: sampleMeal.ingredients?.length || 0,
                  hasRecipe: !!sampleMeal.recipe,
                  recipeHasExtendedIngredients: !!sampleMeal.recipe?.extendedIngredients,
                  ingredientsSample: sampleMeal.ingredients?.slice(0, 2) || []
                });
              }
            }
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking ingredients:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n✅ Database connection closed');
    }
  }
}

// Run the check
checkSpoonacularIngredients().catch(console.error);