/**
 * Grocery List Service for SmartPlates
 * 
 * Comprehensive service for generating, managing, and exporting grocery lists
 * from meal plans with proper ingredient aggregation and categorization.
 */

import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { Recipe } from '@/types/recipe';
import { MealPlan, GroceryList, GroceryItem, GroceryListOptions, GroceryListExportOptions } from '@/types/mealplan';
import { parseIngredient, ParsedIngredient } from '@/utils/validators';
import { 
  findIngredient, 
  normalizeIngredientName, 
  getIngredientCategory, 
  isStapleIngredient,
  estimateIngredientCost,
  GROCERY_CATEGORIES 
} from '@/lib/ingredients';

/**
 * Generates a comprehensive grocery list from a meal plan
 * @param mealPlan - The meal plan to generate grocery list from
 * @param options - Options for grocery list generation
 * @returns Generated grocery list
 */
export async function generateGroceryListFromMealPlan(
  mealPlan: MealPlan, 
  options: GroceryListOptions = {}
): Promise<GroceryList> {
  const db = await connectToDatabase();
  
  // Extract all recipe IDs from the meal plan
  const recipeIds: Set<string> = new Set();
  const recipeServings: Map<string, number> = new Map();
  
  mealPlan.days.forEach(day => {
    Object.values(day.meals).forEach(meal => {
      if (meal) {
        const recipeId = meal.recipeId.toString();
        recipeIds.add(recipeId);
        
        // Accumulate servings for recipes used multiple times
        const currentServings = recipeServings.get(recipeId) || 0;
        recipeServings.set(recipeId, currentServings + meal.servings);
      }
    });
  });

  // Fetch all recipes
  const recipes: Recipe[] = await db
    .collection('recipes')
    .find({ _id: { $in: Array.from(recipeIds).map(id => new ObjectId(id)) } })
    .toArray();

  // Aggregate ingredients with improved logic
  const ingredientMap: Map<string, {
    totalQuantity: number;
    unit: string;
    recipes: string[];
    category: string;
    estimatedCost: number;
  }> = new Map();

  recipes.forEach(recipe => {
    const servingsMultiplier = recipeServings.get(recipe._id?.toString() || '') || 1;
    const baseServings = recipe.servings || 1;
    const scalingFactor = servingsMultiplier / baseServings;

    recipe.ingredients.forEach(ingredient => {
      // Handle both string and RecipeIngredient format
      let parsed: ParsedIngredient;
      
      if (typeof ingredient === 'string') {
        parsed = parseIngredient(ingredient);
      } else {
        parsed = {
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit
        };
      }

      // Normalize ingredient name and get category
      const normalizedName = normalizeIngredientName(parsed.name);
      const category = getIngredientCategory(normalizedName);
      const isStaple = isStapleIngredient(normalizedName);

      // Skip staples if option is enabled
      if (options.excludeStaples && isStaple) {
        return;
      }

      // Create unique key for ingredient+unit combination
      const key = `${normalizedName}|${parsed.unit.toLowerCase()}`;
      
      const scaledQuantity = parsed.quantity * scalingFactor;
      const estimatedCost = options.includeEstimates 
        ? estimateIngredientCost(normalizedName, scaledQuantity, parsed.unit)
        : 0;

      if (ingredientMap.has(key)) {
        const existing = ingredientMap.get(key)!;
        existing.totalQuantity += scaledQuantity;
        existing.estimatedCost += estimatedCost;
        existing.recipes.push(recipe.title);
      } else {
        ingredientMap.set(key, {
          totalQuantity: scaledQuantity,
          unit: parsed.unit,
          recipes: [recipe.title],
          category,
          estimatedCost
        });
      }
    });
  });

  // Convert map to GroceryItem array
  const items: GroceryItem[] = Array.from(ingredientMap.entries()).map(([key, data]) => {
    const [name] = key.split('|');
    const ingredient = findIngredient(name);
    
    return {
      name,
      displayName: ingredient?.name || name,
      quantity: Math.round(data.totalQuantity * 100) / 100, // Round to 2 decimal places
      unit: data.unit,
      category: data.category,
      estimatedCost: options.includeEstimates ? data.estimatedCost : undefined,
      isPurchased: false,
      recipes: [...new Set(data.recipes)], // Remove duplicates
    };
  });

  // Sort items by category and name
  items.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });

  // Group by category if requested
  const categories: { [category: string]: GroceryItem[] } = {};
  if (options.categorizeItems) {
    items.forEach(item => {
      const category = item.category || GROCERY_CATEGORIES.PANTRY;
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(item);
    });
  }

  // Create the grocery list
  const groceryList: GroceryList = {
    mealPlanId: mealPlan._id!,
    userId: mealPlan.userId,
    name: `Grocery List for ${mealPlan.name}`,
    items,
    categories,
    totalEstimatedCost: options.includeEstimates 
      ? items.reduce((sum, item) => sum + (item.estimatedCost || 0), 0)
      : undefined,
    itemsCount: items.length,
    purchasedCount: 0,
    isCompleted: false,
    generatedAt: new Date(),
    lastUpdated: new Date()
  };

  return groceryList;
}

/**
 * Saves a grocery list to the database
 * @param groceryList - The grocery list to save
 * @returns Saved grocery list with database ID
 */
export async function saveGroceryList(groceryList: GroceryList): Promise<GroceryList> {
  const db = await connectToDatabase();
  
  const result = await db.collection('groceryLists').insertOne(groceryList);
  
  return {
    ...groceryList,
    _id: result.insertedId
  };
}

/**
 * Updates a grocery list in the database
 * @param groceryListId - ID of the grocery list to update
 * @param updates - Updates to apply
 * @returns Updated grocery list or null if not found
 */
export async function updateGroceryList(
  groceryListId: string, 
  updates: Partial<GroceryList>
): Promise<GroceryList | null> {
  const db = await connectToDatabase();
  
  const result = await db.collection('groceryLists').findOneAndUpdate(
    { _id: new ObjectId(groceryListId) },
    { 
      $set: { 
        ...updates, 
        lastUpdated: new Date() 
      } 
    },
    { returnDocument: 'after' }
  );
  
  return result;
}

/**
 * Marks a grocery item as purchased/unpurchased
 * @param groceryListId - ID of the grocery list
 * @param itemName - Name of the item to update
 * @param isPurchased - New purchase status
 * @returns Updated grocery list or null if not found
 */
export async function updateGroceryItemStatus(
  groceryListId: string,
  itemName: string,
  isPurchased: boolean
): Promise<GroceryList | null> {
  const db = await connectToDatabase();
  
  const result = await db.collection('groceryLists').findOneAndUpdate(
    { 
      _id: new ObjectId(groceryListId),
      'items.name': itemName
    },
    { 
      $set: { 
        'items.$.isPurchased': isPurchased,
        lastUpdated: new Date()
      } 
    },
    { returnDocument: 'after' }
  );

  if (result) {
    // Update the purchased count and completion status
    const purchasedCount = result.items.filter((item: GroceryItem) => item.isPurchased).length;
    const isCompleted = purchasedCount === result.items.length;

    await db.collection('groceryLists').updateOne(
      { _id: new ObjectId(groceryListId) },
      { 
        $set: { 
          purchasedCount,
          isCompleted,
          lastUpdated: new Date()
        } 
      }
    );

    return {
      ...result,
      purchasedCount,
      isCompleted
    };
  }
  
  return null;
}

/**
 * Gets a grocery list by ID
 * @param groceryListId - ID of the grocery list
 * @returns Grocery list or null if not found
 */
export async function getGroceryListById(groceryListId: string): Promise<GroceryList | null> {
  const db = await connectToDatabase();
  
  const groceryList = await db.collection('groceryLists').findOne({
    _id: new ObjectId(groceryListId)
  });
  
  return groceryList;
}

/**
 * Gets all grocery lists for a user
 * @param userId - User ID
 * @param page - Page number (1-based)
 * @param limit - Number of results per page
 * @returns Array of grocery lists
 */
export async function getGroceryListsByUser(
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<GroceryList[]> {
  const db = await connectToDatabase();
  
  const groceryLists = await db.collection('groceryLists')
    .find({ userId: new ObjectId(userId) })
    .sort({ generatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();
  
  return groceryLists;
}

/**
 * Deletes a grocery list
 * @param groceryListId - ID of the grocery list to delete
 * @param userId - User ID (for authorization)
 * @returns True if deleted, false if not found or unauthorized
 */
export async function deleteGroceryList(groceryListId: string, userId: string): Promise<boolean> {
  const db = await connectToDatabase();
  
  const result = await db.collection('groceryLists').deleteOne({
    _id: new ObjectId(groceryListId),
    userId: new ObjectId(userId)
  });
  
  return result.deletedCount > 0;
}

// Legacy function to maintain backward compatibility with existing API
export async function generateGroceryList(mealPlan: any) {
  // Convert legacy format to new format if needed
  const options: GroceryListOptions = {
    categorizeItems: true,
    includeEstimates: false,
    mergeSimilarItems: true,
    excludeStaples: false
  };
  
  const groceryList = await generateGroceryListFromMealPlan(mealPlan, options);
  
  // Return in legacy format for backward compatibility
  return groceryList.items.map(item => ({
    name: item.displayName,
    quantity: item.quantity,
    unit: item.unit
  }));
}