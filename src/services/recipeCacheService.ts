/**
 * Recipe Cache Service
 * 
 * Caches Spoonacular API responses to reduce API calls and avoid rate limits
 * Enhanced with longer cache duration and persistent fallback data
 */

import { Recipe } from '@/types/recipe';
import { promises as fs } from 'fs';
import path from 'path';

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
    const popularResult = await getPopularSpoonacularRecipes();
    allRecipes.push(...popularResult.recipes);

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
  const cached = await loadCachedRecipes();
  if (cached && cached.recipes.length > 0) {
    if (shouldRefreshCache(cached.lastUpdated, cached.lastRefreshAttempt)) {
      console.log('🔄 Starting background refresh...');
      backgroundRefresh(cached);
    }
    return cached;
  }
  // 2. Versuche persistent Cache (niemals abgelaufen)
  const persistentCache = await loadPersistentCache();
  if (persistentCache && persistentCache.recipes.length > 0) {
    console.log('📦 Using persistent cache as fallback');
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
    throw fetchError;
  }
}

/**
 * Categorize recipes by their category field
 */
function categorizeRecipes(recipes: Recipe[]): { [key: string]: Recipe[] } {
  const categories: { [key: string]: Recipe[] } = {};
  recipes.forEach(recipe => {
      // Nutze dishTypes als Kategorie, falls vorhanden, sonst 'other'
      const dishType = Array.isArray(recipe.dishTypes) && recipe.dishTypes.length > 0 ? recipe.dishTypes[0] : 'other';
    if (!categories[dishType]) {
      categories[dishType] = [];
    }
    categories[dishType].push(recipe);
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
  difficulty?: 'easy' | 'medium' | 'hard'
): Recipe[] {
  let results = cache.recipes;

  // Filter by category (dishType) first
  if (category && cache.categories[category]) {
    results = cache.categories[category];
  }

  // Filter by difficulty (berechnet aus readyInMinutes)
  if (difficulty) {
    results = results.filter(recipe => {
      const time = recipe.readyInMinutes ?? 0;
      if (difficulty === 'easy') return time <= 15;
      if (difficulty === 'medium') return time > 15 && time <= 30;
      if (difficulty === 'hard') return time > 30;
      return true;
    });
  }

  // Apply search query
  if (query) {
    const searchLower = query.toLowerCase();
    results = results.filter(recipe => {
      const titleMatch = recipe.title.toLowerCase().includes(searchLower);
      const descMatch = recipe.description.toLowerCase().includes(searchLower);
      const cuisinesMatch = Array.isArray(recipe.cuisines) && recipe.cuisines.some(c => c.toLowerCase().includes(searchLower));
      const dishTypesMatch = Array.isArray(recipe.dishTypes) && recipe.dishTypes.some(d => d.toLowerCase().includes(searchLower));
      const dietsMatch = Array.isArray(recipe.diets) && recipe.diets.some(d => d.toLowerCase().includes(searchLower));
      return titleMatch || descMatch || cuisinesMatch || dishTypesMatch || dietsMatch;
    });
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