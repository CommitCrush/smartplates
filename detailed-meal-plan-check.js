const { MongoClient } = require('mongodb');

async function checkMealPlanData() {
  const uri = "mongodb+srv://Smartplate:YsMmEuFzlXS1oYOc@cluster0.qnzqj2i.mongodb.net/";
  const client = new MongoClient(uri);

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB successfully\n');

    const db = client.db('smartplates');
    const collection = db.collection('mealplans');

    // First, let's see all meal plans
    console.log('📋 All meal plans in database:');
    const allPlans = await collection.find({}).toArray();
    console.log(`   Found ${allPlans.length} total meal plan(s)\n`);

    for (let i = 0; i < allPlans.length; i++) {
      const plan = allPlans[i];
      console.log(`📄 Meal Plan ${i + 1}:`);
      console.log(`   ID: ${plan._id}`);
      console.log(`   Title: ${plan.title}`);
      console.log(`   User ID: ${plan.userId}`);
      console.log(`   Week Start: ${plan.weekStartDate}`);
      console.log(`   Week Start (ISO): ${new Date(plan.weekStartDate).toISOString()}`);
      
      if (plan.days && plan.days.length > 0) {
        console.log(`   Days: ${plan.days.length}`);
        
        // Count meals by type
        let totalMeals = 0;
        let breakfastCount = 0;
        let lunchCount = 0;
        let dinnerCount = 0;
        let snacksCount = 0;
        
        plan.days.forEach(day => {
          if (day.breakfast) {
            breakfastCount += day.breakfast.length;
            totalMeals += day.breakfast.length;
          }
          if (day.lunch) {
            lunchCount += day.lunch.length;
            totalMeals += day.lunch.length;
          }
          if (day.dinner) {
            dinnerCount += day.dinner.length;
            totalMeals += day.dinner.length;
          }
          if (day.snacks) {
            snacksCount += day.snacks.length;
            totalMeals += day.snacks.length;
          }
        });
        
        console.log(`   Total Meals: ${totalMeals}`);
        console.log(`   🥞 Breakfast: ${breakfastCount}`);
        console.log(`   🥙 Lunch: ${lunchCount}`);
        console.log(`   🍽️ Dinner: ${dinnerCount}`);
        console.log(`   🍿 Snacks: ${snacksCount}`);
        
        // Show first day's structure as example
        if (plan.days[0]) {
          console.log(`   First day structure:`);
          console.log(`     Date: ${plan.days[0].date}`);
          console.log(`     Breakfast items: ${plan.days[0].breakfast ? plan.days[0].breakfast.length : 0}`);
          console.log(`     Lunch items: ${plan.days[0].lunch ? plan.days[0].lunch.length : 0}`);
          console.log(`     Dinner items: ${plan.days[0].dinner ? plan.days[0].dinner.length : 0}`);
          console.log(`     Snacks items: ${plan.days[0].snacks ? plan.days[0].snacks.length : 0}`);
          
          // Show one meal example if exists
          if (plan.days[0].breakfast && plan.days[0].breakfast.length > 0) {
            const meal = plan.days[0].breakfast[0];
            console.log(`   Example meal (breakfast):`, {
              recipeId: meal.recipeId,
              recipeName: meal.recipeName || meal.recipe?.title,
              servings: meal.servings,
              notes: meal.notes
            });
          }
        }
      }
      
      console.log(`   Created: ${plan.createdAt}`);
      console.log(`   Updated: ${plan.updatedAt}`);
      console.log(`   Is Template: ${plan.isTemplate || false}`);
      console.log('   ---\n');
    }

    // Check if this matches the expected schema
    console.log('🔍 Schema Validation:');
    const expectedFields = [
      '_id', 'userId', 'weekStartDate', 'title', 'days', 
      'createdAt', 'updatedAt', 'isTemplate'
    ];
    
    if (allPlans.length > 0) {
      const plan = allPlans[0];
      console.log('   Checking first meal plan against expected schema...');
      
      expectedFields.forEach(field => {
        const hasField = plan.hasOwnProperty(field);
        console.log(`   ✓ ${field}: ${hasField ? '✅' : '❌'}`);
      });
      
      // Check days structure
      if (plan.days && plan.days.length > 0) {
        const day = plan.days[0];
        const expectedDayFields = ['date', 'breakfast', 'lunch', 'dinner', 'snacks'];
        console.log('   Checking day structure:');
        expectedDayFields.forEach(field => {
          const hasField = day.hasOwnProperty(field);
          console.log(`     ✓ ${field}: ${hasField ? '✅' : '❌'}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

checkMealPlanData();