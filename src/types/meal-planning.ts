/**
 * Client-Safe Meal Planning Types & Utilities
 * 
 * This file contains types and utility functions that can be safely used
 * in both client and server components without Mongoose dependencies.
 */

// ========================================
// TypeScript Interfaces
// ========================================

/**
 * Recipe ingredient interface
 */
export interface RecipeIngredient {
  id?: number;
  name: string;
  amount?: number;
  unit?: string;
  nameClean?: string;
}

/**
 * Recipe interface for meal planning
 */
export interface Recipe {
  id?: string | number;
  title: string;
  image?: string;
  readyInMinutes?: number;
  servings?: number;
  extendedIngredients?: RecipeIngredient[];
  instructions?: string;
  summary?: string;
  cuisines?: string[];
  diets?: string[];
  dishTypes?: string[];
}

/**
 * Individual meal slot within a day
 */
export interface MealSlot {
  recipeId?: string; // Reference to Recipe (will be populated later)
  recipeName?: string; // For display purposes and mock data
  name?: string; // Alternative name field
  servings?: number; // Number of servings planned
  notes?: string; // User notes for this meal
  cookingTime?: number; // In minutes
  prepTime?: number; // In minutes
  image?: string; // Recipe image URL
  recipe?: Recipe; // Full recipe data when populated
  ingredients?: RecipeIngredient[]; // Direct ingredients list
  tags?: string[]; // Optional tags used in UI
  planId?: string; // Optional plan reference used in UI
}

/**
 * Extended meal slot for planning operations
 */
export interface MealPlanningSlot extends MealSlot {
  dayOfWeek?: number; // Day index (0-6) for weekly planning
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snacks'; // Meal type
  tags?: string[]; // Recipe tags
  targetDate?: Date; // Target date when adding from monthly calendar
}

/**
 * Meal type enum for type safety
 */
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

/**
 * Drag and drop item type for react-dnd
 */
export interface DragDropItemType {
  id: string;
  content: MealSlot;
  mealType: MealType;
  dayIndex: number;
}

/**
 * All meals for a single day
 */
export interface DayMeals {
  date: Date;
  breakfast: MealSlot[];
  lunch: MealSlot[];
  dinner: MealSlot[];
  snacks: MealSlot[];
  dailyNotes?: string; // Notes for the entire day
}

/**
 * Complete meal plan for a week
 */
export interface IMealPlan {
  _id?: string; // MongoDB ObjectId as string
  userId: string;
  weekStartDate: Date; // Monday of the week
  weekEndDate: Date; // Sunday of the week
  title?: string; // User-defined name for the meal plan
  days: DayMeals[]; // 7 days of meals
  totalCalories?: number; // Calculated total (optional)
  shoppingListGenerated?: boolean; // Has shopping list been created
  isTemplate?: boolean; // Can be used as a template for future weeks
  tags?: string[]; // User tags for organization
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// Utility Functions
// ========================================

/**
 * Get the start of the week (Monday) for any given date
 * Timezone-safe version that doesn't modify the original date
 */
export function getWeekStartDate(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()); // Create new date without time
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0); // Ensure time is set to start of day
  return d;
}

/**
 * Get all dates in a week starting from a given Monday
 * Timezone-safe version that creates proper local dates
 */
export function getWeekDates(weekStartDate: Date): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    // Create new date based on year, month, day to avoid timezone issues
    const date = new Date(
      weekStartDate.getFullYear(),
      weekStartDate.getMonth(), 
      weekStartDate.getDate() + i
    );
    date.setHours(0, 0, 0, 0); // Ensure time is set to start of day
    dates.push(date);
  }
  return dates;
}

/**
 * Format week range for display
 */
export function formatWeekRange(weekStartDate: Date): string {
  const weekEndDate = new Date(weekStartDate.getTime() + (6 * 24 * 60 * 60 * 1000));
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric' 
  };
  const startStr = weekStartDate.toLocaleDateString('en-US', options);
  const endStr = weekEndDate.toLocaleDateString('en-US', options);
  return `${startStr} - ${endStr}`;
}

/**
 * Get the current week's start date (Monday)
 */
export function getCurrentWeekStart(): Date {
  return getWeekStartDate(new Date());
}

/**
 * Create an empty meal plan structure for a given week
 */
export function createEmptyMealPlan(userId: string, weekStartDate: Date): IMealPlan {
  const weekEndDate = new Date(weekStartDate.getTime() + (6 * 24 * 60 * 60 * 1000));
  const weekDates = getWeekDates(weekStartDate);
  
  return {
    userId,
    weekStartDate,
    weekEndDate,
    title: `Week of ${weekStartDate.toLocaleDateString()}`,
    days: weekDates.map(date => ({
      date,
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: []
    })),
    shoppingListGenerated: false,
    isTemplate: false,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Get day names for the week
 */
export function getDayNames(): string[] {
  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
}

/**
 * Get abbreviated day names
 */
export function getShortDayNames(): string[] {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
}