/**
 * Recipe Type Definitions for SmartPlates
 * 
 * This file defines all recipe-related types used throughout the application.
 * Clean, reusable TypeScript interfaces for better code quality.
 */

import { ObjectId } from 'mongodb';

// Recipe difficulty levels
export type RecipeDifficulty = 'easy' | 'medium' | 'hard';

// Recipe meal types
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';

// Recipe categories
export type RecipeCategory = 'breakfast' | 'lunch' | 'dinner' | 'dessert' | 'snack' | 'appetizer';

// Dietary restrictions
export type DietaryRestriction = 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'nut-free' | 'keto' | 'paleo';


// Main Recipe interface - represents a recipe in our database
export interface Recipe {
  _id?: ObjectId | string;           // MongoDB ObjectId or string
  id?: string | number;              // Alternative ID field (Spoonacular compatibility)
  title: string;                     // Recipe name
  description: string;               // Short description of the recipe
  
  // Recipe details
  summary: string;
  image?: string;
  readyInMinutes: number;
  servings: number;
    extendedIngredients: RecipeIngredient[];
    analyzedInstructions: RecipeInstructionBlock[];
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  nutrition?: RecipeNutrition;
  // Optionale Felder für User-Interaktion
  rating?: number;
  ratingsCount?: number;
  likesCount?: number;
  authorId?: string;
  authorName?: string;
  createdAt?: string;
  updatedAt?: string;
  isPublished?: boolean;
  
  
  
  isPending?: boolean;
  moderationNotes?: string;
  

export interface RecipeIngredient {
  id: number | string;
  name: string;
  amount: number;
  unit: string;
  notes?: string;
}

export interface RecipeInstructionBlock {
  name?: string;
  steps: RecipeInstruction[];
}

export interface RecipeInstruction {
  number: number;
  step: string;
}

export interface RecipeNutrition {
  nutrients: Array<{
    name: string;
    amount: number;
    unit: string;
  }>;
}
  
  
  
  // Recipe metadata

// Recipe creation input (what we need when creating a new recipe)
export interface CreateRecipeInput {
  title: string;
  description: string;
  extendedIngredients: RecipeIngredient[];
  analyzedInstructions: RecipeInstructionBlock[];
  difficulty: RecipeDifficulty;
  mealType: MealType;
  category?: string;                 // Alternative category field
  cuisine?: string;                  // Cuisine type
  servings: number;
  prepTime: number;
  cookTime: number;
  categoryId: ObjectId | string;
  tags: string[];
  dietaryRestrictions?: string[];    // Dietary restrictions array
  authorId: ObjectId | string;
  isPublic?: boolean;                // Optional, defaults to true
  image?: string;
  images?: string[];
  video?: string;
  nutrition?: RecipeNutrition;
  notes?: string;
}

// Recipe update input (what can be updated)
export interface UpdateRecipeInput {
  title?: string;
  description?: string;
  extendedIngredients?: RecipeIngredient[];
  analyzedInstructions?: RecipeInstructionBlock[];
  difficulty?: RecipeDifficulty;
  mealType?: MealType;
  servings?: number;
  prepTime?: number;
  cookTime?: number;
  categoryId?: ObjectId | string;
  tags?: string[];
  isPublic?: boolean;
  image?: string;
  images?: string[];
  video?: string;
  nutrition?: RecipeNutrition;
  notes?: string;
}

// Recipe search/filter criteria
export interface RecipeFilter {
  categoryId?: ObjectId | string;
  difficulty?: RecipeDifficulty;
  mealType?: MealType;
  maxPrepTime?: number;
  maxCookTime?: number;
  tags?: string[];
  authorId?: ObjectId | string;
  isPublic?: boolean;
  searchTerm?: string;
}

// Public recipe card info (for listings)
export interface RecipeCard {
  _id: ObjectId | string;
  title: string;
  description: string;
  image?: string;
  difficulty: RecipeDifficulty;
  totalTime: number;
  servings: number;
  rating?: number;
  authorName: string;
  tags: string[];
}
