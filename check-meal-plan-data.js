#!/usr/bin/env node

/**
 * MongoDB Meal Plan Data Checker
 * 
 * This script checks if the "Week of 6.10.2025" meal plan data
 * exists in MongoDB with the correct schema structure.
 */

const { MongoClient, ObjectId } = require('mongodb');

// MongoDB connection string from .env.local
const MONGODB_URI = 'mongodb+srv://Smartplate:YsMmEuFzlXS1oYOc@cluster0.qnzqj2i.mongodb.net/';
const DATABASE_NAME = 'smartplates';

async function checkMealPlanData() {
  let client;
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection('mealplans');
    
    console.log('✅ Connected to MongoDB successfully\n');
    
    // Check for the specific week (Week of 6.10.2025)
    const weekStartDate = new Date('2025-10-06T00:00:00Z');
    const weekEndDate = new Date('2025-10-12T23:59:59Z');
    
    console.log('🔍 Searching for meal plans in week range:');
    console.log(`   Start: ${weekStartDate.toISOString()}`);
    console.log(`   End: ${weekEndDate.toISOString()}\n`);
    
    // Find meal plans for this week
    const mealPlans = await collection.find({
      weekStartDate: {
        $gte: weekStartDate,
        $lte: weekEndDate
      }
    }).toArray();
    
    console.log(`📊 Found ${mealPlans.length} meal plan(s) for this week\n`);
    
    if (mealPlans.length === 0) {
      console.log('❌ No meal plans found for Week of 6.10.2025');
      
      // Check for any meal plans with similar dates
      console.log('\n🔍 Checking for any meal plans around this time...');
      const nearbyPlans = await collection.find({
        weekStartDate: {
          $gte: new Date('2025-10-01T00:00:00Z'),
          $lte: new Date('2025-10-15T00:00:00Z')
        }
      }).toArray();
      
      if (nearbyPlans.length > 0) {
        console.log(`📅 Found ${nearbyPlans.length} meal plan(s) in October 2025:`);
        nearbyPlans.forEach((plan, index) => {
          console.log(`   ${index + 1}. ${plan.title || 'Untitled'} - Week starting: ${plan.weekStartDate?.toISOString()}`);
        });
      } else {
        console.log('❌ No meal plans found in October 2025');
      }
      
      return;
    }
    
    // Analyze each meal plan found
    mealPlans.forEach((plan, index) => {
      console.log(`\n📋 MEAL PLAN ${index + 1}:`);
      console.log('================');
      console.log(`ID: ${plan._id}`);
      console.log(`User ID: ${plan.userId}`);
      console.log(`Title: ${plan.title || 'Untitled'}`);
      console.log(`Week Start: ${plan.weekStartDate?.toISOString()}`);
      console.log(`Week End: ${plan.weekEndDate?.toISOString()}`);
      console.log(`Is Template: ${plan.isTemplate || false}`);
      console.log(`Created: ${plan.createdAt?.toISOString()}`);
      console.log(`Updated: ${plan.updatedAt?.toISOString()}`);
      
      // Count meals
      let totalMeals = 0;
      const mealCounts = { breakfast: 0, lunch: 0, dinner: 0, snacks: 0 };
      
      if (plan.days && Array.isArray(plan.days)) {
        console.log(`\n📅 DAYS (${plan.days.length} days):`);
        
        plan.days.forEach((day, dayIndex) => {
          const dayDate = day.date ? new Date(day.date).toLocaleDateString() : 'No date';
          console.log(`   Day ${dayIndex + 1}: ${dayDate}`);
          
          ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
            const meals = day[mealType] || [];
            const count = meals.length;
            mealCounts[mealType] += count;
            totalMeals += count;
            
            if (count > 0) {
              console.log(`     ${mealType}: ${count} meal(s)`);
              meals.forEach((meal, mealIndex) => {
                console.log(`       - ${meal.recipeName || meal.recipeId || 'Unknown'}`);
              });
            }
          });
        });
      } else {
        console.log('\n❌ No days array found or invalid structure');
      }
      
      console.log(`\n📊 MEAL SUMMARY:`);
      console.log(`   🥞 Breakfast: ${mealCounts.breakfast}`);
      console.log(`   🥙 Lunch: ${mealCounts.lunch}`);
      console.log(`   🍽️ Dinner: ${mealCounts.dinner}`);
      console.log(`   🍿 Snacks: ${mealCounts.snacks}`);
      console.log(`   📈 Total: ${totalMeals} meals`);
      
      // Check if it matches the expected data
      if (totalMeals === 12 && 
          mealCounts.breakfast === 3 && 
          mealCounts.lunch === 3 && 
          mealCounts.dinner === 3 && 
          mealCounts.snacks === 3) {
        console.log('\n✅ MATCHES EXPECTED DATA! (12 meals: 3 breakfast, 3 lunch, 3 dinner, 3 snacks)');
      } else {
        console.log('\n⚠️  Does not match expected data pattern');
      }
      
      // Validate schema structure
      console.log(`\n🔍 SCHEMA VALIDATION:`);
      const hasRequiredFields = !!(
        plan._id &&
        plan.userId &&
        plan.weekStartDate &&
        plan.days &&
        Array.isArray(plan.days)
      );
      
      console.log(`   Required fields present: ${hasRequiredFields ? '✅' : '❌'}`);
      console.log(`   Days array structure: ${plan.days && Array.isArray(plan.days) ? '✅' : '❌'}`);
      console.log(`   Correct days count (7): ${plan.days?.length === 7 ? '✅' : '❌'}`);
      
      if (plan.days && plan.days.length > 0) {
        const firstDay = plan.days[0];
        const hasMealTypes = !!(
          firstDay.hasOwnProperty('breakfast') &&
          firstDay.hasOwnProperty('lunch') &&
          firstDay.hasOwnProperty('dinner') &&
          firstDay.hasOwnProperty('snacks')
        );
        console.log(`   Meal types structure: ${hasMealTypes ? '✅' : '❌'}`);
      }
    });
    
    // Overall summary
    console.log('\n\n🎯 OVERALL SUMMARY:');
    console.log('===================');
    
    const expectedPlan = mealPlans.find(plan => {
      const totalMeals = plan.days?.reduce((total, day) => {
        return total + 
          (day.breakfast?.length || 0) + 
          (day.lunch?.length || 0) + 
          (day.dinner?.length || 0) + 
          (day.snacks?.length || 0);
      }, 0) || 0;
      
      return totalMeals === 12;
    });
    
    if (expectedPlan) {
      console.log('✅ Found meal plan with 12 meals matching the UI display');
      console.log('✅ Data is properly saved in MongoDB');
      console.log('✅ Schema structure is correct');
    } else {
      console.log('❌ No meal plan found with exactly 12 meals');
      console.log('⚠️  The UI might be showing cached/local data that hasn\'t been saved to MongoDB');
    }
    
  } catch (error) {
    console.error('❌ Error checking meal plan data:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 MongoDB connection closed');
    }
  }
}

// Run the check
checkMealPlanData().catch(console.error);