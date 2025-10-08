import type { Recipe } from '@/types/recipe';

// Levenshtein Distance für Ähnlichkeitsberechnung
const calculateSimilarity = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  const distance = matrix[str2.length][str1.length];
  const maxLength = Math.max(str1.length, str2.length);
  return (maxLength - distance) / maxLength;
};

// Tippfehler-Wörterbuch
const misspellings: { [key: string]: string[] } = {
  'pasta': ['pata', 'past', 'nudel', 'nudeln', 'noodle', 'noodles'],
  'chicken': ['chiken', 'chicen', 'chikken', 'hähnchen', 'huhn'],
  'tomato': ['tomate', 'tomaten', 'tomatoe', 'tomatos'],
  'cheese': ['chese', 'käse', 'ches', 'chees'],
  'chocolate': ['choclate', 'schokolade', 'schoko', 'chocolat'],
  'mushroom': ['mushrom', 'pilz', 'pilze', 'champignon', 'mushrooms'],
  'potato': ['potatoe', 'kartoffel', 'kartoffeln', 'potatos'],
  'salmon': ['salomon', 'lachs', 'salmoon'],
  'beef': ['rindfleisch', 'rind', 'beaf'],
  'pork': ['schwein', 'schweinefleisch', 'prok'],
  'soup': ['sope', 'supe', 'soupe', 'suppe'],
};

// Hilfsfunktion: Prüft ob Query eine bekannte Tippfehler-Variante ist
const getCorrectSpelling = (query: string): string[] => {
  const corrections: string[] = [];
  
  for (const [correct, variants] of Object.entries(misspellings)) {
    if (variants.some(variant => 
      query === variant || 
      query.includes(variant) || 
      variant.includes(query)
    )) {
      corrections.push(correct);
      // Füge auch alle anderen Varianten hinzu
      corrections.push(...variants.filter(v => v !== query));
    }
  }
  
  return [...new Set(corrections)]; // Duplikate entfernen
};

// Hauptfunktion: Fuzzy Search für Rezepte
export const fuzzySearchRecipes = (recipes: Recipe[], searchQuery: string): Recipe[] => {
  if (!searchQuery || searchQuery.trim().length === 0) return recipes;
  
  const query = searchQuery.toLowerCase().trim();
  
  return recipes.filter((recipe) => {
    const title = recipe.title.toLowerCase();
    const ingredients = recipe.extendedIngredients || [];
    
    // 1. Exakte Titel-Suche (höchste Priorität)
    if (title.includes(query)) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Exakte Titel-Übereinstimmung: "${query}" in "${recipe.title}"`);
      }
      return true;
    }
    
    // 2. Exakte Zutaten-Suche
    const exactIngredientMatch = ingredients.some(ingredient => {
      const ingredientName = (ingredient.name || ingredient.originalName || '').toLowerCase();
      return ingredientName.includes(query);
    });
    
    if (exactIngredientMatch) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Exakte Zutaten-Übereinstimmung: "${query}" in "${recipe.title}"`);
      }
      return true;
    }
    
    // 3. Tippfehler-Korrektur (erweitert)
    const corrections = getCorrectSpelling(query);
    if (corrections.length > 0) {
      const correctionMatch = corrections.some(correct => {
        const titleMatch = title.includes(correct);
        const ingredientMatch = ingredients.some(ingredient => {
          const ingredientName = (ingredient.name || ingredient.originalName || '').toLowerCase();
          return ingredientName.includes(correct);
        });
        
        if (titleMatch || ingredientMatch) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`🔧 Tippfehler korrigiert: "${query}" → "${correct}" in "${recipe.title}"`);
          }
          return true;
        }
        return false;
      });
      
      if (correctionMatch) return true;
    }
    
    // 4. Fuzzy Search für längere Begriffe (≥4 Zeichen)
    if (query.length >= 4) {
      // Titel-Wörter-Ähnlichkeit
      const titleWords = title.split(/\s+/);
      const titleFuzzyMatch = titleWords.some(word => {
        if (word.length >= 4) {
          const similarity = calculateSimilarity(query, word);
          if (similarity >= 0.7) {
            if (process.env.NODE_ENV === 'development') {
              console.log(`🎯 Titel-Ähnlichkeit: "${query}" → "${word}" (${Math.round(similarity * 100)}%) in "${recipe.title}"`);
            }
            return true;
          }
        }
        return false;
      });
      
      if (titleFuzzyMatch) return true;
      
      // Zutaten-Wörter-Ähnlichkeit
      const ingredientFuzzyMatch = ingredients.some(ingredient => {
        const ingredientName = (ingredient.name || ingredient.originalName || '').toLowerCase();
        const ingredientWords = ingredientName.split(/\s+/);
        
        return ingredientWords.some(word => {
          if (word.length >= 4) {
            const similarity = calculateSimilarity(query, word);
            if (similarity >= 0.7) {
              if (process.env.NODE_ENV === 'development') {
                console.log(`🥘 Zutaten-Ähnlichkeit: "${query}" → "${word}" (${Math.round(similarity * 100)}%) in "${recipe.title}"`);
              }
              return true;
            }
          }
          return false;
        });
      });
      
      if (ingredientFuzzyMatch) return true;
    }
    
    // 5. Teilstring-Ähnlichkeit für mittlere Begriffe (3-4 Zeichen)
    if (query.length === 3 || query.length === 4) {
      const partialTitleMatch = title.split(/\s+/).some(word => 
        word.includes(query) || query.includes(word.substring(0, 3))
      );
      
      if (partialTitleMatch) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔍 Teilstring-Match im Titel: "${query}" in "${recipe.title}"`);
        }
        return true;
      }
      
      const partialIngredientMatch = ingredients.some(ingredient => {
        const ingredientName = (ingredient.name || ingredient.originalName || '').toLowerCase();
        return ingredientName.split(/\s+/).some(word => 
          word.includes(query) || query.includes(word.substring(0, 3))
        );
      });
      
      if (partialIngredientMatch) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔍 Teilstring-Match in Zutaten: "${query}" in "${recipe.title}"`);
        }
        return true;
      }
    }
    
    // Debug für spezielle Testfälle
    if (process.env.NODE_ENV === 'development' && (query === 'chiken' || query === 'soupe')) {
      console.log(`❌ Kein Match für "${query}" in "${recipe.title}"`);
      console.log('Titel:', title);
      console.log('Zutaten:', ingredients.map(i => i.name || i.originalName));
      console.log('Gefundene Korrekturen:', corrections);
    }
    
    return false;
  });
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