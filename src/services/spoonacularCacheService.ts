/**
 * Client-Safe Spoonacular Cache Service
 * 
 * This module provides client-safe access to cached Spoonacular data
 * and prevents MongoDB client-side bundling issues
 */

import 'server-only';
import { Recipe } from '@/types/recipe';
import { RecipeFilters } from './spoonacularService';
import {
  getCacheStats as getCacheStatsServer,
  getPopularRecipesWithCache as getPopularRecipesWithCacheServer,
  getQuotaStatus as getQuotaStatusServer,
  getRecipeWithCache as getRecipeWithCacheServer,
  searchRecipesByIngredientsInternal as searchRecipesByIngredientsInternalServer,
  searchRecipesWithCache as searchRecipesWithCacheServer,
} from './spoonacularCacheService.server';

// ========================================
// Environment Check
// ========================================


const isServer = typeof window === 'undefined';

// ========================================
// Server-Only Operations Wrapper
// ========================================

class ServerSpoonacularCacheService {
  async searchRecipesWithCache(
    query: string,
    options: RecipeFilters = {}
  ): Promise<{ recipes: Recipe[]; totalResults: number; fromCache: boolean }> {
    return searchRecipesWithCacheServer(query, options);
  }

  async getRecipeWithCache(
    recipeId: string
  ): Promise<{ recipe: Recipe | null; fromCache: boolean }> {
    // The server function now correctly returns a Recipe, so the cast is no longer needed.
    const result = await getRecipeWithCacheServer(recipeId);
    return result;
  }

  async searchRecipesByIngredients(
    ingredients: string[]
  ): Promise<{ recipes: Recipe[]; fromCache: boolean }> {
    return searchRecipesByIngredientsInternalServer(ingredients);
  }

  async getPopularRecipesWithCache(
    options: RecipeFilters = {}
  ): Promise<{ recipes: Recipe[]; fromCache: boolean }> {
    return getPopularRecipesWithCacheServer(options);
  }

  async getCacheStats(): Promise<object> {
    return getCacheStatsServer();
  }

  async getQuotaStatus(): Promise<object> {
    return getQuotaStatusServer();
  }
}

// ========================================
// Client-Safe API Service
// ========================================

class ClientSpoonacularCacheService {
  async searchRecipes(
    query: string, 
    options: RecipeFilters = {}
  ): Promise<{ recipes: Recipe[]; totalResults: number; fromCache: boolean }> {
    console.log("Using client-side service to search recipes (no-op)", { query, options });
    return { recipes: [], totalResults: 0, fromCache: false };
  }

  async getRecipe(recipeId: string): Promise<{ recipe: Recipe | null; fromCache: boolean }> {
    console.log("Using client-side service for get recipe (no-op)", { recipeId });
    return { recipe: null, fromCache: false };
  }

  async searchRecipesByIngredients(
    ingredients: string[]
  ): Promise<{ recipes: Recipe[]; fromCache: boolean }> {
    console.log("Using client-side service for ingredient search (no-op)", { ingredients });
    return { recipes: [], fromCache: false };
  }

  async getPopularRecipes(options: RecipeFilters = {}): Promise<{ recipes: Recipe[]; fromCache: boolean }> {
    console.log("Using client-side service for popular recipes (no-op)", { options });
    return { recipes: [], fromCache: false };
  }

  async getRecipeById(recipeId: string): Promise<{ recipe: Recipe | null; fromCache: boolean; }> {
    console.log("Using client-side service for get recipe by id (no-op)", { recipeId });
    return { recipe: null, fromCache: false };
  }

  async getCacheStats(): Promise<object> {
    console.log("Using client-side service for cache stats (no-op)");
    return {};
  }

  async getQuotaStatus(): Promise<object> {
    console.log("Using client-side service for quota status (no-op)");
    return {};
  }
}

export const spoonacularCacheService = isServer 
  ? new ServerSpoonacularCacheService() 
  : new ClientSpoonacularCacheService();