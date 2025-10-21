// Stub service to prevent build failures
// TODO: Implement proper MongoDB-based enhancements service

import logger from '@/utils/logger';
import type { Recipe } from '@/types/recipe';

export async function enhanceRecipeWithSpoonacular(recipe: Recipe): Promise<Recipe> {
	logger.warn('Enhancements service: enhanceRecipeWithSpoonacular is stubbed', { id: recipe.id });
	return recipe;
}

export async function batchEnhanceRecipes(recipes: Recipe[]): Promise<Recipe[]> {
	logger.warn('Enhancements service: batchEnhanceRecipes is stubbed', { count: recipes.length });
	return recipes;
}

export async function updateRecipeWithSpoonacularData(recipeId: string, spoonacularData: any): Promise<Recipe | null> {
	logger.warn('Enhancements service: updateRecipeWithSpoonacularData is stubbed', { recipeId });
	return null;
}

export async function getCacheAnalytics(): Promise<any> {
	logger.warn('Enhancements service: getCacheAnalytics is stubbed');
	return { totalRecipes: 0, cacheHitRate: 0 };
}

export async function performHealthCheck(): Promise<any> {
	logger.warn('Enhancements service: performHealthCheck is stubbed');
	return { status: 'ok', services: [] };
}

export async function warmupPopularRecipesCache(): Promise<any> {
	logger.warn('Enhancements service: warmupPopularRecipesCache is stubbed');
	return { warmedUp: 0 };
}

export async function optimizeCache(): Promise<any> {
	logger.warn('Enhancements service: optimizeCache is stubbed');
	return { optimized: 0 };
}

export const performanceMonitor = {
	start: () => logger.warn('Performance monitor: start is stubbed'),
	end: () => logger.warn('Performance monitor: end is stubbed'),
	log: () => logger.warn('Performance monitor: log is stubbed'),
	reset: () => logger.warn('Performance monitor: reset is stubbed'),
	getStats: (operation?: string) => {
		logger.warn('Performance monitor: getStats is stubbed', { operation });
		return {
			totalRequests: 0,
			averageResponseTime: 0,
			errorRate: 0,
			cacheHitRate: 0,
			avgDuration: 0
		};
	},
	clearOldMetrics: () => {
		logger.warn('Performance monitor: clearOldMetrics is stubbed');
	}
};

// Export default for backward compatibility
export default {
	enhanceRecipeWithSpoonacular,
	batchEnhanceRecipes,
	updateRecipeWithSpoonacularData,
	getCacheAnalytics,
	performHealthCheck,
	warmupPopularRecipesCache,
	optimizeCache,
	performanceMonitor
};