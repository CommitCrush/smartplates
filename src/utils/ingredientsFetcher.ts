/**
 * Ingredient Fetcher Utility
 * 
 * This utility fetches ingredients from multiple MongoDB collections
 * to populate grocery lists. It handles three recipe sources:
 * 1. spoonacular_recipes (Spoonacular API data)
 * 2. recipes (Admin uploaded recipes)
 * 3. userRecipes (User uploaded recipes)
 */

import { getCollection, toObjectId, isValidObjectId } from '@/lib/db';

/**
 * Interface for normalized ingredient data
 */
export interface NormalizedIngredient {
  name: string;
  amount?: string;
  unit?: string;
  category?: string;
  original?: string;
}

/**
 * Interface for recipe ingredient from different sources
 */
interface SpoonacularIngredient {
  id?: number;
  name?: string;
  nameClean?: string;
  original?: string;
  amount?: number;
  unit?: string;
  aisle?: string;
  measures?: {
    metric?: { amount?: number; unitShort?: string };
    us?: { amount?: number; unitShort?: string };
  };
}

interface UserRecipeIngredient {
  name: string;
  amount?: string;
  unit?: string;
  category?: string;
}

/**
 * Fetches ingredients for a recipe from multiple collections
 * @param recipeId - The recipe ID (can be spoonacular-123, mongo ObjectId, etc.)
 * @returns Promise<NormalizedIngredient[]> - Array of normalized ingredients
 */
export async function fetchRecipeIngredients(recipeId: string): Promise<NormalizedIngredient[]> {
  if (!recipeId) {
    console.log('🔍 No recipeId provided for ingredient fetching');
    return [];
  }

  console.log(`🔍 Fetching ingredients for recipe: ${recipeId}`);

  try {
    // 1. Try spoonacular_recipes collection first (most common)
    if (recipeId.startsWith('spoonacular-') || !isNaN(Number(recipeId))) {
      const spoonacularIngredients = await fetchFromSpoonacularRecipes(recipeId);
      if (spoonacularIngredients.length > 0) {
        console.log(`✅ Found ${spoonacularIngredients.length} ingredients in spoonacular_recipes`);
        return spoonacularIngredients;
      }
    }

    // 2. Try recipes collection (admin uploaded)
    const adminRecipeIngredients = await fetchFromRecipesCollection(recipeId);
    if (adminRecipeIngredients.length > 0) {
      console.log(`✅ Found ${adminRecipeIngredients.length} ingredients in recipes collection`);
      return adminRecipeIngredients;
    }

    // 3. Try userRecipes collection (user uploaded)
    const userRecipeIngredients = await fetchFromUserRecipesCollection(recipeId);
    if (userRecipeIngredients.length > 0) {
      console.log(`✅ Found ${userRecipeIngredients.length} ingredients in userRecipes collection`);
      return userRecipeIngredients;
    }

    console.log(`⚠️ No ingredients found for recipe: ${recipeId}`);
    return [];

  } catch (error) {
    console.error(`❌ Error fetching ingredients for recipe ${recipeId}:`, error);
    return [];
  }
}

/**
 * Fetch ingredients from spoonacular_recipes collection
 */
async function fetchFromSpoonacularRecipes(recipeId: string): Promise<NormalizedIngredient[]> {
  try {
    const collection = await getCollection('spoonacular_recipes');
    
    // Try different ID formats for Spoonacular recipes
    let query: any;
    if (recipeId.startsWith('spoonacular-')) {
      query = { _id: recipeId };
    } else {
      const numericId = parseInt(recipeId);
      query = { $or: [
        { _id: `spoonacular-${recipeId}` },
        { id: numericId },
        { spoonacularId: numericId }
      ]};
    }

    const recipe = await collection.findOne(query);
    
    if (!recipe || !recipe.extendedIngredients) {
      return [];
    }

    console.log(`🥕 Found spoonacular recipe with ${recipe.extendedIngredients.length} ingredients`);

    return recipe.extendedIngredients.map((ing: SpoonacularIngredient) => ({
      name: ing.name || ing.nameClean || ing.original || 'Unknown ingredient',
      amount: ing.amount?.toString() || ing.measures?.metric?.amount?.toString() || '',
      unit: ing.unit || ing.measures?.metric?.unitShort || '',
      category: ing.aisle || 'General',
      original: ing.original || ing.name
    }));

  } catch (error) {
    console.error('❌ Error fetching from spoonacular_recipes:', error);
    return [];
  }
}

/**
 * Fetch ingredients from recipes collection (admin uploaded)
 */
async function fetchFromRecipesCollection(recipeId: string): Promise<NormalizedIngredient[]> {
  try {
    const collection = await getCollection('recipes');
    
    // Try both string and ObjectId formats
    let query: any;
    if (isValidObjectId(recipeId)) {
      query = { $or: [
        { _id: toObjectId(recipeId) },
        { id: recipeId }
      ]};
    } else {
      query = { id: recipeId };
    }

    const recipe = await collection.findOne(query);
    
    if (!recipe || !recipe.ingredients) {
      return [];
    }

    console.log(`🍳 Found admin recipe with ${recipe.ingredients.length} ingredients`);

    // Handle different ingredient formats
    return recipe.ingredients.map((ing: any) => {
      if (typeof ing === 'string') {
        return {
          name: ing,
          amount: '',
          unit: '',
          category: 'General',
          original: ing
        };
      }
      
      return {
        name: ing.name || ing.ingredient || 'Unknown ingredient',
        amount: ing.amount || ing.quantity || '',
        unit: ing.unit || ing.measurement || '',
        category: ing.category || 'General',
        original: ing.original || ing.name || ing.ingredient
      };
    });

  } catch (error) {
    console.error('❌ Error fetching from recipes collection:', error);
    return [];
  }
}

/**
 * Fetch ingredients from userRecipes collection (user uploaded)
 */
async function fetchFromUserRecipesCollection(recipeId: string): Promise<NormalizedIngredient[]> {
  try {
    const collection = await getCollection('userRecipes');
    
    // Try both string and ObjectId formats
    let query: any;
    if (isValidObjectId(recipeId)) {
      query = { $or: [
        { _id: toObjectId(recipeId) },
        { id: recipeId }
      ]};
    } else {
      query = { id: recipeId };
    }

    const recipe = await collection.findOne(query);
    
    if (!recipe || !recipe.ingredients) {
      return [];
    }

    console.log(`👤 Found user recipe with ${recipe.ingredients.length} ingredients`);

    // Handle different ingredient formats
    return recipe.ingredients.map((ing: any) => {
      if (typeof ing === 'string') {
        return {
          name: ing,
          amount: '',
          unit: '',
          category: 'General',
          original: ing
        };
      }
      
      return {
        name: ing.name || ing.ingredient || 'Unknown ingredient',
        amount: ing.amount || ing.quantity || '',
        unit: ing.unit || ing.measurement || '',
        category: ing.category || 'General',
        original: ing.original || ing.name || ing.ingredient
      };
    });

  } catch (error) {
    console.error('❌ Error fetching from userRecipes collection:', error);
    return [];
  }
}

/**
 * Batch fetch ingredients for multiple recipes
 * @param recipeIds - Array of recipe IDs
 * @returns Promise<Map<string, NormalizedIngredient[]>> - Map of recipeId to ingredients
 */
export async function batchFetchRecipeIngredients(recipeIds: string[]): Promise<Map<string, NormalizedIngredient[]>> {
  const ingredientsMap = new Map<string, NormalizedIngredient[]>();
  
  console.log(`🔍 Batch fetching ingredients for ${recipeIds.length} recipes`);
  
  // Process recipes in parallel for better performance
  const promises = recipeIds.map(async (recipeId) => {
    const ingredients = await fetchRecipeIngredients(recipeId);
    ingredientsMap.set(recipeId, ingredients);
  });
  
  await Promise.all(promises);
  
  console.log(`✅ Batch fetch completed: ${ingredientsMap.size} recipes processed`);
  return ingredientsMap;
}

/**
 * Helper function to identify recipe source from ID
 */
export function getRecipeSource(recipeId: string): 'spoonacular' | 'admin' | 'user' | 'unknown' {
  if (recipeId.startsWith('spoonacular-') || !isNaN(Number(recipeId))) {
    return 'spoonacular';
  }
  
  // This is a basic heuristic - you might want to implement more sophisticated logic
  // based on your ID patterns
  if (recipeId.length === 24 && /^[a-fA-F0-9]+$/.test(recipeId)) {
    return 'admin'; // Likely MongoDB ObjectId
  }
  
  return 'unknown';
}