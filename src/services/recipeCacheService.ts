/**
 * Recipe Cache Service
 * 
 * Caches Spoonacular API responses to reduce API calls and avoid rate limits
 */

import { Recipe } from '@/types/recipe';
import { promises as fs } from 'fs';
import path from 'path';
import { PRELOADED_RECIPES, SimpleRecipe } from './preloadedRecipes';

// Cache directory
const CACHE_DIR = path.join(process.cwd(), '.cache');
const RECIPES_CACHE_FILE = path.join(CACHE_DIR, 'recipes.json');

// Cache expiration time (24 hours)
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface CachedRecipeData {
  recipes: Recipe[];
  categories: { [key: string]: Recipe[] };
  lastUpdated: number;
  totalCount: number;
}

/**
 * Ensure cache directory exists
 */
async function ensureCacheDir(): Promise<void> {
  try {
    await fs.access(CACHE_DIR);
  } catch {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  }
}

/**
 * Check if cache is valid (not expired)
 */
function isCacheValid(lastUpdated: number): boolean {
  const now = Date.now();
  return (now - lastUpdated) < CACHE_EXPIRATION_MS;
}

/**
 * Load cached recipes from file
 */
export async function loadCachedRecipes(): Promise<CachedRecipeData | null> {
  try {
    await ensureCacheDir();
    
    const cacheData = await fs.readFile(RECIPES_CACHE_FILE, 'utf-8');
    const parsed: CachedRecipeData = JSON.parse(cacheData);
    
    if (isCacheValid(parsed.lastUpdated)) {
      console.log('✅ Using cached recipes data');
      return parsed;
    } else {
      console.log('⏰ Cache expired, need to refresh');
      return null;
    }
  } catch {
    console.log('📁 No cache found, will fetch fresh data');
    return null;
  }
}

/**
 * Save recipes to cache
 */
export async function saveCachedRecipes(data: CachedRecipeData): Promise<void> {
  try {
    await ensureCacheDir();
    await fs.writeFile(RECIPES_CACHE_FILE, JSON.stringify(data, null, 2));
    console.log(`💾 Cached ${data.totalCount} recipes successfully`);
  } catch (error) {
    console.error('❌ Failed to save cache:', error);
  }
}

/**
 * Fetch and cache recipes from Spoonacular
 */
export async function fetchAndCacheRecipes(): Promise<CachedRecipeData> {
  console.log('🔄 Fetching fresh recipes from Spoonacular...');
  
  const { 
    searchSpoonacularRecipes, 
    getPopularSpoonacularRecipes 
  } = await import('@/services/spoonacularService');

  try {
    const allRecipes: Recipe[] = [];
    const categorizedRecipes: { [key: string]: Recipe[] } = {};

    // Fetch popular recipes first
    const popularRecipes = await getPopularSpoonacularRecipes({ number: 20 });
    allRecipes.push(...popularRecipes);

    // Fetch recipes by category (small batches to avoid limits)
    const categories = ['breakfast', 'lunch', 'dinner', 'dessert', 'snack'];
    
    for (const category of categories) {
      try {
        const result = await searchSpoonacularRecipes('', {
          type: category,
          number: 10 // Small number to stay within limits
        });
        
        categorizedRecipes[category] = result.recipes;
        allRecipes.push(...result.recipes);
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.warn(`⚠️ Failed to fetch ${category} recipes:`, error);
        categorizedRecipes[category] = [];
      }
    }

    // Remove duplicates based on ID
    const uniqueRecipes = allRecipes.filter((recipe, index, self) => 
      index === self.findIndex(r => r.id === recipe.id)
    );

    const cacheData: CachedRecipeData = {
      recipes: uniqueRecipes,
      categories: categorizedRecipes,
      lastUpdated: Date.now(),
      totalCount: uniqueRecipes.length
    };

    // Save to cache
    await saveCachedRecipes(cacheData);
    
    console.log(`✅ Successfully fetched and cached ${uniqueRecipes.length} recipes`);
    return cacheData;

  } catch (error) {
    console.error('❌ Failed to fetch recipes from Spoonacular:', error);
    
    // Return empty cache data if all fails
    const fallbackData: CachedRecipeData = {
      recipes: [],
      categories: {},
      lastUpdated: Date.now(),
      totalCount: 0
    };
    
    return fallbackData;
  }
}

/**
 * Get recipes with caching logic
 */
export async function getCachedOrFreshRecipes(): Promise<CachedRecipeData> {
  // Try to load from cache first
  const cached = await loadCachedRecipes();
  
  if (cached && cached.recipes.length > 0) {
    return cached;
  }
  
  // If no cache or empty cache, fetch fresh data
  const freshData = await fetchAndCacheRecipes();
  
  // If fetching fresh data failed (e.g., payment errors), use preloaded recipes
  if (freshData.recipes.length === 0) {
    console.log('📋 Using preloaded recipes as fallback');
    
    return {
      recipes: PRELOADED_RECIPES as unknown as Recipe[], // Convert to Recipe format
      categories: categorizeSimpleRecipes(PRELOADED_RECIPES),
      lastUpdated: Date.now(),
      totalCount: PRELOADED_RECIPES.length
    };
  }
  
  return freshData;
}

/**
 * Categorize recipes by their category field
 */
function categorizeRecipes(recipes: Recipe[]): { [key: string]: Recipe[] } {
  const categories: { [key: string]: Recipe[] } = {};
  
  recipes.forEach(recipe => {
    const category = recipe.mealType || 'other';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(recipe);
  });
  
  return categories;
}

/**
 * Categorize simple recipes by their category field
 */
function categorizeSimpleRecipes(recipes: SimpleRecipe[]): { [key: string]: Recipe[] } {
  const categories: { [key: string]: Recipe[] } = {};
  
  recipes.forEach(recipe => {
    const category = recipe.category || 'other';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(recipe as unknown as Recipe);
  });
  
  return categories;
}

/**
 * Search within cached recipes
 */
export function searchCachedRecipes(
  cache: CachedRecipeData,
  query: string,
  category?: string,
  difficulty?: string
): Recipe[] {
  let results = cache.recipes;

  // Filter by category first
  if (category && cache.categories[category]) {
    results = cache.categories[category];
  }

  // Apply difficulty filter
  if (difficulty) {
    results = results.filter(recipe => recipe.difficulty === difficulty);
  }

  // Apply search query
  if (query) {
    const searchLower = query.toLowerCase();
    results = results.filter(recipe =>
      recipe.title.toLowerCase().includes(searchLower) ||
      recipe.description.toLowerCase().includes(searchLower) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
      (recipe.cuisine && recipe.cuisine.toLowerCase().includes(searchLower))
    );
  }

  return results;
}

/**
 * Force refresh cache (for admin or manual refresh)
 */
export async function refreshCache(): Promise<CachedRecipeData> {
  console.log('🔄 Force refreshing recipe cache...');
  return await fetchAndCacheRecipes();
}