/**
 * Meal Plan Model for SmartPlates
 * 
 * Database operations for meal plans including CRUD operations
 * and grocery list generation support.
 */

import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/db';
import { MealPlan, CreateMealPlanInput, UpdateMealPlanInput, DayMealPlan } from '@/types/mealplan';

/**
 * Creates a new meal plan in the database
 * @param mealPlanData - Meal plan creation data
 * @returns Created meal plan with database ID
 */
export async function createMealPlan(mealPlanData: CreateMealPlanInput): Promise<MealPlan> {
  const db = await connectToDatabase();
  
  // Generate week structure based on start/end dates
  const days: DayMealPlan[] = generateWeekDays(mealPlanData.startDate, mealPlanData.endDate);
  
  const mealPlan: Omit<MealPlan, '_id'> = {
    ...mealPlanData,
    userId: new ObjectId(mealPlanData.userId),
    days,
    isActive: false,
    isTemplate: mealPlanData.isTemplate || false,
    isPublic: mealPlanData.isPublic || false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await db.collection('mealPlans').insertOne(mealPlan);
  
  return {
    ...mealPlan,
    _id: result.insertedId
  };
}

/**
 * Updates an existing meal plan
 * @param mealPlanId - Meal plan ID to update
 * @param updateData - Meal plan update data
 * @returns Updated meal plan or null if not found
 */
export async function updateMealPlan(
  mealPlanId: string, 
  updateData: UpdateMealPlanInput
): Promise<MealPlan | null> {
  const db = await connectToDatabase();
  
  const result = await db.collection('mealPlans').findOneAndUpdate(
    { _id: new ObjectId(mealPlanId) },
    { 
      $set: { 
        ...updateData, 
        updatedAt: new Date() 
      } 
    },
    { returnDocument: 'after' }
  );
  
  return result;
}

/**
 * Gets a meal plan by ID
 * @param mealPlanId - Meal plan ID to retrieve
 * @returns Meal plan or null if not found
 */
export async function getMealPlanById(mealPlanId: string): Promise<MealPlan | null> {
  const db = await connectToDatabase();
  
  const mealPlan = await db.collection('mealPlans').findOne({
    _id: new ObjectId(mealPlanId)
  });
  
  return mealPlan;
}

/**
 * Gets all meal plans for a user
 * @param userId - User ID
 * @param page - Page number (1-based)
 * @param limit - Number of results per page
 * @returns Array of meal plans
 */
export async function getMealPlansByUser(
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<MealPlan[]> {
  const db = await connectToDatabase();
  
  const mealPlans = await db.collection('mealPlans')
    .find({ userId: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();
  
  return mealPlans;
}

/**
 * Gets the active meal plan for a user
 * @param userId - User ID
 * @returns Active meal plan or null if none
 */
export async function getActiveMealPlan(userId: string): Promise<MealPlan | null> {
  const db = await connectToDatabase();
  
  const mealPlan = await db.collection('mealPlans').findOne({
    userId: new ObjectId(userId),
    isActive: true
  });
  
  return mealPlan;
}

/**
 * Sets a meal plan as active (deactivates others)
 * @param mealPlanId - Meal plan ID to activate
 * @param userId - User ID (for authorization)
 * @returns Updated meal plan or null if not found
 */
export async function setActiveMealPlan(mealPlanId: string, userId: string): Promise<MealPlan | null> {
  const db = await connectToDatabase();
  
  // First, deactivate all other meal plans for this user
  await db.collection('mealPlans').updateMany(
    { userId: new ObjectId(userId) },
    { $set: { isActive: false, updatedAt: new Date() } }
  );
  
  // Then activate the specified meal plan
  const result = await db.collection('mealPlans').findOneAndUpdate(
    { 
      _id: new ObjectId(mealPlanId),
      userId: new ObjectId(userId)
    },
    { 
      $set: { 
        isActive: true,
        updatedAt: new Date()
      } 
    },
    { returnDocument: 'after' }
  );
  
  return result;
}

/**
 * Deletes a meal plan
 * @param mealPlanId - ID of the meal plan to delete
 * @param userId - User ID (for authorization)
 * @returns True if deleted, false if not found or unauthorized
 */
export async function deleteMealPlan(mealPlanId: string, userId: string): Promise<boolean> {
  const db = await connectToDatabase();
  
  const result = await db.collection('mealPlans').deleteOne({
    _id: new ObjectId(mealPlanId),
    userId: new ObjectId(userId)
  });
  
  return result.deletedCount > 0;
}

/**
 * Adds a recipe to a specific meal slot
 * @param mealPlanId - Meal plan ID
 * @param day - Day of the week
 * @param mealType - Type of meal (breakfast, lunch, dinner, snack)
 * @param recipeId - Recipe to add
 * @param servings - Number of servings
 * @returns Updated meal plan or null if not found
 */
export async function addRecipeToMealPlan(
  mealPlanId: string,
  dayIndex: number,
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  recipeId: string,
  recipeName: string,
  servings: number = 1
): Promise<MealPlan | null> {
  const db = await connectToDatabase();
  
  const result = await db.collection('mealPlans').findOneAndUpdate(
    { _id: new ObjectId(mealPlanId) },
    { 
      $set: { 
        [`days.${dayIndex}.meals.${mealType}`]: {
          recipeId: new ObjectId(recipeId),
          recipeName,
          servings,
          notes: ''
        },
        updatedAt: new Date()
      } 
    },
    { returnDocument: 'after' }
  );
  
  return result;
}

/**
 * Removes a recipe from a meal slot
 * @param mealPlanId - Meal plan ID
 * @param dayIndex - Day index (0-6)
 * @param mealType - Type of meal
 * @returns Updated meal plan or null if not found
 */
export async function removeRecipeFromMealPlan(
  mealPlanId: string,
  dayIndex: number,
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
): Promise<MealPlan | null> {
  const db = await connectToDatabase();
  
  const result = await db.collection('mealPlans').findOneAndUpdate(
    { _id: new ObjectId(mealPlanId) },
    { 
      $unset: { 
        [`days.${dayIndex}.meals.${mealType}`]: ''
      },
      $set: {
        updatedAt: new Date()
      }
    },
    { returnDocument: 'after' }
  );
  
  return result;
}

// Helper function to generate week days structure
function generateWeekDays(startDate: Date, endDate: Date): DayMealPlan[] {
  const days: DayMealPlan[] = [];
  const weekDays: Array<keyof typeof import('@/types/mealplan').WeekDay> = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];
  
  const current = new Date(startDate);
  let dayIndex = 0;
  
  while (current <= endDate && dayIndex < 7) {
    days.push({
      date: new Date(current),
      day: weekDays[dayIndex] as any,
      meals: {}
    });
    
    current.setDate(current.getDate() + 1);
    dayIndex++;
  }
  
  return days;
}