// Stub service to prevent build failures
// TODO: Implement proper MongoDB-based cache service

import logger from '@/utils/logger';

export async function getCachedRecipe(spoonacularId: string): Promise<any | null> {
	logger.warn('Cache service: getCachedRecipe is stubbed', { spoonacularId });
	return null;
}

export async function setCachedRecipe(spoonacularId: string, recipeData: any): Promise<void> {
	logger.warn('Cache service: setCachedRecipe is stubbed', { spoonacularId });
}

export async function clearExpiredCache(): Promise<void> {
	logger.warn('Cache service: clearExpiredCache is stubbed');
}

export async function getQuotaUsage(): Promise<{ daily: number; monthly: number }> {
	logger.warn('Cache service: getQuotaUsage is stubbed');
	return { daily: 0, monthly: 0 };
}

export async function trackQuotaUsage(endpoint: string): Promise<void> {
	logger.warn('Cache service: trackQuotaUsage is stubbed', { endpoint });
}

export async function importCachedRecipesToDB(): Promise<{ imported: number; errors: string[] }> {
	logger.warn('Cache service: importCachedRecipesToDB is stubbed');
	return { imported: 0, errors: [] };
}

export async function searchRecipesWithCache(query: string, options: any = {}): Promise<any> {
	logger.warn('Cache service: searchRecipesWithCache is stubbed', { query, options });
	return { recipes: [], totalResults: 0 };
}

export async function getRecipeWithCache(id: string): Promise<any> {
	logger.warn('Cache service: getRecipeWithCache is stubbed', { id });
	return null;
}

export async function getPopularRecipesWithCache(options: any = {}): Promise<any> {
	logger.warn('Cache service: getPopularRecipesWithCache is stubbed', { options });
	return { recipes: [], totalResults: 0 };
}

export const getPopularRecipes = async (options: any = {}): Promise<any[]> => {
  logger.warn('getPopularRecipes: Using stub implementation', { options });
  return [];
};

// Search recipes by ingredients with cache
export async function searchRecipesByIngredientsWithCache(ingredients: string | string[]): Promise<{ recipes: any[], fromCache: boolean }> {
  logger.warn('searchRecipesByIngredientsWithCache called with stub implementation:', { ingredients });
  return { recipes: [], fromCache: false };
}

export default {
  importCachedRecipesToDB,
  searchRecipesWithCache,
  getRecipeWithCache,
  getPopularRecipesWithCache,
  getPopularRecipes,
  searchRecipesByIngredientsWithCache
};