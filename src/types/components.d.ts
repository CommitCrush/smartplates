/**
 * Component Type Definitions for SmartPlates
 * 
 * This file defines all component-related types used throughout the application.
 * Reusable TypeScript interfaces for React components.
 */

import React from 'react';
import { Recipe } from './recipe';

// Recipe Actions Component Types
export interface RecipeActionsProps {
  recipe: Recipe;
  contentRef: React.RefObject<HTMLDivElement | null>;
  currentServings: number;
}

// Normalized ingredient format for shopping list
export interface NormalizedIngredient {
  name: string;
  quantity: number | string;
  unit: string;
}

// Recipe Detail Component Types
export interface RecipeDetailProps {
  recipe: Recipe;
}

// Community Recipe Detail Component Types
export interface CommunityRecipeDetailProps {
  recipe: Recipe;
}

// Extended Recipe interface for community recipes with additional properties
export interface CommunityRecipe extends Recipe {
  difficulty?: string;
  category?: string;
  source?: string;
  tags?: string[];
  author?: string;
}

// Recipe Header Component Types
export interface RecipeHeaderProps {
  recipe: Recipe;
}

// Recipe Ingredients Component Types
export interface RecipeIngredientsProps {
  recipe: Recipe;
  currentServings: number;
  setCurrentServings: (servings: number) => void;
}

// Recipe Instructions Component Types
export interface RecipeInstructionsProps {
  instructions: Array<{
    number: number;
    step: string;
  }>;
}

// Recipe Nutrition Component Types
export interface RecipeNutritionProps {
  nutrition: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
}

// Event Handler Types
export interface ImageErrorHandler {
  (e: React.SyntheticEvent<HTMLImageElement, Event>): void;
}

export interface ShareHandler {
  (): Promise<void>;
}

export interface DownloadPdfHandler {
  (): void;
}

export interface PrintHandler {
  (): void;
}

export interface AddToShoppingListHandler {
  (): Promise<void>;
}