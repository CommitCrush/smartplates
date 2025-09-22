import { useState, useEffect } from 'react';
import { Recipe } from '@/types/recipe';
import { searchSpoonacularRecipes, getSpoonacularRecipe } from './spoonacularService';
import { PRELOADED_RECIPES } from './preloadedRecipes';
import { logSpoonacularQuota } from '@/utils/spoonacularQuota';

// Simple in-memory cache to avoid repeated API calls
const recipeCache = new Map<string, { recipes: Recipe[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Holt alle Rezepte (optional mit Filter)
export function useAllRecipes(query = '', options = {}) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Debounce API calls to prevent excessive requests
    const timeoutId = setTimeout(() => {
      setLoading(true);
      const opts = { ...options, number: 24 };
      
      // Create cache key from query and options
      const cacheKey = JSON.stringify({ query, options: opts });
      const cached = recipeCache.get(cacheKey);
      
      // Check if we have fresh cached data
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('📝 Using cached recipes for:', query || 'all recipes');
        setRecipes(cached.recipes);
        setError(cached.recipes.length === 0 ? 'Keine Rezepte gefunden' : '');
        setLoading(false);
        return;
      }
      
      // Try Spoonacular API first
      searchSpoonacularRecipes(query, opts)
        .then(({ recipes }) => {
          // Cache the successful response
          recipeCache.set(cacheKey, { recipes, timestamp: Date.now() });
          setRecipes(recipes);
          setError(recipes.length === 0 ? 'Keine Rezepte gefunden' : '');
          setLoading(false);
        })
        .catch((spoonacularError) => {
        // Check the error type and provide appropriate feedback
        if (spoonacularError.message === 'SPOONACULAR_QUOTA_EXCEEDED') {
          if (process.env.NODE_ENV === 'development') {
            console.log('ℹ️ Spoonacular API quota exceeded - using cached recipes');
            // Log detailed quota information
            setTimeout(() => logSpoonacularQuota(), 1000);
          }
        } else if (spoonacularError.message === 'SPOONACULAR_AUTH_FAILED') {
          if (process.env.NODE_ENV === 'development') {
            console.warn('🔑 Spoonacular API authentication failed - check API key');
          }
        } else if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Spoonacular API unavailable - using cached recipes');
        }
        
                // Fallback to preloaded recipes
        setRecipes(PRELOADED_RECIPES as unknown as Recipe[]);
        setError('');
        setLoading(false);
      });
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
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
    setLoading(true);
    
    // Try Spoonacular API first
    searchSpoonacularRecipes('', { type })
      .then(({ recipes }) => {
        setRecipes(recipes);
        setError(recipes.length === 0 ? 'Keine Rezepte gefunden' : '');
        setLoading(false);
      })
      .catch((spoonacularError) => {
        if (process.env.NODE_ENV === 'development') {
          if (spoonacularError.message === 'SPOONACULAR_QUOTA_EXCEEDED') {
            console.log('ℹ️ Using cached recipes for meal type:', type);
          } else if (spoonacularError.message === 'SPOONACULAR_AUTH_FAILED') {
            console.warn('🔑 Spoonacular API authentication failed - check API key');
          } else {
            console.warn('⚠️ Spoonacular API unavailable - using cached recipes');
          }
        }
        
        // Fallback to preloaded recipes
        // Filter by meal type/category if needed
        const filteredRecipes = PRELOADED_RECIPES.filter(recipe => 
          recipe.category?.toLowerCase().includes(type.toLowerCase()) || 
          !type // If no type specified, return all
        );
        
        setRecipes(filteredRecipes as unknown as Recipe[]);
        setError(filteredRecipes.length === 0 ? 'Keine Rezepte gefunden' : '');
        setLoading(false);
      });
  }, [type]);

  return { recipes, error, loading };
}