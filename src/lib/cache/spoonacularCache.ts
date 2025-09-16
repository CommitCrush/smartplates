// src/lib/cache/spoonacularCache.ts
import type { SpoonacularRecipe } from '@/services/spoonacularService';

interface CacheEntry {
  value: SpoonacularRecipe[];
  expires: number;
}

const CACHE_DURATION = 60 * 60 * 1000; // 1 Stunde in ms
export const cache: Record<string, CacheEntry> = {};

export function getCachedResults(key: string): SpoonacularRecipe[] | null {
  const entry = cache[key];
  if (entry && entry.expires > Date.now()) {
    return entry.value;
  }
  return null;
}

export function setCachedResults(key: string, value: SpoonacularRecipe[]): void {
  cache[key] = {
    value,
    expires: Date.now() + CACHE_DURATION,
  };
}
