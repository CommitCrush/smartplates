/**
 * Custom Hook for Spoonacular Recipe Search
 * 
 * Provides search functionality with Spoonacular API integration
 */

import { useState, useCallback } from 'react';
import { Recipe } from '@/types/recipe';

interface SearchOptions {
  category?: string;
  cuisine?: string;
  diet?: string;
  ingredients?: string[];
  limit?: number;
}

interface UseSpoonacularSearchReturn {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  totalResults: number;
  hasMore: boolean;
  searchRecipes: (query: string, options?: SearchOptions) => Promise<void>;
  searchByIngredients: (ingredients: string[]) => Promise<void>;
  loadMore: () => Promise<void>;
  clearResults: () => void;
}

export function useSpoonacularSearch(): UseSpoonacularSearchReturn {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentOptions, setCurrentOptions] = useState<SearchOptions>({});
  const [offset, setOffset] = useState(0);

  const searchRecipes = useCallback(async (query: string, options: SearchOptions = {}) => {
    setLoading(true);
    setError(null);
    setCurrentQuery(query);
    setCurrentOptions(options);
    setOffset(0);

    try {
      const searchParams = new URLSearchParams({
        q: query,
        limit: (options.limit || 12).toString(),
        offset: '0'
      });

      if (options.category) searchParams.append('category', options.category);
      if (options.cuisine) searchParams.append('cuisine', options.cuisine);
      if (options.diet) searchParams.append('diet', options.diet);

      const response = await fetch(`/api/recipes/search-spoonacular?${searchParams}`);
      const data = await response.json();

      if (data.success) {
        setRecipes(data.data.recipes);
        setTotalResults(data.data.totalResults);
        setHasMore(data.data.recipes.length < data.data.totalResults);
        setOffset(data.data.recipes.length);
      } else {
        throw new Error(data.message || 'Search failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search recipes');
      setRecipes([]);
      setTotalResults(0);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchByIngredients = useCallback(async (ingredients: string[]) => {
    setLoading(true);
    setError(null);
    setCurrentQuery('');
    setCurrentOptions({ ingredients });
    setOffset(0);

    try {
      const searchParams = new URLSearchParams({
        ingredients: ingredients.join(','),
        limit: '12'
      });

      const response = await fetch(`/api/recipes/search-spoonacular?${searchParams}`);
      const data = await response.json();

      if (data.success) {
        setRecipes(data.data.recipes);
        setTotalResults(data.data.totalResults);
        setHasMore(false); // Ingredient search doesn't support pagination
        setOffset(data.data.recipes.length);
      } else {
        throw new Error(data.message || 'Search failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search recipes by ingredients');
      setRecipes([]);
      setTotalResults(0);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || currentOptions.ingredients) return;

    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({
        q: currentQuery,
        limit: (currentOptions.limit || 12).toString(),
        offset: offset.toString()
      });

      if (currentOptions.category) searchParams.append('category', currentOptions.category);
      if (currentOptions.cuisine) searchParams.append('cuisine', currentOptions.cuisine);
      if (currentOptions.diet) searchParams.append('diet', currentOptions.diet);

      const response = await fetch(`/api/recipes/search-spoonacular?${searchParams}`);
      const data = await response.json();

      if (data.success) {
        setRecipes(prev => [...prev, ...data.data.recipes]);
        setHasMore(offset + data.data.recipes.length < data.data.totalResults);
        setOffset(prev => prev + data.data.recipes.length);
      } else {
        throw new Error(data.message || 'Failed to load more recipes');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more recipes');
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, currentQuery, currentOptions, offset]);

  const clearResults = useCallback(() => {
    setRecipes([]);
    setTotalResults(0);
    setHasMore(false);
    setError(null);
    setCurrentQuery('');
    setCurrentOptions({});
    setOffset(0);
  }, []);

  return {
    recipes,
    loading,
    error,
    totalResults,
    hasMore,
    searchRecipes,
    searchByIngredients,
    loadMore,
    clearResults
  };
}