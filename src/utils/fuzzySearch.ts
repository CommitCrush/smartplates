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
  
  // Einfache aber effektive Tippfehler-Korrekturen
  const commonMisspellings: { [key: string]: string } = {
    'chiken': 'chicken',
    'chicen': 'chicken', 
    'chikken': 'chicken',
    'pata': 'pasta',
    'past': 'pasta',
    'tomate': 'tomato',
    'tomatoe': 'tomato',
    'potatoe': 'potato',
    'chese': 'cheese',
    'ches': 'cheese',
    'mushrom': 'mushroom',
    'salomon': 'salmon',
    'beaf': 'beef',
    'prok': 'pork',
    'sope': 'soup',
    'supe': 'soup'
  };

  // Korrigierte Query falls Tippfehler erkannt
  const correctedQuery = commonMisspellings[query] || query;
  if (correctedQuery !== query) {
    console.log(`🔧 Typo corrected: "${query}" → "${correctedQuery}"`);
  }

  const results = recipes.filter((recipe) => {
    const title = recipe.title.toLowerCase();
    const ingredients = recipe.extendedIngredients || [];
    
    // 1. Exact match in title (höchste Priorität)
    if (title.includes(query) || title.includes(correctedQuery)) {
      console.log(`✅ Title match: "${query}" in "${recipe.title}"`);
      return true;
    }
    
    // 2. Exact match in ingredients
    const ingredientMatch = ingredients.some(ingredient => {
      const ingredientName = (ingredient.name || ingredient.originalName || '').toLowerCase();
      if (ingredientName.includes(query) || ingredientName.includes(correctedQuery)) {
        console.log(`✅ Ingredient match: "${query}" in "${ingredientName}" for "${recipe.title}"`);
        return true;
      }
      return false;
    });
    
    if (ingredientMatch) return true;
    
    // 3. Word-based fuzzy match für längere Begriffe (≥4 Zeichen)
    if (query.length >= 4) {
      const titleWords = title.split(/\s+/);
      const titleFuzzyMatch = titleWords.some(word => {
        if (word.length >= 4) {
          // Einfache Ähnlichkeit: Wort beginnt mit Query oder Query beginnt mit Wort
          if (word.startsWith(query.substring(0, Math.min(4, query.length))) ||
              query.startsWith(word.substring(0, Math.min(4, word.length)))) {
            console.log(`🎯 Title fuzzy match: "${query}" ≈ "${word}" in "${recipe.title}"`);
            return true;
          }
        }
        return false;
      });
      
      if (titleFuzzyMatch) return true;
      
      // Fuzzy match in ingredients
      const ingredientFuzzyMatch = ingredients.some(ingredient => {
        const ingredientName = (ingredient.name || ingredient.originalName || '').toLowerCase();
        const ingredientWords = ingredientName.split(/\s+/);
        
        return ingredientWords.some(word => {
          if (word.length >= 4) {
            if (word.startsWith(query.substring(0, Math.min(4, query.length))) ||
                query.startsWith(word.substring(0, Math.min(4, word.length)))) {
              console.log(`🥘 Ingredient fuzzy match: "${query}" ≈ "${word}" in "${recipe.title}"`);
              return true;
            }
          }
          return false;
        });
      });
      
      if (ingredientFuzzyMatch) return true;
    }
    
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
    
    if (difficulty === 'easy') return true; // Bereits durch API gefiltert
    if (difficulty === 'medium') return cookTime >= 15 && cookTime <= 30;
    if (difficulty === 'hard') return cookTime > 30;
    
    return true;
  });
};