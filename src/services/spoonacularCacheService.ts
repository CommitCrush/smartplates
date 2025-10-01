/**
 * Client-Safe Spoonacular Cache Service
 * 
 * This module provides client-safe access to cached Spoonacular data
 * and prevents MongoDB client-side bundling issues
 */

import { Recipe } from '@/types/recipe';

// ========================================
// Environment Check
// ========================================

const isServer = typeof window === 'undefined';

// ========================================
// Server-Only Operations Wrapper
// ========================================

class ServerCacheOperations {
  private async ensureServerSide(): Promise<void> {
    if (!isServer) {
      throw new Error('Cache operations can only be performed on the server side');
    }
  }

  async searchRecipesWithCache(
    query: string, 
    options: any = {}
  ): Promise<{ recipes: Recipe[]; totalResults: number; fromCache: boolean }> {
    await this.ensureServerSide();
    
    const { searchRecipesWithCacheInternal } = await import('./spoonacularCacheService.server');
    return searchRecipesWithCacheInternal(query, options);
  }

  async getRecipeWithCache(recipeId: string): Promise<{ recipe: Recipe | null; fromCache: boolean }> {
    await this.ensureServerSide();
    
    const { getRecipeWithCacheInternal } = await import('./spoonacularCacheService.server');
    return getRecipeWithCacheInternal(recipeId);
  }

  async searchRecipesByIngredientsWithCache(
    ingredients: string[], 
    options: any = {}
  ): Promise<{ recipes: Recipe[]; fromCache: boolean }> {
    await this.ensureServerSide();
    
    const { searchRecipesByIngredientsWithCacheInternal } = await import('./spoonacularCacheService.server');
    return searchRecipesByIngredientsWithCacheInternal(ingredients, options);
  }

  async getPopularRecipesWithCache(
    options: any = {}
  ): Promise<{ recipes: Recipe[]; fromCache: boolean }> {
    await this.ensureServerSide();
    
    const { getPopularRecipesWithCacheInternal } = await import('./spoonacularCacheService.server');
    return getPopularRecipesWithCacheInternal(options);
  }

  async getCacheStats(): Promise<any> {
    await this.ensureServerSide();
    
    const { getCacheStatsInternal } = await import('./spoonacularCacheService.server');
    return getCacheStatsInternal();
  }

  async getQuotaStatus(): Promise<any> {
    await this.ensureServerSide();
    
    const { getQuotaStatusInternal } = await import('./spoonacularCacheService.server');
    return getQuotaStatusInternal();
  }

  async clearExpiredCache(): Promise<void> {
    await this.ensureServerSide();
    
    const { clearExpiredCacheInternal } = await import('./spoonacularCacheService.server');
    return clearExpiredCacheInternal();
  }
}

// ========================================
// Client-Safe API Service
// ========================================

export const cacheService = {
  /**
   * Search recipes with intelligent caching
   */
  async searchRecipes(
    query: string, 
    options: any = {}
  ): Promise<{ recipes: Recipe[]; totalResults: number; fromCache: boolean }> {
    if (isServer) {
      const serverCache = new ServerCacheOperations();
      return serverCache.searchRecipesWithCache(query, options);
    } else {
      const params = new URLSearchParams({
        query,
        ...Object.fromEntries(
          Object.entries(options).map(([k, v]) => [k, String(v)])
        )
      });
      
      const response = await fetch(`/api/recipes/search?${params}`);
      if (!response.ok) {
        throw new Error(`Search API failed: ${response.statusText}`);
      }
      return response.json();
    }
  },

  /**
   * Get single recipe with caching
   */
  async getRecipe(recipeId: string): Promise<{ recipe: Recipe | null; fromCache: boolean }> {
    if (isServer) {
      const serverCache = new ServerCacheOperations();
      return serverCache.getRecipeWithCache(recipeId);
    } else {
      const response = await fetch(`/api/recipes/${recipeId}`);
      if (!response.ok) {
        throw new Error(`Recipe API failed: ${response.statusText}`);
      }
      return response.json();
    }
  },

  /**
   * Search recipes by ingredients
   */
  async searchByIngredients(
    ingredients: string[], 
    options: any = {}
  ): Promise<{ recipes: Recipe[]; fromCache: boolean }> {
    if (isServer) {
      const serverCache = new ServerCacheOperations();
      return serverCache.searchRecipesByIngredientsWithCache(ingredients, options);
    } else {
      const response = await fetch('/api/recipes/search-by-ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients, options })
      });
      if (!response.ok) {
        throw new Error(`Ingredient search API failed: ${response.statusText}`);
      }
      return response.json();
    }
  },

  /**
   * Get popular/trending recipes
   */
  async getPopularRecipes(options: any = {}): Promise<{ recipes: Recipe[]; fromCache: boolean }> {
    if (isServer) {
      const serverCache = new ServerCacheOperations();
      return serverCache.getPopularRecipesWithCache(options);
    } else {
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries(options).map(([k, v]) => [k, String(v)])
        )
      );
      
      const response = await fetch(`/api/recipes/popular?${params}`);
      if (!response.ok) {
        throw new Error(`Popular recipes API failed: ${response.statusText}`);
      }
      return response.json();
    }
  },

  /**
   * Get cache statistics (admin only)
   */
  async getCacheStats(): Promise<any> {
    if (isServer) {
      const serverCache = new ServerCacheOperations();
      return serverCache.getCacheStats();
    } else {
      const response = await fetch('/api/admin/cache/stats');
      if (!response.ok) {
        throw new Error(`Cache stats API failed: ${response.statusText}`);
      }
      return response.json();
    }
  },

  /**
   * Get quota status (admin only)
   */
  async getQuotaStatus(): Promise<any> {
    if (isServer) {
      const serverCache = new ServerCacheOperations();
      return serverCache.getQuotaStatus();
    } else {
      const response = await fetch('/api/admin/cache/quota');
      if (!response.ok) {
        throw new Error(`Quota status API failed: ${response.statusText}`);
      }
      return response.json();
    }
  }
};

// ========================================
// Server-Only Exports
// ========================================

export const serverCacheService = isServer ? new ServerCacheOperations() : null;

// ========================================
// Default Export
// ========================================

export default cacheService;