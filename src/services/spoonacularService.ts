/**
 * Spoonacular API Service
 * 
 * Integration with Spoonacular API for external recipe data
 * Replaces mock implementations with real recipe data
 */

import { Recipe } from '@/types/recipe';

/**
 * Recipe filter interface for search functionality
 */
export interface RecipeFilters {
  diet?: string;
  cuisine?: string;
  type?: string;
  intolerances?: string;
  includeIngredients?: string;
  excludeIngredients?: string;
  maxReadyTime?: number;
  minServings?: number;
  maxServings?: number;
  offset?: number;
  number?: number;
  [key: string]: string | number | boolean | undefined; // Index signature
}

/**
 * Search recipes from Spoonacular API (with intelligent caching)
 */
export async function searchSpoonacularRecipes(
  searchTerm: string = '',
  filters: RecipeFilters = {}
): Promise<{ recipes: Recipe[]; totalResults: number; fromCache: boolean }> {
  try {
    const cacheService = await import('./spoonacularCacheService.server');
    return await cacheService.searchRecipesWithCache(searchTerm, filters);
  } catch (error) {
    console.error('Spoonacular search error:', error);
    return { recipes: [], totalResults: 0, fromCache: false };
  }
}

/**
 * Get recipe details from Spoonacular API (with intelligent caching)
 */
export async function getSpoonacularRecipe(id: string): Promise<Recipe | null> {
  try {
    const cacheService = await import('./spoonacularCacheService.server');
    const result = await cacheService.getRecipeWithCache(id);
    return result.recipe;
  } catch (error) {
    console.error('Spoonacular recipe fetch error:', error);
    return null;
  }
}

/**
 * Search recipes by ingredients from Spoonacular API (with intelligent caching)
 */
export async function searchRecipesByIngredients(
ingredients: string[], p0?: { number: number; }): Promise<{ recipes: Recipe[]; totalResults: number; fromCache: boolean }> {
  try {
    const cacheService = await import('./spoonacularCacheService.server');
    const result = await cacheService.searchRecipesByIngredientsWithCache(ingredients);
    return { ...result, totalResults: result.recipes.length };
  } catch (error) {
    console.error('Ingredient search error:', error);
    return { recipes: [], totalResults: 0, fromCache: false };
  }
}

/**
 * Get popular/random recipes from Spoonacular (with intelligent caching)
 */
export async function getPopularSpoonacularRecipes(): Promise<{ recipes: Recipe[]; totalResults: number; fromCache: boolean }> {
  try {
    const cacheService = await import('./spoonacularCacheService.server');
    const result = await cacheService.getPopularRecipesWithCache();
    return { ...result, totalResults: result.recipes.length };
  } catch (error) {
    console.error('Popular recipes error:', error);
    return { recipes: [], totalResults: 0, fromCache: false };
  }
}
