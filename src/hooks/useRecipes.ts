import { useState, useEffect } from 'react';
import { Recipe } from '@/types/recipe';

interface UseRecipesOptions {
  category?: string;
  difficulty?: string;
  diet?: string;
  search?: string;
  limit?: number;
  page?: number;
}

interface UseRecipesResult {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  total: number;
  source?: string;
}

/**
 * Hook to fetch recipes from our API route
 * This uses the enhanced caching logic that supports local cache files
 */
export function useRecipes(options: UseRecipesOptions = {}): UseRecipesResult {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [source, setSource] = useState<string>('');

  useEffect(() => {
    async function fetchRecipes() {
      try {
        setLoading(true);
        setError(null);

        // Build query parameters
        const params = new URLSearchParams();
        
        if (options.search) params.set('search', options.search);
        if (options.category) params.set('category', options.category);
        if (options.difficulty) params.set('difficulty', options.difficulty);
        if (options.diet) params.set('dietaryRestrictions', options.diet);
        if (options.limit) params.set('limit', options.limit.toString());
        if (options.page) params.set('page', options.page.toString());

        console.log('🔍 Fetching recipes with params:', params.toString());

        const response = await fetch(`/api/recipes?${params}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        console.log('📊 Received recipe data:', {
          count: data.recipes?.length || 0,
          source: data.source,
          total: data.total
        });

        if (data.success === false) {
          throw new Error(data.message || 'Failed to fetch recipes');
        }

        setRecipes(data.recipes || []);
        setTotal(data.total || data.recipes?.length || 0);
        setSource(data.source || 'unknown');
        
        if (data.recipes?.length === 0) {
          setError('No recipes found matching your criteria');
        }

      } catch (err) {
        console.error('❌ Error fetching recipes:', err);
        setError(err instanceof Error ? err.message : 'Failed to load recipes');
        setRecipes([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, [
    options.search,
    options.category,
    options.difficulty,
    options.diet,
    options.limit,
    options.page
  ]);

  return {
    recipes,
    loading,
    error,
    total,
    source
  };
}

/**
 * Hook to fetch a single recipe by ID
 */
export function useRecipe(recipeId: string): {
  recipe: Recipe | null;
  loading: boolean;
  error: string | null;
} {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecipe() {
      if (!recipeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Fetching recipe with ID:', recipeId);

        const response = await fetch(`/api/recipes/${recipeId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Recipe not found');
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        console.log('📊 Received recipe:', data.title || 'Unknown recipe');

        setRecipe(data);

      } catch (err) {
        console.error('❌ Error fetching recipe:', err);
        setError(err instanceof Error ? err.message : 'Failed to load recipe');
        setRecipe(null);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipe();
  }, [recipeId]);

  return {
    recipe,
    loading,
    error
  };
}