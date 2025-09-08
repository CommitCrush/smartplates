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

// Recipe ingredient with quantity and unit
export interface RecipeIngredient {
  name: string;                      // Ingredient name (e.g., "flour")
  quantity: number;                  // Amount needed (e.g., 2)
  unit: string;                      // Unit of measurement (e.g., "cups", "kg")
  notes?: string;                    // Optional notes (e.g., "finely chopped")
}

// Recipe instruction step
export interface RecipeStep {
  stepNumber: number;                // Step order (1, 2, 3...)
  instruction: string;               // What to do in this step
  duration?: number;                 // Time for this step in minutes (optional)
  temperature?: number;              // Cooking temperature (optional)
}

// Recipe nutrition information
export interface RecipeNutrition {
  calories?: number;                 // Calories per serving
  protein?: number;                  // Protein in grams
  carbs?: number;                    // Carbohydrates in grams
  fat?: number;                      // Fat in grams
  fiber?: number;                    // Fiber in grams
}

// Main Recipe interface - represents a recipe in our database
export interface Recipe {
  _id?: ObjectId | string;           // MongoDB ObjectId or string
  title: string;                     // Recipe name
  description: string;               // Short description of the recipe
  
  // Recipe details
  ingredients: RecipeIngredient[];   // List of ingredients with quantities
  instructions: RecipeStep[];        // Step-by-step cooking instructions
  
  // Recipe metadata
  difficulty: RecipeDifficulty;      // How hard is it to make
  mealType: MealType;                // What meal is this for
  servings: number;                  // How many people it serves
  prepTime: number;                  // Preparation time in minutes
  cookTime: number;                  // Cooking time in minutes
  totalTime: number;                 // Total time (prep + cook)
  
  // Media and presentation
  image?: string;                    // Main recipe image URL
  images?: string[];                 // Additional images
  video?: string;                    // Recipe video URL
  
  // Categorization
  categoryId: ObjectId | string;     // Reference to Category
  tags: string[];                    // Array of tags (e.g., ["vegetarian", "gluten-free"])
  
  // User and social
  authorId: ObjectId | string;       // Reference to User who created it
  isPublic: boolean;                 // Whether recipe is publicly visible
  rating?: number;                   // Average rating (0-5)
  ratingCount?: number;              // Number of ratings
  
  // Additional info
  nutrition?: RecipeNutrition;       // Nutritional information
  notes?: string;                    // Additional notes or tips
  
  // Timestamps
  createdAt: Date;                   // When recipe was created
  updatedAt: Date;                   // Last time recipe was updated
}

// Recipe creation input (what we need when creating a new recipe)
export interface CreateRecipeInput {
  title: string;
  description: string;
  ingredients: RecipeIngredient[];
  instructions: RecipeStep[];
  difficulty: RecipeDifficulty;
  mealType: MealType;
  servings: number;
  prepTime: number;
  cookTime: number;
  categoryId: ObjectId | string;
  tags: string[];
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
  ingredients?: RecipeIngredient[];
  instructions?: RecipeStep[];
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
