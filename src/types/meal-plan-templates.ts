/**
 * Meal Plan Template System Types
 * 
 * Professional template system for reusable meal plans
 */

import { IMealPlan, MealSlot, DayMeals } from './meal-planning';

export interface MealPlanTemplate {
  _id?: string;
  userId: string;
  name: string;
  description?: string;
  category: TemplateCategoryType;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  prepTime: number; // Total prep time in minutes
  servings: number; // Default servings
  
  // Template structure
  templateDays: TemplateDayMeals[];
  
  // Nutritional info (optional)
  estimatedCalories?: number;
  dietaryTags?: string[]; // vegetarian, vegan, gluten-free, etc.
  
  // Usage tracking
  usageCount: number;
  rating?: number; // Average user rating
  lastUsed?: Date;
  
  // Sharing and visibility
  isPublic: boolean;
  isOfficial: boolean; // Created by SmartPlates team
  
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateDayMeals {
  dayName: string; // Monday, Tuesday, etc.
  breakfast: TemplateMealSlot[];
  lunch: TemplateMealSlot[];
  dinner: TemplateMealSlot[];
  snacks: TemplateMealSlot[];
  notes?: string;
}

export interface TemplateMealSlot {
  recipeId?: string;
  recipeName: string;
  servings: number;
  notes?: string;
  isOptional?: boolean; // User can skip this meal
  alternatives?: TemplateMealSlot[]; // Alternative recipes
  cookingTime?: number;
  prepTime?: number;
  image?: string;
}

export type TemplateCategoryType = 
  | 'weekly-meal-prep'
  | 'family-friendly'
  | 'quick-meals'
  | 'diet-specific'
  | 'seasonal'
  | 'budget-friendly'
  | 'custom';

export interface TemplateFilter {
  category?: TemplateCategoryType;
  dietaryTags?: string[];
  maxPrepTime?: number;
  difficulty?: string[];
  tags?: string[];
  search?: string;
}

// Utility functions for templates
export function createTemplateFromMealPlan(
  mealPlan: IMealPlan, 
  templateName: string,
  category: TemplateCategoryType = 'custom'
): Omit<MealPlanTemplate, '_id' | 'createdAt' | 'updatedAt'> {
  return {
    userId: mealPlan.userId,
    name: templateName,
    category,
    tags: mealPlan.tags || [],
    difficulty: 'medium',
    prepTime: 0, // Calculate based on meals
    servings: 4, // Default
    templateDays: mealPlan.days.map(day => ({
      dayName: day.date.toLocaleDateString('en-US', { weekday: 'long' }),
      breakfast: day.breakfast.map(meal => ({
        ...meal,
        recipeName: meal.recipeName || 'Unknown Recipe',
        servings: meal.servings || 1
      })),
      lunch: day.lunch.map(meal => ({
        ...meal,
        recipeName: meal.recipeName || 'Unknown Recipe',
        servings: meal.servings || 1
      })),
      dinner: day.dinner.map(meal => ({
        ...meal,
        recipeName: meal.recipeName || 'Unknown Recipe',
        servings: meal.servings || 1
      })),
      snacks: day.snacks.map(meal => ({
        ...meal,
        recipeName: meal.recipeName || 'Unknown Recipe',
        servings: meal.servings || 1
      })),
      notes: day.dailyNotes
    })),
    usageCount: 0,
    isPublic: false,
    isOfficial: false
  };
}

export function applyTemplateToWeek(
  template: MealPlanTemplate,
  userId: string,
  weekStartDate: Date
): IMealPlan {
  const weekEndDate = new Date(weekStartDate.getTime() + (6 * 24 * 60 * 60 * 1000));
  const weekDates: Date[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStartDate);
    date.setDate(weekStartDate.getDate() + i);
    weekDates.push(date);
  }
  
  return {
    userId,
    weekStartDate,
    weekEndDate,
    title: `${template.name} - Week of ${weekStartDate.toLocaleDateString()}`,
    days: template.templateDays.map((templateDay, index) => ({
      date: weekDates[index],
      breakfast: templateDay.breakfast.map(meal => ({
        recipeId: meal.recipeId,
        recipeName: meal.recipeName,
        servings: meal.servings,
        notes: meal.notes,
        cookingTime: meal.cookingTime,
        prepTime: meal.prepTime,
        image: meal.image
      })),
      lunch: templateDay.lunch.map(meal => ({
        recipeId: meal.recipeId,
        recipeName: meal.recipeName,
        servings: meal.servings,
        notes: meal.notes,
        cookingTime: meal.cookingTime,
        prepTime: meal.prepTime,
        image: meal.image
      })),
      dinner: templateDay.dinner.map(meal => ({
        recipeId: meal.recipeId,
        recipeName: meal.recipeName,
        servings: meal.servings,
        notes: meal.notes,
        cookingTime: meal.cookingTime,
        prepTime: meal.prepTime,
        image: meal.image
      })),
      snacks: templateDay.snacks.map(meal => ({
        recipeId: meal.recipeId,
        recipeName: meal.recipeName,
        servings: meal.servings,
        notes: meal.notes,
        cookingTime: meal.cookingTime,
        prepTime: meal.prepTime,
        image: meal.image
      })),
      dailyNotes: templateDay.notes
    })),
    shoppingListGenerated: false,
    isTemplate: false,
    tags: [...template.tags],
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

export const DEFAULT_TEMPLATES: Partial<MealPlanTemplate>[] = [
  {
    name: "Quick & Easy Week",
    category: "quick-meals",
    description: "Simple meals that take 30 minutes or less",
    difficulty: "easy",
    prepTime: 180, // 3 hours total prep for week
    dietaryTags: ["quick", "easy"],
    isOfficial: true
  },
  {
    name: "Family Meal Prep",
    category: "family-friendly",
    description: "Nutritious meals perfect for families",
    difficulty: "medium",
    prepTime: 240, // 4 hours
    dietaryTags: ["family-friendly", "batch-cooking"],
    isOfficial: true
  },
  {
    name: "Vegetarian Delights",
    category: "diet-specific", 
    description: "Delicious plant-based meals for the week",
    difficulty: "medium",
    prepTime: 200,
    dietaryTags: ["vegetarian", "plant-based"],
    isOfficial: true
  }
];