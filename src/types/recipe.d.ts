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

// Recipe ingredient with quantity and unit
export interface RecipeIngredient {
  id?: string;                       // Unique ingredient ID
  name: string;                      // Ingredient name (e.g., "flour")
  quantity?: number;                 // Amount needed (e.g., 2) - optional for flexibility
  amount?: number;                   // Alternative property name for amount
  unit?: string;                     // Unit of measurement (e.g., "cups", "kg")
  notes?: string;                    // Optional notes (e.g., "finely chopped")
}

// Recipe instruction step
export interface RecipeStep {
  id?: string;                       // Unique step ID
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
  carbohydrates?: number;            // Alternative property name for carbs
  fat?: number;                      // Fat in grams
  fiber?: number;                    // Fiber in grams
}

// Main Recipe interface - represents a recipe in our database
export interface Recipe {
  _id?: ObjectId | string;           // MongoDB ObjectId or string
  id?: string | number;              // Alternative ID field (Spoonacular compatibility)
  title: string;                     // Recipe name
  description: string;               // Short description of the recipe
  
  // Recipe details
  ingredients: RecipeIngredient[] | string;   // List of ingredients with quantities or string
  instructions: RecipeStep[] | string;        // Step-by-step cooking instructions or string
  
  // Recipe metadata
  difficulty?: RecipeDifficulty;      // How hard is it to make (optional)
  mealType?: MealType;                // What meal is this for (optional)
  category?: string;                  // Alternative category field
  cuisine?: string;                   // Cuisine type
  servings: number;                   // How many people it serves
  prepTime?: number;                  // Preparation time in minutes
  cookTime?: number;                  // Cooking time in minutes
  totalTime?: number;                 // Total time (prep + cook)
  
  // Media and presentation
  image?: string;                     // Main recipe image URL
  images?: string[];                  // Additional images
  video?: string;                     // Recipe video URL
  
  // Categorization
  categoryId?: ObjectId | string;     // Reference to Category (optional)
  tags?: string[];                    // Array of tags (e.g., ["vegetarian", "gluten-free"])
  dietaryRestrictions?: string[];     // Alternative dietary restrictions field
  
  // User and social
  authorId?: ObjectId | string;       // Reference to User who created it (optional)
  authorName?: string;                // Author name
  isPublic?: boolean;                 // Whether recipe is publicly visible
  isPublished?: boolean;              // Alternative published field
  rating?: number;                    // Average rating (0-5)
  ratingCount?: number;               // Number of ratings
  ratingsCount?: number;              // Alternative ratings count field
  likesCount?: number;                // Number of likes
  
  // Additional info
  nutrition?: RecipeNutrition;        // Nutritional information
  notes?: string;                     // Additional notes or tips
  
  // Spoonacular API compatibility (optional fields)
  summary?: string;                   // Recipe summary from Spoonacular
  dishTypes?: string[];               // Dish types (main course, side dish, etc.)
  diets?: string[];                   // Diet labels (vegetarian, vegan, etc.)
  readyInMinutes?: number;            // Ready time from Spoonacular
  cookingMinutes?: number;            // Cooking time from Spoonacular
  spoonacularScore?: number;          // Spoonacular rating score
  
  // Timestamps
  createdAt?: Date | string;          // When recipe was created (optional)
  updatedAt?: Date | string;          // Last time recipe was updated (optional)
}

// Recipe creation input (what we need when creating a new recipe)
export interface CreateRecipeInput {
  title: string;
  description: string;
  ingredients: RecipeIngredient[];
  instructions: RecipeStep[];
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
