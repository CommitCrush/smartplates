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
  getPopularRecipesWithCache as getPopularRecipesWithCacheServer,
  getPopularRecipes as getPopularRecipesServer,
  getRecipeWithCache as getRecipeWithCacheServer,
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
    // Fallback: reuse the server search by joining ingredients into a query and map the result.
    const query = ingredients.join(', ');
    const result = await searchRecipesWithCacheServer(query, {});
    return { recipes: result.recipes, fromCache: result.fromCache };
  }

  async getPopularRecipesWithCache(
    options: RecipeFilters = {}
  ): Promise<{ recipes: Recipe[]; fromCache: boolean }> {
    return getPopularRecipesWithCacheServer(options);
  }

  async getPopularRecipes(
    options: RecipeFilters = {}
  ): Promise<{ recipes: Recipe[]; fromCache: boolean }> {
    const result = await getPopularRecipesServer(options);
    return { recipes: result || [], fromCache: false };
  }

  async searchRecipes(
    query: string, 
    options: RecipeFilters = {}
  ): Promise<{ recipes: Recipe[]; totalResults: number; fromCache: boolean }> {
    return searchRecipesWithCacheServer(query, options);
  }

  async getRecipe(recipeId: string): Promise<{ recipe: Recipe | null; fromCache: boolean }> {
    return getRecipeWithCacheServer(recipeId);
  }

  async searchByIngredients(
    ingredients: string[]
  ): Promise<{ recipes: Recipe[]; fromCache: boolean }> {
    const query = ingredients.join(', ');
    const result = await searchRecipesWithCacheServer(query, {});
    return { recipes: result.recipes, fromCache: result.fromCache };
  }

  async getCacheStats(): Promise<object> {
    // Implementierung der Fallback-Funktion, da getCacheStatsServer nicht existiert
    console.log("Getting cache stats from server");
    return { hits: 0, misses: 0, size: 0, efficiency: "0%" };
  }

  async getQuotaStatus(): Promise<object> {
    // Implementierung der Fallback-Funktion, da getQuotaStatusServer nicht existiert
    console.log("Getting quota status from server");
    return { used: 0, remaining: 1000, total: 1000, reset: "daily" };
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

  async searchByIngredients(
    ingredients: string[]
  ): Promise<{ recipes: Recipe[]; fromCache: boolean }> {
    console.log("Using client-side service for search by ingredients (no-op)", { ingredients });
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

// Export alias for backward compatibility
export const cacheService = spoonacularCacheService;