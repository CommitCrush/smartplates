/**
 * Meal Plan Type Definitions for SmartPlates
 * 
 * This file defines all meal plan and grocery list related types
 * used throughout the application.
 */

import { ObjectId } from 'mongodb';

// Time slots for meals during the day
export type MealTimeSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

// Days of the week for meal planning
export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// Single meal assignment for a specific day and time slot
export interface MealAssignment {
  recipeId: ObjectId | string;        // Reference to Recipe
  recipeName: string;                 // Cached recipe name for quick display
  servings: number;                   // Number of servings for this meal
  notes?: string;                     // Optional notes for this meal assignment
}

// Daily meal plan structure
export interface DayMealPlan {
  date: Date;                         // The date this plan is for
  day: WeekDay;                       // Day of the week
  meals: {
    breakfast?: MealAssignment;
    lunch?: MealAssignment;
    dinner?: MealAssignment;
    snack?: MealAssignment;
  };
}

// Weekly meal plan structure
export interface MealPlan {
  _id?: ObjectId | string;            // MongoDB ObjectId
  userId: ObjectId | string;          // Owner of the meal plan
  name: string;                       // Name of the meal plan (e.g., "Week of Jan 15-21")
  description?: string;               // Optional description
  
  // Week planning
  startDate: Date;                    // Start of the week (Monday)
  endDate: Date;                      // End of the week (Sunday)
  days: DayMealPlan[];               // Array of daily meal plans
  
  // Status and sharing
  isActive: boolean;                  // Is this the current active meal plan
  isTemplate: boolean;                // Can this be reused as a template
  isPublic: boolean;                 // Is this meal plan public/shareable
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Meal plan creation input
export interface CreateMealPlanInput {
  userId: ObjectId | string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  isTemplate?: boolean;
  isPublic?: boolean;
}

// Meal plan update input
export interface UpdateMealPlanInput {
  name?: string;
  description?: string;
  days?: DayMealPlan[];
  isActive?: boolean;
  isTemplate?: boolean;
  isPublic?: boolean;
}

// Grocery list item with aggregated quantities
export interface GroceryItem {
  name: string;                       // Ingredient name (normalized)
  displayName: string;               // Display name (can include brand, etc.)
  quantity: number;                  // Total quantity needed
  unit: string;                      // Unit of measurement
  category?: string;                 // Grocery category (produce, dairy, etc.)
  estimatedCost?: number;            // Estimated cost (optional)
  isPurchased: boolean;              // Checked off status
  notes?: string;                    // Additional notes
  recipes: string[];                 // Which recipes this ingredient comes from
}

// Complete grocery list generated from meal plan
export interface GroceryList {
  _id?: ObjectId | string;
  mealPlanId: ObjectId | string;     // Reference to source meal plan
  userId: ObjectId | string;         // Owner of the grocery list
  name: string;                      // Name of the grocery list
  
  // Grocery items organized by category
  items: GroceryItem[];
  categories: {
    [category: string]: GroceryItem[];
  };
  
  // Summary information
  totalEstimatedCost?: number;
  itemsCount: number;
  purchasedCount: number;
  
  // Status
  isCompleted: boolean;              // All items purchased
  
  // Timestamps
  generatedAt: Date;
  lastUpdated: Date;
}

// Grocery list generation options
export interface GroceryListOptions {
  includeEstimates?: boolean;        // Include cost estimates
  categorizeItems?: boolean;         // Group by grocery categories
  mergeSimilarItems?: boolean;       // Merge similar ingredients (e.g., different units)
  excludeStaples?: boolean;          // Exclude basic ingredients (salt, pepper, etc.)
}

// Export options for grocery lists
export interface GroceryListExportOptions {
  format: 'pdf' | 'text' | 'json';
  includeCosts?: boolean;
  includeRecipeNames?: boolean;
  groupByCategory?: boolean;
  includeCheckboxes?: boolean;       // For printed lists
}