import type { Recipe } from '@/types/recipe';

// Vereinfachtes und präzises Fuzzy Search für Title + Ingredients
export const fuzzySearchRecipes = (recipes: Recipe[], searchQuery: string): Recipe[] => {
  console.log('🔍 Fuzzy Search started:', { 
    recipesCount: recipes.length, 
    searchQuery: `"${searchQuery}"` 
  });

  if (!searchQuery || searchQuery.trim().length === 0) {
    console.log('✅ Empty query, returning all recipes:', recipes.length);
    return recipes;
  }
  
  const query = searchQuery.toLowerCase().trim();
  console.log('🔍 Normalized query:', `"${query}"`);
  
  // Einfache aber effektive Tippfehler-Korrekturen - Array-basiert
  const commonMisspellings: { [key: string]: string[] } = {
    'pasta': ['pata', 'past', 'pasta'],
    'chicken': ['chiken', 'chicen', 'chikken', 'chicken'],
    'tomato': ['tomate', 'tomatoe', 'tomatos', 'tomato'],
    'potato': ['potatoe', 'kartoffel', 'kartoffeln', 'potato'],
    'cheese': ['chese', 'ches', 'käse', 'cheese'],
    'mushroom': ['mushrom', 'pilz', 'pilze', 'mushroom'],
    'salmon': ['salomon', 'lachs', 'salmon'],
    'beef': ['beaf', 'bef', 'rindfleisch', 'beef'],
    'pork': ['prok', 'schwein', 'schweinefleisch', 'pork'],
    'soup': ['sope', 'supe', 'soupe', 'suppe', 'soup'],
  };

  // Finde das korrekte Wort falls Tippfehler erkannt
  let correctedQuery = query;
  for (const [correct, variants] of Object.entries(commonMisspellings)) {
    if (variants.includes(query)) {
      correctedQuery = correct;
      console.log(`🔧 Typo corrected: "${query}" → "${correctedQuery}"`);
      break;
    }
  }

  const results = recipes.filter((recipe) => {
    const title = recipe.title.toLowerCase();
    const ingredients = recipe.extendedIngredients || [];
    
    // NUR verwende correctedQuery wenn es wirklich eine Korrektur gab
    const searchTerm = correctedQuery !== query ? correctedQuery : query;
    
    // 1. Exact match in title (höchste Priorität)
    if (title.includes(searchTerm)) {
      console.log(`✅ Title match: "${searchTerm}" in "${recipe.title}"`);
      return true;
    }
    
    // 2. Exact match in ingredients
    const ingredientMatch = ingredients.some(ingredient => {
      const ingredientName = (ingredient.name || ingredient.originalName || '').toLowerCase();
      if (ingredientName.includes(searchTerm)) {
        console.log(`✅ Ingredient match: "${searchTerm}" in "${ingredientName}" for "${recipe.title}"`);
        return true;
      }
      return false;
    });
    
    if (ingredientMatch) return true;
    
    // 3. KEINE Fuzzy-Matches mehr - nur exakte Suche
    return false;
  });
  
  console.log(`🎯 Final results: ${results.length} von ${recipes.length} recipes found`);
  return results;
};

// Difficulty Filter
export const filterRecipesByDifficulty = (recipes: Recipe[], difficulty: string): Recipe[] => {
  if (!difficulty) return recipes;
  
  return recipes.filter((recipe) => {
    const cookTime = recipe.readyInMinutes || 0;
    
    if (difficulty === 'easy') return cookTime <= 15; // Easy: bis 15 Minuten
    if (difficulty === 'medium') return cookTime >= 15 && cookTime <= 30; // Medium: 15-30 Minuten
    if (difficulty === 'hard') return cookTime > 30; // Hard: über 30 Minuten
    
    return true;
  });
};