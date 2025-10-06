// Utility functions for filtering recipes by category, diet, allergy, and difficulty
import { Recipe } from '@/types/recipe';

// Category: Breakfast, Lunch, Dinner, Dessert, Snack
export function filterByCategory(recipes: Recipe[], category: string): Recipe[] {
  if (!category) return recipes;
  return recipes.filter(recipe =>
    recipe.dishTypes?.some(type => type.toLowerCase() === category.toLowerCase())
  );
}

// Diet: Vegetarian, Vegan, Gluten-Free, Ketogenic, Paleo, Primal, Whole30
export function filterByDiet(recipes: Recipe[], diet: string): Recipe[] {
  if (!diet) return recipes;
  return recipes.filter(recipe =>
    recipe.diets?.some(d => d.toLowerCase() === diet.toLowerCase())
  );
}

// Allergy/Intolerance: Dairy, Egg, Gluten, Peanut, Seafood, Sesame, Soy, Sulfite, Tree Nut, Wheat
export function filterByAllergy(recipes: Recipe[], allergy: string): Recipe[] {
  if (!allergy) return recipes;
  // Spoonacular uses 'intolerances' for allergies, but we check ingredients for a match
  return recipes.filter(recipe =>
    !recipe.extendedIngredients?.some(ing =>
      ing.name.toLowerCase().includes(allergy.toLowerCase())
    )
  );
}

// Difficulty: Easy (<=15min), Medium (<=30min), Hard (>30min)
export function filterByDifficulty(recipes: Recipe[], difficulty: string): Recipe[] {
  if (!difficulty) return recipes;
  if (difficulty === 'easy') {
    return recipes.filter(r => (r.readyInMinutes || 0) <= 15);
  }
  if (difficulty === 'medium') {
    return recipes.filter(r => (r.readyInMinutes || 0) > 15 && (r.readyInMinutes || 0) <= 30);
  }
  if (difficulty === 'hard') {
    return recipes.filter(r => (r.readyInMinutes || 0) > 30);
  }
  return recipes;
}

// Combined filter utility
export function filterRecipes(
  recipes: Recipe[],
  { category, diet, allergy, difficulty }: { category?: string; diet?: string; allergy?: string; difficulty?: string }
): Recipe[] {
  let filtered = recipes;
  filtered = filterByCategory(filtered, category || '');
  filtered = filterByDiet(filtered, diet || '');
  filtered = filterByAllergy(filtered, allergy || '');
  filtered = filterByDifficulty(filtered, difficulty || '');
  return filtered;
}
