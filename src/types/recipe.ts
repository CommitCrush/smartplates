/**
 * Recipe TypeScript Types & Interfaces
 * 
 * Defines the data structure for recipes in SmartPlates.
 * Used for type safety throughout the application.
 */


// Angepasst an Spoonacular-API
export interface Recipe {
  _id?: string;
  id: number | string;
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
