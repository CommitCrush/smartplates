import { useState, useEffect } from 'react';
import { Recipe } from '@/types/recipe';
import { searchSpoonacularRecipes, getSpoonacularRecipe } from './spoonacularService';

// Holt alle Rezepte (optional mit Filter)
export function useAllRecipes(query = '', options = {}) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const opts = { ...options, number: 24 };
    searchSpoonacularRecipes(query, opts)
      .then(({ recipes }) => {
        setRecipes(recipes);
        setError(recipes.length === 0 ? 'Keine Rezepte gefunden' : '');
        setLoading(false);
      })
      .catch(() => {
        setError('Fehler beim Laden der Rezepte');
        setLoading(false);
      });
  }, [query, JSON.stringify(options)]);

  return { recipes, error, loading };
}

// Holt ein Rezept per ID
export function useRecipeById(recipeId: string) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getSpoonacularRecipe(recipeId)
      .then((data) => {
        setRecipe(data);
        setError(!data ? 'Kein Rezept gefunden' : '');
        setLoading(false);
      })
      .catch(() => {
        setError('Fehler beim Laden des Rezepts');
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
    setLoading(true);
  searchSpoonacularRecipes('', { type })
      .then(({ recipes }) => {
        setRecipes(recipes);
        setError(recipes.length === 0 ? 'Keine Rezepte gefunden' : '');
        setLoading(false);
      })
      .catch(() => {
        setError('Fehler beim Laden der Rezepte');
        setLoading(false);
      });
  }, [type]);

  return { recipes, error, loading };
}