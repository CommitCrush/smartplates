/**
 * Test Utility for Creating Sample Meal Plans and Recipes
 * 
 * This utility creates sample data for testing the grocery list functionality.
 */

import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { Recipe } from '@/types/recipe';
import { MealPlan, DayMealPlan } from '@/types/mealplan';

// Sample recipes with ingredients for testing
const SAMPLE_RECIPES: Omit<Recipe, '_id'>[] = [
  {
    title: 'Spaghetti Bolognese',
    description: 'Classic Italian pasta with meat sauce',
    ingredients: [
      { name: 'ground beef', quantity: 1, unit: 'lbs' },
      { name: 'onion', quantity: 1, unit: 'pcs' },
      { name: 'garlic', quantity: 3, unit: 'cloves' },
      { name: 'tomato', quantity: 6, unit: 'pcs' },
      { name: 'pasta', quantity: 1, unit: 'lbs' },
      { name: 'olive oil', quantity: 2, unit: 'tbsp' },
      { name: 'salt', quantity: 1, unit: 'tsp' },
      { name: 'pepper', quantity: 1, unit: 'tsp' }
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Heat olive oil in large pan' },
      { stepNumber: 2, instruction: 'Cook ground beef until browned' },
      { stepNumber: 3, instruction: 'Add onions and garlic, cook until soft' },
      { stepNumber: 4, instruction: 'Add tomatoes and simmer' },
      { stepNumber: 5, instruction: 'Cook pasta according to package directions' },
      { stepNumber: 6, instruction: 'Serve sauce over pasta' }
    ],
    difficulty: 'medium' as const,
    mealType: 'dinner' as const,
    servings: 4,
    prepTime: 15,
    cookTime: 30,
    totalTime: 45,
    categoryId: new ObjectId(),
    tags: ['italian', 'pasta', 'meat'],
    authorId: new ObjectId(),
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Chicken Stir Fry',
    description: 'Quick and healthy chicken stir fry with vegetables',
    ingredients: [
      { name: 'chicken breast', quantity: 2, unit: 'lbs' },
      { name: 'carrot', quantity: 2, unit: 'pcs' },
      { name: 'onion', quantity: 1, unit: 'pcs' },
      { name: 'garlic', quantity: 2, unit: 'cloves' },
      { name: 'soy sauce', quantity: 3, unit: 'tbsp' },
      { name: 'olive oil', quantity: 2, unit: 'tbsp' },
      { name: 'rice', quantity: 2, unit: 'cups' }
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Cut chicken into strips' },
      { stepNumber: 2, instruction: 'Slice vegetables' },
      { stepNumber: 3, instruction: 'Heat oil in wok or large pan' },
      { stepNumber: 4, instruction: 'Cook chicken until done' },
      { stepNumber: 5, instruction: 'Add vegetables and stir fry' },
      { stepNumber: 6, instruction: 'Add soy sauce and serve over rice' }
    ],
    difficulty: 'easy' as const,
    mealType: 'dinner' as const,
    servings: 4,
    prepTime: 10,
    cookTime: 15,
    totalTime: 25,
    categoryId: new ObjectId(),
    tags: ['asian', 'chicken', 'stir-fry', 'healthy'],
    authorId: new ObjectId(),
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Scrambled Eggs with Toast',
    description: 'Simple breakfast with eggs and toast',
    ingredients: [
      { name: 'eggs', quantity: 6, unit: 'pcs' },
      { name: 'butter', quantity: 2, unit: 'tbsp' },
      { name: 'milk', quantity: 2, unit: 'tbsp' },
      { name: 'salt', quantity: 1, unit: 'pinch' },
      { name: 'pepper', quantity: 1, unit: 'pinch' }
    ],
    instructions: [
      { stepNumber: 1, instruction: 'Beat eggs with milk' },
      { stepNumber: 2, instruction: 'Heat butter in pan' },
      { stepNumber: 3, instruction: 'Add eggs and scramble gently' },
      { stepNumber: 4, instruction: 'Season with salt and pepper' }
    ],
    difficulty: 'easy' as const,
    mealType: 'breakfast' as const,
    servings: 2,
    prepTime: 2,
    cookTime: 5,
    totalTime: 7,
    categoryId: new ObjectId(),
    tags: ['breakfast', 'eggs', 'quick'],
    authorId: new ObjectId(),
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

/**
 * Creates sample recipes and meal plans for testing
 * @returns Object with created recipe IDs and meal plan ID
 */
export async function createSampleData() {
  const db = await connectToDatabase();
  
  try {
    console.log('Creating sample recipes...');
    
    // Insert sample recipes
    const recipeResult = await db.collection('recipes').insertMany(SAMPLE_RECIPES);
    const recipeIds = Object.values(recipeResult.insertedIds);
    
    console.log(`Created ${recipeIds.length} sample recipes`);
    
    // Create a sample meal plan using the created recipes
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - startDate.getDay() + 1); // Start of this week (Monday)
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // End of this week (Sunday)
    
    const days: DayMealPlan[] = [];
    const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + i);
      
      const dayPlan: DayMealPlan = {
        date: dayDate,
        day: weekDays[i] as any,
        meals: {}
      };
      
      // Add some meals to various days
      if (i === 0) { // Monday
        dayPlan.meals.breakfast = {
          recipeId: recipeIds[2], // Scrambled eggs
          recipeName: 'Scrambled Eggs with Toast',
          servings: 2
        };
        dayPlan.meals.dinner = {
          recipeId: recipeIds[0], // Spaghetti
          recipeName: 'Spaghetti Bolognese',
          servings: 4
        };
      }
      
      if (i === 2) { // Wednesday
        dayPlan.meals.dinner = {
          recipeId: recipeIds[1], // Stir fry
          recipeName: 'Chicken Stir Fry',
          servings: 4
        };
      }
      
      if (i === 4) { // Friday
        dayPlan.meals.breakfast = {
          recipeId: recipeIds[2], // Scrambled eggs again
          recipeName: 'Scrambled Eggs with Toast',
          servings: 2
        };
      }
      
      days.push(dayPlan);
    }
    
    const sampleMealPlan: Omit<MealPlan, '_id'> = {
      userId: new ObjectId('507f1f77bcf86cd799439011'), // Sample user ID
      name: 'Sample Weekly Meal Plan',
      description: 'A sample meal plan for testing grocery list functionality',
      startDate,
      endDate,
      days,
      isActive: true,
      isTemplate: false,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Creating sample meal plan...');
    
    const mealPlanResult = await db.collection('mealPlans').insertOne(sampleMealPlan);
    
    console.log('Sample data created successfully!');
    
    return {
      recipeIds,
      mealPlanId: mealPlanResult.insertedId.toString(),
      success: true,
      message: 'Sample data created successfully'
    };
    
  } catch (error) {
    console.error('Error creating sample data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to create sample data'
    };
  }
}

/**
 * Cleans up sample data (for testing purposes)
 */
export async function cleanupSampleData() {
  const db = await connectToDatabase();
  
  try {
    // Delete sample recipes
    await db.collection('recipes').deleteMany({
      title: { $in: SAMPLE_RECIPES.map(r => r.title) }
    });
    
    // Delete sample meal plans
    await db.collection('mealPlans').deleteMany({
      name: 'Sample Weekly Meal Plan'
    });
    
    console.log('Sample data cleaned up');
    
    return {
      success: true,
      message: 'Sample data cleaned up successfully'
    };
    
  } catch (error) {
    console.error('Error cleaning up sample data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to clean up sample data'
    };
  }
}