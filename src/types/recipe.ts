/**
 * Recipe TypeScript Types & Interfaces
 * 
 * Defines the data structure for recipes in SmartPlates.
 * Used for type safety throughout the application.
 */

export type RecipeDifficulty = 'easy' | 'medium' | 'hard';
export type RecipeCategory = 'breakfast' | 'lunch' | 'dinner' | 'dessert' | 'snack' | 'appetizer';
export type DietaryRestriction = 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'nut-free' | 'keto' | 'paleo';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image?: string;
  
  // Recipe Details
  servings: number;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  totalTime: number; // in minutes
  difficulty: RecipeDifficulty;
  
  // Categorization
  category: RecipeCategory;
  cuisine?: string; // e.g., 'italian', 'asian', 'mexican'
  dietaryRestrictions: DietaryRestriction[];
  tags: string[];
  
  // Ingredients & Instructions
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  
  // Nutrition (optional)
  nutrition?: RecipeNutrition;
  
  // User Interaction
  rating: number; // average rating 0-5
  ratingsCount: number;
  likesCount: number;
  
  // Author & Timestamps
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  
  // Admin fields
  isPublished: boolean;
  isPending?: boolean;
  moderationNotes?: string;
}

export interface RecipeIngredient {
  id: string;
  name: string;
  amount: number;
  unit: string; // e.g., 'cups', 'grams', 'pieces'
  notes?: string; // e.g., 'finely chopped', 'room temperature'
  category?: 'protein' | 'vegetable' | 'grain' | 'dairy' | 'spice' | 'other';
}

export interface RecipeInstruction {
  id: string;
  stepNumber: number;
  instruction: string;
  duration?: number; // optional time for this step in minutes
  temperature?: number; // optional temperature in celsius
  image?: string; // optional step image
}

export interface RecipeNutrition {
  calories: number;
  protein: number; // in grams
  carbohydrates: number; // in grams
  fat: number; // in grams
  fiber?: number; // in grams
  sugar?: number; // in grams
  sodium?: number; // in mg
}

// Category interface
export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  image?: string;
  color?: string;
  recipeCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Form types for creating/editing recipes
export interface CreateRecipeInput {
  title: string;
  description: string;
  image?: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: RecipeDifficulty;
  category: RecipeCategory;
  cuisine?: string;
  dietaryRestrictions: DietaryRestriction[];
  tags: string[];
  ingredients: Omit<RecipeIngredient, 'id'>[];
  instructions: Omit<RecipeInstruction, 'id'>[];
  nutrition?: RecipeNutrition;
}

export interface UpdateRecipeInput extends Partial<CreateRecipeInput> {
  id: string;
}

// Search and filter types
export interface RecipeSearchFilters {
  query?: string;
  category?: RecipeCategory[];
  difficulty?: RecipeDifficulty[];
  dietaryRestrictions?: DietaryRestriction[];
  maxPrepTime?: number;
  maxCookTime?: number;
  cuisine?: string[];
  tags?: string[];
  minRating?: number;
}

export interface RecipeSearchResult {
  recipes: Recipe[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Recipe interaction types
export interface RecipeRating {
  id: string;
  recipeId: string;
  userId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
}

export interface RecipeLike {
  id: string;
  recipeId: string;
  userId: string;
  createdAt: string;
}

// Meal planning types
export interface MealPlanRecipe {
  recipeId: string;
  recipe: Recipe;
  servings: number;
  notes?: string;
}

export interface MealPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  meals: {
    [date: string]: {
      breakfast?: MealPlanRecipe;
      lunch?: MealPlanRecipe;
      dinner?: MealPlanRecipe;
      snacks?: MealPlanRecipe[];
    };
  };
  createdAt: string;
  updatedAt: string;
}

// Shopping list types
export interface ShoppingListItem {
  id: string;
  ingredient: string;
  amount: number;
  unit: string;
  category: string;
  isCompleted: boolean;
  recipeIds: string[]; // which recipes this ingredient is from
}

export interface ShoppingList {
  id: string;
  userId: string;
  name: string;
  mealPlanId?: string;
  items: ShoppingListItem[];
  createdAt: string;
  updatedAt: string;
}
