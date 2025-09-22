/**
 * Hook for searching Spoonacular recipes
 * 
 * Provides functionality to search and import recipes from Spoonacular API
 */

import { useState } from 'react';
import { Recipe } from '@/types/recipe';

interface SearchOptions {
  cuisine?: string;
  diet?: string;
  intolerances?: string;
}

interface UseSpoonacularSearchResult {
  results: Recipe[];
  loading: boolean;
  error: string | null;
  searchRecipes: (query: string, options?: SearchOptions) => Promise<void>;
}

export function useSpoonacularSearch(): UseSpoonacularSearchResult {
  const [results, setResults] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchRecipes = async (query: string, options: SearchOptions = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        query,
        ...(options.cuisine && { cuisine: options.cuisine }),
        ...(options.diet && { diet: options.diet }),
        ...(options.intolerances && { intolerances: options.intolerances }),
      });

      const response = await fetch(`/api/recipes/search-spoonacular?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to search recipes');
      }

      const data = await response.json();
      setResults(data.recipes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    results,
    loading,
    error,
    searchRecipes,
  };
}
