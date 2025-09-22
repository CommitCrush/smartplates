/**
 * Recipe Cache Service
 * 
 * Caches Spoonacular API responses to reduce API calls and avoid rate limits
 * Enhanced with longer cache duration and persistent fallback data
 */

import { Recipe } from '@/types/recipe';
import { promises as fs } from 'fs';
import path from 'path';
import { PRELOADED_RECIPES, SimpleRecipe } from './preloadedRecipes';

// Cache directory
const CACHE_DIR = path.join(process.cwd(), '.cache');
const RECIPES_CACHE_FILE = path.join(CACHE_DIR, 'recipes.json');
const PERSISTENT_CACHE_FILE = path.join(CACHE_DIR, 'recipes-persistent.json');

// Cache expiration time (30 days instead of 24 hours)
const CACHE_EXPIRATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 Tage
const REFRESH_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // Versuche Refresh nach 7 Tagen

export interface CachedRecipeData {
  recipes: Recipe[];
  categories: { [key: string]: Recipe[] };
  lastUpdated: number;
  lastRefreshAttempt?: number;
  totalCount: number;
  source: 'spoonacular' | 'persistent' | 'preloaded'; // Datenquelle verfolgen
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
 * Check if cache is valid (not expired after 30 days)
 */
function isCacheValid(lastUpdated: number): boolean {
  const now = Date.now();
  return (now - lastUpdated) < CACHE_EXPIRATION_MS;
}

/**
 * Check if cache should be refreshed (after 7 days)
 */
function shouldRefreshCache(lastUpdated: number, lastRefreshAttempt?: number): boolean {
  const now = Date.now();
  const timeSinceUpdate = now - lastUpdated;
  const timeSinceLastAttempt = lastRefreshAttempt ? now - lastRefreshAttempt : Infinity;
  
  // Versuche Refresh wenn:
  // 1. Daten älter als 7 Tage sind UND
  // 2. Letzter Refresh-Versuch länger als 1 Tag her ist (um API-Limits zu respektieren)
  return timeSinceUpdate > REFRESH_THRESHOLD_MS && timeSinceLastAttempt > (24 * 60 * 60 * 1000);
}

/**
 * Load cached recipes from file (primary cache)
 */
export async function loadCachedRecipes(): Promise<CachedRecipeData | null> {
  try {
    await ensureCacheDir();
    
    const cacheData = await fs.readFile(RECIPES_CACHE_FILE, 'utf-8');
    const parsed: CachedRecipeData = JSON.parse(cacheData);
    
    if (isCacheValid(parsed.lastUpdated)) {
      console.log(`✅ Using cached recipes data (${parsed.totalCount} recipes, ${Math.floor((Date.now() - parsed.lastUpdated) / (1000 * 60 * 60 * 24))} days old)`);
      return parsed;
    } else {
      console.log('⏰ Cache expired after 30 days');
      return null;
    }
  } catch {
    console.log('📁 No primary cache found');
    return null;
  }
}

/**
 * Load persistent cache (never expires, but can be outdated)
 */
async function loadPersistentCache(): Promise<CachedRecipeData | null> {
  try {
    await ensureCacheDir();
    
    const cacheData = await fs.readFile(PERSISTENT_CACHE_FILE, 'utf-8');
    const parsed: CachedRecipeData = JSON.parse(cacheData);
    
    console.log(`📦 Loading persistent cache (${parsed.totalCount} recipes, ${Math.floor((Date.now() - parsed.lastUpdated) / (1000 * 60 * 60 * 24))} days old)`);
    return { ...parsed, source: 'persistent' };
  } catch {
    console.log('📁 No persistent cache found');
    return null;
  }
}

/**
 * Save recipes to both caches
 */
export async function saveCachedRecipes(data: CachedRecipeData): Promise<void> {
  try {
    await ensureCacheDir();
    
    const dataToSave = {
      ...data,
      source: 'spoonacular',
      lastUpdated: Date.now()
    };
    
    // Speichere in beiden Cache-Dateien
    await Promise.all([
      fs.writeFile(RECIPES_CACHE_FILE, JSON.stringify(dataToSave, null, 2)),
      fs.writeFile(PERSISTENT_CACHE_FILE, JSON.stringify(dataToSave, null, 2))
    ]);
    
    console.log(`💾 Cached ${data.totalCount} recipes successfully (both primary and persistent cache)`);
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

    if (uniqueRecipes.length === 0) {
      throw new Error('No recipes fetched from Spoonacular');
    }

    const cacheData: CachedRecipeData = {
      recipes: uniqueRecipes,
      categories: categorizedRecipes,
      lastUpdated: Date.now(),
      totalCount: uniqueRecipes.length,
      source: 'spoonacular'
    };

    // Save to both caches
    await saveCachedRecipes(cacheData);
    
    console.log(`✅ Successfully fetched and cached ${uniqueRecipes.length} recipes`);
    return cacheData;

  } catch (error) {
    console.error('❌ Failed to fetch recipes from Spoonacular:', error);
    throw error; // Re-throw to handle in calling function
  }
}

/**
 * Background refresh (non-blocking)
 */
async function backgroundRefresh(currentData: CachedRecipeData): Promise<void> {
  try {
    console.log('🔄 Attempting background refresh...');
    
    // Update refresh attempt timestamp
    const updatedData = {
      ...currentData,
      lastRefreshAttempt: Date.now()
    };
    
    // Save updated timestamp
    await saveCachedRecipes(updatedData);
    
    // Try to fetch new data
    await fetchAndCacheRecipes();
    
  } catch (error) {
    console.warn('⚠️ Background refresh failed, keeping current data:', error);
  }
}

/**
 * Get recipes with enhanced caching logic
 * Priorität: 1. Gültiger Cache 2. Persistent Cache 3. Fresh Fetch 4. Preloaded Fallback
 */
export async function getCachedOrFreshRecipes(): Promise<CachedRecipeData> {
  // 1. Versuche primären Cache zu laden (30 Tage gültig)
  let cached = await loadCachedRecipes();
  
  if (cached && cached.recipes.length > 0) {
    // Prüfe ob Background-Refresh nötig ist (nach 7 Tagen)
    if (shouldRefreshCache(cached.lastUpdated, cached.lastRefreshAttempt)) {
      console.log('🔄 Starting background refresh...');
      backgroundRefresh(cached); // Non-blocking
    }
    
    return cached;
  }
  
  // 2. Versuche persistent Cache (niemals abgelaufen)
  const persistentCache = await loadPersistentCache();
  
  if (persistentCache && persistentCache.recipes.length > 0) {
    console.log('📦 Using persistent cache as fallback');
    
    // Versuche Fresh Fetch im Hintergrund
    backgroundRefresh(persistentCache);
    
    return persistentCache;
  }
  
  // 3. Versuche Fresh Fetch
  try {
    console.log('🚀 No cache available, attempting fresh fetch...');
    const freshData = await fetchAndCacheRecipes();
    return freshData;
    
  } catch (fetchError) {
    console.error('❌ Fresh fetch failed:', fetchError);
    
    // 4. Fallback zu preloaded recipes
    console.log('📋 Using preloaded recipes as last resort');
    
    const fallbackData: CachedRecipeData = {
      recipes: PRELOADED_RECIPES as unknown as Recipe[],
      categories: categorizeSimpleRecipes(PRELOADED_RECIPES),
      lastUpdated: Date.now(),
      totalCount: PRELOADED_RECIPES.length,
      source: 'preloaded'
    };
    
    // Speichere preloaded data als Backup
    await saveCachedRecipes(fallbackData);
    
    return fallbackData;
  }
}

/**
 * Categorize recipes by their category field
 */
function categorizeRecipes(recipes: Recipe[]): { [key: string]: Recipe[] } {
  const categories: { [key: string]: Recipe[] } = {};
  
  recipes.forEach(recipe => {
    const category = recipe.mealType || recipe.category || 'other';
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
      (recipe.tags || []).some(tag => tag.toLowerCase().includes(searchLower)) ||
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

/**
 * Get cache info (for debugging/admin)
 */
export async function getCacheInfo(): Promise<{
  primaryCache: { exists: boolean; age: number; count: number } | null;
  persistentCache: { exists: boolean; age: number; count: number } | null;
}> {
  const primaryCache = await loadCachedRecipes();
  const persistentCache = await loadPersistentCache();
  
  return {
    primaryCache: primaryCache ? {
      exists: true,
      age: Math.floor((Date.now() - primaryCache.lastUpdated) / (1000 * 60 * 60 * 24)),
      count: primaryCache.totalCount
    } : null,
    persistentCache: persistentCache ? {
      exists: true,
      age: Math.floor((Date.now() - persistentCache.lastUpdated) / (1000 * 60 * 60 * 24)),
      count: persistentCache.totalCount
    } : null
  };
}

/**
 * Clear all caches (for testing or reset)
 */
export async function clearAllCaches(): Promise<void> {
  try {
    await Promise.all([
      fs.unlink(RECIPES_CACHE_FILE).catch(() => {}),
      fs.unlink(PERSISTENT_CACHE_FILE).catch(() => {})
    ]);
    console.log('🗑️ All caches cleared');
  } catch (error) {
    console.error('❌ Failed to clear caches:', error);
  }
}