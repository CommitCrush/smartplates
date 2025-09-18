/**
 * Mock Recipe Service
 * 
 * This service provides realistic recipe data for development and testing
 * of the meal planning system. It simulates the future Recipe API and can
 * be easily replaced when the real Recipe Management system is ready.
 */

// ========================================
// Mock Recipe Types (Compatible with future Recipe model)
// ========================================

export interface MockRecipe {
  import { useState, useEffect } from 'react';
  import { Recipe } from '@/types/recipe';
  import { searchSpoonacularRecipes, getSpoonacularRecipe } from './spoonacularService';

  // Hook: Holt alle Rezepte (optional mit Filter)
  export function useAllRecipes(query = '', options = {}) {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      setLoading(true);
      searchSpoonacularRecipes(query, options)
        .then(({ recipes }) => {
          if (recipes.length === 0) {
            setError('Keine Rezepte gefunden');
          }
          setRecipes(recipes);
          setLoading(false);
        })
        .catch(() => {
          setError('Fehler beim Laden der Rezepte');
          setLoading(false);
        });
    }, [query, JSON.stringify(options)]);

    return { recipes, error, loading };
  }

  // Hook: Holt ein Rezept per ID
  export function useRecipeById(recipeId: string) {
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      setLoading(true);
      getSpoonacularRecipe(recipeId)
        .then((data) => {
          if (!data) {
            setError('Kein Rezept gefunden');
          }
          setRecipe(data);
          setLoading(false);
        })
        .catch(() => {
          setError('Fehler beim Laden des Rezepts');
          setLoading(false);
        });
    }, [recipeId]);

    return { recipe, error, loading };
  }

  // Hook: Holt Rezepte nach Mahlzeitentyp
  export function useRecipesByMealType(type: string) {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      setLoading(true);
      searchSpoonacularRecipes('', { type })
        .then(({ recipes }) => {
          if (recipes.length === 0) {
            setError('Keine Rezepte gefunden');
          }
          setRecipes(recipes);
          setLoading(false);
        })
        .catch(() => {
          setError('Fehler beim Laden der Rezepte');
          setLoading(false);
        });
    }, [type]);

    return { recipes, error, loading };
  }
  {
    id: 'breakfast-1',
    title: 'Fluffy Pancakes',
    description: 'Light and fluffy pancakes perfect for weekend mornings',
    cookingTime: 15,
    prepTime: 10,
    servings: 4,
    difficulty: 'easy',
    category: 'Breakfast',
    cuisine: 'American',
    tags: ['quick', 'family-friendly', 'weekend'],
    ingredients: ['flour', 'eggs', 'milk', 'baking powder', 'sugar', 'butter'],
    instructions: ['Mix dry ingredients', 'Combine wet ingredients', 'Cook on griddle'],
    nutrition: { calories: 320, protein: 8, carbs: 45, fat: 12 },
    rating: 4.7,
    reviewCount: 124,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    isDairyFree: false,
    createdBy: 'mock-user-1'
  },
  {
    id: 'breakfast-2',
    title: 'Avocado Toast',
    description: 'Healthy and delicious avocado toast with optional toppings',
    cookingTime: 5,
    prepTime: 5,
    servings: 2,
    difficulty: 'easy',
    category: 'Breakfast',
    cuisine: 'Modern',
    tags: ['healthy', 'quick', 'vegetarian'],
    ingredients: ['bread', 'avocado', 'lime', 'salt', 'pepper', 'tomato'],
    instructions: ['Toast bread', 'Mash avocado', 'Assemble and season'],
    nutrition: { calories: 280, protein: 6, carbs: 25, fat: 18 },
    rating: 4.5,
    reviewCount: 89,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: false,
    isDairyFree: true,
    createdBy: 'mock-user-2'
  },
  {
    id: 'breakfast-3',
    title: 'Greek Yogurt Bowl',
    description: 'Protein-rich yogurt bowl with fresh berries and granola',
    cookingTime: 0,
    prepTime: 5,
    servings: 1,
    difficulty: 'easy',
    category: 'Breakfast',
    cuisine: 'Mediterranean',
    tags: ['healthy', 'protein', 'no-cook'],
    ingredients: ['greek yogurt', 'berries', 'granola', 'honey', 'nuts'],
    instructions: ['Layer ingredients in bowl', 'Drizzle with honey'],
    nutrition: { calories: 250, protein: 15, carbs: 30, fat: 8 },
    rating: 4.8,
    reviewCount: 156,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    isDairyFree: false,
    createdBy: 'mock-user-3'
  },

  // LUNCH RECIPES
  {
    id: 'lunch-1',
    title: 'Caesar Salad',
    description: 'Classic Caesar salad with homemade croutons',
    cookingTime: 10,
    prepTime: 15,
    servings: 4,
    difficulty: 'medium',
    category: 'Lunch',
    cuisine: 'Italian',
    tags: ['salad', 'classic', 'fresh'],
    ingredients: ['romaine lettuce', 'parmesan', 'croutons', 'caesar dressing', 'anchovies'],
    instructions: ['Prepare dressing', 'Toss lettuce', 'Add toppings'],
    nutrition: { calories: 180, protein: 8, carbs: 12, fat: 12 },
    rating: 4.6,
    reviewCount: 203,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isDairyFree: false,
    createdBy: 'mock-user-1'
  },
  {
    id: 'lunch-2',
    title: 'Quinoa Buddha Bowl',
    description: 'Nutritious bowl with quinoa, roasted vegetables, and tahini dressing',
    cookingTime: 25,
    prepTime: 15,
    servings: 2,
    difficulty: 'medium',
    category: 'Lunch',
    cuisine: 'Modern',
    tags: ['healthy', 'bowl', 'plant-based'],
    ingredients: ['quinoa', 'chickpeas', 'sweet potato', 'kale', 'tahini', 'lemon'],
    instructions: ['Cook quinoa', 'Roast vegetables', 'Assemble bowl', 'Drizzle dressing'],
    nutrition: { calories: 420, protein: 16, carbs: 58, fat: 14 },
    rating: 4.9,
    reviewCount: 87,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isDairyFree: true,
    createdBy: 'mock-user-2'
  },
  {
    id: 'lunch-3',
    title: 'Turkey Club Sandwich',
    description: 'Classic club sandwich with turkey, bacon, and fresh vegetables',
    cookingTime: 10,
    prepTime: 10,
    servings: 2,
    difficulty: 'easy',
    category: 'Lunch',
    cuisine: 'American',
    tags: ['sandwich', 'classic', 'protein'],
    ingredients: ['bread', 'turkey', 'bacon', 'lettuce', 'tomato', 'mayo'],
    instructions: ['Toast bread', 'Cook bacon', 'Assemble sandwich'],
    nutrition: { calories: 485, protein: 28, carbs: 35, fat: 24 },
    rating: 4.4,
    reviewCount: 145,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isDairyFree: false,
    createdBy: 'mock-user-3'
  },

  // DINNER RECIPES
  {
    id: 'dinner-1',
    title: 'Spaghetti Carbonara',
    description: 'Authentic Italian carbonara with eggs, cheese, and pancetta',
    cookingTime: 20,
    prepTime: 10,
    servings: 4,
    difficulty: 'medium',
    category: 'Dinner',
    cuisine: 'Italian',
    tags: ['pasta', 'classic', 'comfort-food'],
    ingredients: ['spaghetti', 'eggs', 'parmesan', 'pancetta', 'black pepper'],
    instructions: ['Cook pasta', 'Prepare sauce', 'Combine carefully'],
    nutrition: { calories: 520, protein: 22, carbs: 58, fat: 22 },
    rating: 4.8,
    reviewCount: 312,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isDairyFree: false,
    createdBy: 'mock-user-1'
  },
  {
    id: 'dinner-2',
    title: 'Grilled Salmon',
    description: 'Perfectly grilled salmon with lemon herb seasoning',
    cookingTime: 15,
    prepTime: 10,
    servings: 4,
    difficulty: 'medium',
    category: 'Dinner',
    cuisine: 'Mediterranean',
    tags: ['fish', 'healthy', 'protein', 'grilled'],
    ingredients: ['salmon', 'lemon', 'herbs', 'olive oil', 'garlic'],
    instructions: ['Season salmon', 'Preheat grill', 'Grill to perfection'],
    nutrition: { calories: 380, protein: 35, carbs: 2, fat: 26 },
    rating: 4.7,
    reviewCount: 198,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isDairyFree: true,
    createdBy: 'mock-user-2'
  },
  {
    id: 'dinner-3',
    title: 'Chicken Stir Fry',
    description: 'Quick and healthy chicken stir fry with mixed vegetables',
    cookingTime: 15,
    prepTime: 15,
    servings: 4,
    difficulty: 'easy',
    category: 'Dinner',
    cuisine: 'Asian',
    tags: ['stir-fry', 'quick', 'healthy', 'one-pan'],
    ingredients: ['chicken breast', 'mixed vegetables', 'soy sauce', 'ginger', 'garlic'],
    instructions: ['Prep ingredients', 'Cook chicken', 'Add vegetables', 'Stir fry'],
    nutrition: { calories: 320, protein: 28, carbs: 18, fat: 14 },
    rating: 4.5,
    reviewCount: 167,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isDairyFree: true,
    createdBy: 'mock-user-3'
  },

  // SNACK RECIPES
  {
    id: 'snack-1',
    title: 'Energy Balls',
    description: 'No-bake energy balls with dates, nuts, and chocolate chips',
    cookingTime: 0,
    prepTime: 15,
    servings: 12,
    difficulty: 'easy',
    category: 'Snacks',
    cuisine: 'Modern',
    tags: ['no-bake', 'healthy', 'energy', 'sweet'],
    ingredients: ['dates', 'almonds', 'oats', 'chocolate chips', 'coconut'],
    instructions: ['Blend ingredients', 'Form balls', 'Chill'],
    nutrition: { calories: 95, protein: 3, carbs: 12, fat: 5 },
    rating: 4.6,
    reviewCount: 234,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isDairyFree: true,
    createdBy: 'mock-user-1'
  },
  {
    id: 'snack-2',
    title: 'Hummus & Veggies',
    description: 'Fresh vegetables with homemade hummus',
    cookingTime: 0,
    prepTime: 10,
    servings: 4,
    difficulty: 'easy',
    category: 'Snacks',
    cuisine: 'Mediterranean',
    tags: ['healthy', 'no-cook', 'vegetables', 'dip'],
    ingredients: ['chickpeas', 'tahini', 'lemon', 'carrots', 'cucumber', 'bell pepper'],
    instructions: ['Make hummus', 'Cut vegetables', 'Serve together'],
    nutrition: { calories: 120, protein: 5, carbs: 15, fat: 6 },
    rating: 4.4,
    reviewCount: 98,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isDairyFree: true,
    createdBy: 'mock-user-2'
  }
];

// ========================================
// Mock Recipe Service Class
// ========================================

export class MockRecipeService {
  private static recipes: MockRecipe[] = MOCK_RECIPES;

  /**
   * Get all recipes
   */
  static async getAllRecipes(): Promise<MockRecipe[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.recipes];
  }

  /**
   * Get recipe by ID
   */
  static async getRecipeById(id: string): Promise<MockRecipe | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.recipes.find(recipe => recipe.id === id) || null;
  }

  /**
   * Get recipes by category
   */
  static async getRecipesByCategory(category: string): Promise<MockRecipe[]> {
    await new Promise(resolve => setTimeout(resolve, 250));
    return this.recipes.filter(recipe => 
      recipe.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Search recipes by title or ingredients
   */
  static async searchRecipes(query: string): Promise<MockRecipe[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const lowercaseQuery = query.toLowerCase();
    
    return this.recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(lowercaseQuery) ||
      recipe.description.toLowerCase().includes(lowercaseQuery) ||
      recipe.ingredients.some(ingredient => 
        ingredient.toLowerCase().includes(lowercaseQuery)
      ) ||
      recipe.tags.some(tag => 
        tag.toLowerCase().includes(lowercaseQuery)
      )
    );
  }

  /**
   * Get recipes with filters
   */
  static async getFilteredRecipes(filters: {
    category?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    maxCookingTime?: number;
    isVegetarian?: boolean;
    isVegan?: boolean;
    isGlutenFree?: boolean;
    isDairyFree?: boolean;
    cuisine?: string;
  }): Promise<MockRecipe[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    let filtered = [...this.recipes];

    if (filters.category) {
      filtered = filtered.filter(recipe => 
        recipe.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }

    if (filters.difficulty) {
      filtered = filtered.filter(recipe => recipe.difficulty === filters.difficulty);
    }

    if (filters.maxCookingTime) {
      filtered = filtered.filter(recipe => recipe.cookingTime <= filters.maxCookingTime!);
    }

    if (filters.isVegetarian) {
      filtered = filtered.filter(recipe => recipe.isVegetarian);
    }

    if (filters.isVegan) {
      filtered = filtered.filter(recipe => recipe.isVegan);
    }

    if (filters.isGlutenFree) {
      filtered = filtered.filter(recipe => recipe.isGlutenFree);
    }

    if (filters.isDairyFree) {
      filtered = filtered.filter(recipe => recipe.isDairyFree);
    }

    if (filters.cuisine) {
      filtered = filtered.filter(recipe => 
        recipe.cuisine.toLowerCase() === filters.cuisine!.toLowerCase()
      );
    }

    return filtered;
  }

  /**
   * Get random recipes
   */
  static async getRandomRecipes(count: number = 3): Promise<MockRecipe[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const shuffled = [...this.recipes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Get popular recipes (highest rated)
   */
  static async getPopularRecipes(limit: number = 5): Promise<MockRecipe[]> {
    await new Promise(resolve => setTimeout(resolve, 250));
    return [...this.recipes]
      .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
      .slice(0, limit);
  }

  /**
   * Get quick recipes (under 30 minutes total time)
   */
  static async getQuickRecipes(): Promise<MockRecipe[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.recipes.filter(recipe => 
      (recipe.cookingTime + recipe.prepTime) <= 30
    );
  }

  /**
   * Get all available categories
   */
  static async getCategories(): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const categories = [...new Set(this.recipes.map(recipe => recipe.category))];
    return categories.sort();
  }

  /**
   * Get all available cuisines
   */
  static async getCuisines(): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const cuisines = [...new Set(this.recipes.map(recipe => recipe.cuisine))];
    return cuisines.sort();
  }

  /**
   * Get recipes for meal planning (formatted for MealSlot)
   */
  static async getRecipesForMealPlanning(): Promise<{
    id: string;
    name: string;
    cookingTime: number;
    prepTime: number;
    category: string;
    difficulty: string;
    rating: number;
  }[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return this.recipes.map(recipe => ({
      id: recipe.id,
      name: recipe.title,
      cookingTime: recipe.cookingTime,
      prepTime: recipe.prepTime,
      category: recipe.category,
      difficulty: recipe.difficulty,
      rating: recipe.rating
    }));
  }
}

// ========================================
// Utility Functions
// ========================================

/**
 * Convert MockRecipe to MealSlot format
 */
export function mockRecipeToMealSlot(recipe: MockRecipe, servings: number = 1): {
  recipeId: string;
  recipeName: string;
  servings: number;
  cookingTime: number;
  prepTime: number;
} {
  return {
    recipeId: recipe.id,
    recipeName: recipe.title,
    servings,
    cookingTime: recipe.cookingTime,
    prepTime: recipe.prepTime
  };
}

/**
 * Get recipes grouped by meal type/category
 */
export async function getRecipesByMealType(): Promise<{
  breakfast: MockRecipe[];
  lunch: MockRecipe[];
  dinner: MockRecipe[];
  snacks: MockRecipe[];
}> {
  const recipes = await MockRecipeService.getAllRecipes();
  
  return {
    breakfast: recipes.filter(r => r.category === 'Breakfast'),
    lunch: recipes.filter(r => r.category === 'Lunch'),
    dinner: recipes.filter(r => r.category === 'Dinner'),
    snacks: recipes.filter(r => r.category === 'Snacks')
  };
}

export default MockRecipeService;