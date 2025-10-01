/**
 * Recipe TypeScript Types & Interfaces
 * 
 * Defines the data structure for recipes in SmartPlates.
 * Used for type safety throughout the application.
 */


// Spoonacular-kompatibles Recipe-Interface
export interface Recipe {
  _id?: string;
  id?: string | number;
  title: string;
  description: string;
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
}

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
