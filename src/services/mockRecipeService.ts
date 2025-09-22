import { useState, useEffect } from 'react';
import type { Recipe } from '@/types/recipe';
import { getSpoonacularRecipe } from './spoonacularService';

// Holt alle Rezepte (optional mit Filter)
export function useAllRecipes(query = '', options: Record<string, string> = {}) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.append('search', query);
        Object.entries(options).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
        const res = await fetch(`/api/recipes?${params.toString()}`);
        const data = await res.json();
        setRecipes(data.recipes || []);
        setError((data.recipes && data.recipes.length === 0) ? 'Keine Rezepte gefunden' : '');
      } catch {
        setError('Fehler beim Laden der Rezepte');
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  return { recipes, error, loading };
}

// Holt ein Rezept per ID
export function useRecipeById(recipeId: string) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // Try Spoonacular API first
    getSpoonacularRecipe(recipeId)
      .then((data) => {
        setRecipe(data);
        setError(!data ? 'Kein Rezept gefunden' : '');
        setLoading(false);
      })
      .catch((spoonacularError) => {
        if (process.env.NODE_ENV === 'development') {
          if (spoonacularError.message === 'SPOONACULAR_QUOTA_EXCEEDED') {
            console.log('ℹ️ Using cached recipe data');
          } else if (spoonacularError.message === 'SPOONACULAR_AUTH_FAILED') {
            console.warn('🔑 Spoonacular API authentication failed - check API key');
          } else {
            console.warn('⚠️ Spoonacular API unavailable - using cached recipe');
          }
        }
        
        // Fallback to preloaded recipes
        const preloadedRecipe = PRELOADED_RECIPES.find(r => r.id.toString() === recipeId);
        if (preloadedRecipe) {
          setRecipe(preloadedRecipe as unknown as Recipe);
          setError('');
        } else {
          setError('Kein Rezept gefunden');
        }
        setLoading(false);
      });
  }, [recipeId]);

  return { recipe, error, loading };
}

// Holt Rezepte nach Mahlzeitentyp
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
        setError((data.recipes && data.recipes.length === 0) ? 'Keine Rezepte gefunden' : '');
      } catch {
        setError('Fehler beim Laden der Rezepte');
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, [type]);

  return { recipes, error, loading };
}