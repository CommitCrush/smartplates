/**
 * Spoonacular API Service
 * 
 * Integration with Spoonacular API for external recipe data
 * Replaces mock implementations with real recipe data
 */

import { Recipe } from '@/types/recipe';

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
console.log('DEBUG Spoonacular API Key:', SPOONACULAR_API_KEY);
const BASE_URL = 'https://api.spoonacular.com/recipes';

if (!SPOONACULAR_API_KEY) {
  console.warn('SPOONACULAR_API_KEY not found in environment variables');
}

/**
 * Interface for Spoonacular API response
 */
interface SpoonacularRecipe {
  id: number;
  title: string;
  summary: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  extendedIngredients: Array<{
    id: number;
    name: string;
    amount: number;
    unit: string;
  }>;
  analyzedInstructions: Array<{
    steps: Array<{
      number: number;
      step: string;
    }>;
  }>;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  nutrition?: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
}

interface SpoonacularSearchResponse {
  results: SpoonacularRecipe[];
  totalResults: number;
}

/**
 * Converts Spoonacular recipe to our Recipe format
 */
function convertSpoonacularRecipe(spoonacularRecipe: SpoonacularRecipe): Recipe {
  const ingredients = spoonacularRecipe.extendedIngredients.map((ing, index) => ({
    id: `spoonacular-ingredient-${index}`,
    name: ing.name,
    amount: ing.amount,
    unit: ing.unit,
    notes: ''
  }));

  const instructions = spoonacularRecipe.analyzedInstructions[0]?.steps.map((step) => ({
    id: `spoonacular-step-${step.number}`,
    stepNumber: step.number,
    instruction: step.step
  })) || [];

  // Determine meal type from dish types
  let category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' = 'dinner'; // default
  const dishTypes = spoonacularRecipe.dishTypes || [];
  if (dishTypes.includes('breakfast')) category = 'breakfast';
  else if (dishTypes.includes('lunch')) category = 'lunch';
  else if (dishTypes.includes('dessert')) category = 'dessert';
  else if (dishTypes.includes('snack')) category = 'snack';

  // Clean HTML from summary
  const description = spoonacularRecipe.summary.replace(/<[^>]*>/g, '');

  return {
    id: `spoonacular-${spoonacularRecipe.id}`,
    title: spoonacularRecipe.title,
    description: description.substring(0, 300) + '...', // Truncate long descriptions
    image: spoonacularRecipe.image,
    servings: spoonacularRecipe.servings,
    prepTime: Math.floor(spoonacularRecipe.readyInMinutes * 0.3),
    cookTime: Math.floor(spoonacularRecipe.readyInMinutes * 0.7),
    totalTime: spoonacularRecipe.readyInMinutes,
    difficulty: 'medium' as const,
    category,
    cuisine: spoonacularRecipe.cuisines[0] || 'international',
    dietaryRestrictions: (spoonacularRecipe.diets as ('vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'nut-free' | 'keto' | 'paleo')[]) || [],
    tags: [
      ...spoonacularRecipe.cuisines,
      ...spoonacularRecipe.diets,
      'spoonacular'
    ],
    ingredients,
    instructions,
    rating: 4.0,
    ratingsCount: 0,
    likesCount: 0,
    authorId: 'spoonacular',
    authorName: 'Spoonacular',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublished: true
  };
}

/**
 * Search recipes from Spoonacular API
 */
export async function searchSpoonacularRecipes(
  query: string,
  options: {
    cuisine?: string;
    diet?: string;
    type?: string;
    maxReadyTime?: number;
    number?: number;
    offset?: number;
  } = {}
): Promise<{ recipes: Recipe[]; totalResults: number }> {
  if (!SPOONACULAR_API_KEY) {
    throw new Error('Spoonacular API key not configured');
  }

  try {
    const params = new URLSearchParams({
      apiKey: SPOONACULAR_API_KEY,
      query,
      number: (options.number || 12).toString(),
      offset: (options.offset || 0).toString(),
      addRecipeInformation: 'true',
      fillIngredients: 'true',
      addRecipeInstructions: 'true'
    });

  if (options.cuisine) params.append('cuisine', options.cuisine);
  if (options.diet) params.append('diet', options.diet);
  if (options.type) params.append('type', options.type);
  if (options.maxReadyTime) params.append('maxReadyTime', options.maxReadyTime.toString());
  if (options.intolerances) params.append('intolerances', options.intolerances);

    const response = await fetch(`${BASE_URL}/complexSearch?${params}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Spoonacular API error: ${response.status} ${response.statusText}`);
    }

    const data: SpoonacularSearchResponse = await response.json();
    
    const recipes = data.results.map(convertSpoonacularRecipe);

    return {
      recipes,
      totalResults: data.totalResults
    };
  } catch (error) {
    console.error('Error searching Spoonacular recipes:', error);
    throw error;
  }
}

/**
 * Get recipe details from Spoonacular API
 */
export async function getSpoonacularRecipe(recipeId: string): Promise<Recipe | null> {
  if (!SPOONACULAR_API_KEY) {
    throw new Error('Spoonacular API key not configured');
  }

  // Extract numeric ID from our format
  const numericId = recipeId.replace('spoonacular-', '');

  try {
    const params = new URLSearchParams({
      apiKey: SPOONACULAR_API_KEY,
      includeNutrition: 'true'
    });

    const response = await fetch(`${BASE_URL}/${numericId}/information?${params}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Spoonacular API error: ${response.status} ${response.statusText}`);
    }

    const spoonacularRecipe: SpoonacularRecipe = await response.json();
    return convertSpoonacularRecipe(spoonacularRecipe);
  } catch (error) {
    console.error('Error fetching Spoonacular recipe:', error);
    return null;
  }
}

/**
 * Search recipes by ingredients from Spoonacular API
 */
export async function searchRecipesByIngredients(
  ingredients: string[],
  options: {
    number?: number;
    ranking?: number;
    ignorePantry?: boolean;
  } = {}
): Promise<Recipe[]> {
  if (!SPOONACULAR_API_KEY) {
    throw new Error('Spoonacular API key not configured');
  }

  try {
    const params = new URLSearchParams({
      apiKey: SPOONACULAR_API_KEY,
      ingredients: ingredients.join(','),
      number: (options.number || 12).toString(),
      ranking: (options.ranking || 1).toString(),
      ignorePantry: (options.ignorePantry || true).toString()
    });

    const response = await fetch(`${BASE_URL}/findByIngredients?${params}`);

    if (!response.ok) {
      throw new Error(`Spoonacular API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // For ingredient-based search, we need to fetch full recipe details
    const detailedRecipes = await Promise.all(
      data.slice(0, 6).map((recipe: { id: number }) => getSpoonacularRecipe(`spoonacular-${recipe.id}`))
    );

    return detailedRecipes.filter((recipe): recipe is Recipe => recipe !== null);
  } catch (error) {
    console.error('Error searching recipes by ingredients:', error);
    return [];
  }
}

/**
 * Get popular/random recipes from Spoonacular
 */
export async function getPopularSpoonacularRecipes(
  options: {
    number?: number;
    tags?: string[];
  } = {}
): Promise<Recipe[]> {
  if (!SPOONACULAR_API_KEY) {
    throw new Error('Spoonacular API key not configured');
  }

  try {
    const params = new URLSearchParams({
      apiKey: SPOONACULAR_API_KEY,
      number: (options.number || 10).toString()
    });

    if (options.tags && options.tags.length > 0) {
      params.append('tags', options.tags.join(','));
    }

    const response = await fetch(`${BASE_URL}/random?${params}`);

    if (!response.ok) {
      throw new Error(`Spoonacular API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.recipes.map(convertSpoonacularRecipe);
  } catch (error) {
    console.error('Error fetching popular Spoonacular recipes:', error);
    return [];
  }
}

/**
 * Rate limiting helper
 */
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000 / 150; // 150 requests per minute max

export function rateLimitedRequest<T>(requestFn: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    const delay = Math.max(0, MIN_REQUEST_INTERVAL - timeSinceLastRequest);

    setTimeout(async () => {
      try {
        lastRequestTime = Date.now();
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }, delay);
  });
}