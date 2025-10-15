// Debug script to check meal plan data
import { MongoClient, ObjectId } from 'mongodb';

async function debugMealPlan() {
  const client = new MongoClient('mongodb+srv://Smartplate:YsMmEuFzlXS1oYOc@cluster0.qnzqj2i.mongodb.net/', {
    serverApi: { version: '1', strict: true, deprecationErrors: true }
  });

  try {
    await client.connect();
    const db = client.db('smartplates');
    const mealPlansCollection = db.collection('mealplans');

    console.log('🔍 Debugging meal plan data...\n');

    // Find meal plan by ID
    const mealPlanId = '68eaba68ecac730ee175d7b1';
    const mealPlan = await mealPlansCollection.findOne({ _id: new ObjectId(mealPlanId) });

    if (!mealPlan) {
      console.log('❌ Meal plan not found!');
      return;
    }

    console.log('📋 Meal Plan Found:');
    console.log('ID:', mealPlan._id);
    console.log('Title:', mealPlan.title);
    console.log('Week Start:', mealPlan.weekStartDate);
    console.log('User ID:', mealPlan.userId);
    console.log('Days Count:', mealPlan.days?.length || 0);

    if (mealPlan.days) {
      console.log('\n📅 Days Analysis:');
      mealPlan.days.forEach((day, index) => {
        const dayMeals = {
          breakfast: day.breakfast?.length || 0,
          lunch: day.lunch?.length || 0,
          dinner: day.dinner?.length || 0,
          snacks: day.snacks?.length || 0
        };
        const totalMeals = dayMeals.breakfast + dayMeals.lunch + dayMeals.dinner + dayMeals.snacks;
        
        console.log(`Day ${index + 1} (${day.date}):`, totalMeals, 'meals ->', dayMeals);
        
        // Show first few meals
        if (day.breakfast?.length > 0) {
          console.log('  Breakfast:', day.breakfast.map(m => m.recipeName || m.name).join(', '));
        }
        if (day.lunch?.length > 0) {
          console.log('  Lunch:', day.lunch.map(m => m.recipeName || m.name).join(', '));
        }
        if (day.dinner?.length > 0) {
          console.log('  Dinner:', day.dinner.map(m => m.recipeName || m.name).join(', '));
        }
        if (day.snacks?.length > 0) {
          console.log('  Snacks:', day.snacks.map(m => m.recipeName || m.name).join(', '));
        }
      });
    }

    // Check for week range
    const weekStart = new Date(mealPlan.weekStartDate);
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    console.log('\n📆 Week Range:');
    console.log('Start:', weekStart.toDateString());
    console.log('End:', weekEnd.toDateString());

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

debugMealPlan();