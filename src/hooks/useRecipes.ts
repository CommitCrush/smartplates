import { useState, useEffect } from 'react';
import type { Recipe } from '@/types/recipe';

// Unified hooks for fetching recipes via the Mongo-first /api/recipes endpoints

export function useAllRecipes(query = '', options: Record<string, string> = {}) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.append('search', query);
        Object.entries(options).forEach(([key, value]) => {
          if (value && value !== 'all') params.append(key, value);
        });

        const res = await fetch(`/api/recipes?${params.toString()}`);
        const data = await res.json();

        const page = options.page ? parseInt(options.page, 10) : 1;
        const perPage = options.number ? parseInt(options.number, 10) : 30;
        const batch: Recipe[] = data.recipes || [];

        if (page > 1) {
          setRecipes((prev) => [...prev, ...batch]);
        } else {
          setRecipes(batch);
        }

        if (typeof data.total === 'number') {
          const currentTotal = (page - 1) * perPage + batch.length;
          setHasMore(currentTotal < data.total);
        } else {
          setHasMore(batch.length >= perPage);
        }

        setError(batch.length === 0 && page === 1 ? 'Keine Rezepte gefunden' : '');
      } catch {
        if (options.page && parseInt(options.page, 10) > 1) {
          setError('Fehler beim Laden weiterer Rezepte');
        } else {
          setError('Fehler beim Laden der Rezepte');
          setRecipes([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [query, options]);

  return { recipes, error, loading, hasMore };
}

export function useRecipeById(recipeId: string) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/recipes/${recipeId}`)
      .then((res) => res.json())
      .then((data) => {
        setRecipe(data.recipe ?? data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error loading recipe');
        setLoading(false);
      });
  }, [recipeId]);

  return { recipe, error, loading };
}

export function useRecipesByMealType(type: string) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        const res = await fetch(`/api/recipes?${params.toString()}`);
        const data = await res.json();
        setRecipes(data.recipes || []);
        setError(data.recipes && data.recipes.length === 0 ? 'Keine Rezepte gefunden' : '');
      } catch {
        setError('Error loading recipes');
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, [type]);

  return { recipes, error, loading };
}
