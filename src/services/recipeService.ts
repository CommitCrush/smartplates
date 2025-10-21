import type { Recipe } from '@/types/recipe';
import { getCollection, COLLECTIONS, toObjectId, isValidObjectId } from '@/lib/db';
import { ObjectId } from 'mongodb';
import logger from '@/utils/logger';

// ========================================
// CORE MONGODB SEARCH FUNCTION
// ========================================

// Search recipes with filters (real MongoDB implementation)
export async function searchRecipesMongo(filters: any = {}, pagination: any = {}, randomize = false): Promise<{ recipes: Recipe[]; total: number }> {
  try {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(500, Math.max(1, pagination.limit || 200)); // Erhöht auf 500 max
    const skip = (page - 1) * limit;

    // Define collections to search
    const collectionsToSearch = [
      { name: 'spoonacular_recipes', source: 'spoonacular' },
      { name: COLLECTIONS.RECIPES, source: 'chef' }, // Admin recipes
      { name: COLLECTIONS.USER_RECIPES, source: 'community' } // User recipes
    ];

    let allRecipes: Recipe[] = [];
    let totalCount = 0;

    // Search ALL collections and collect ALL results
    for (const { name, source } of collectionsToSearch) {
      try {
        const collection = await getCollection(name);
        
        // Build query filter - Fix MongoDB query logic
        const query: any = {};
        const andConditions: any[] = [];
        
        // Text search across multiple fields
        if (filters.query) {
          andConditions.push({
            $or: [
              { title: { $regex: filters.query, $options: 'i' } },
              { description: { $regex: filters.query, $options: 'i' } },
              { summary: { $regex: filters.query, $options: 'i' } }
            ]
          });
        }
        
        // Category/Type filtering with flexible field matching
        if (filters.type && filters.type.trim() !== '') {
          andConditions.push({
            $or: [
              { dishTypes: { $in: [filters.type] } },
              { category: filters.type },
              { mealType: filters.type }
            ]
          });
        }
        
        // Diet filtering with flexible field matching and diet mapping
        if (filters.diet && filters.diet.trim() !== '') {
          // Map frontend diet values to database diet values
          const dietMapping: Record<string, string[]> = {
            'vegetarian': ['lacto ovo vegetarian', 'vegetarian', 'ovo vegetarian', 'lacto vegetarian'],
            'vegan': ['vegan'],
            'gluten free': ['gluten free'],
            'ketogenic': ['ketogenic', 'keto'],
            'paleo': ['paleolithic', 'paleo'],
            'primal': ['primal'],
            'whole30': ['whole 30', 'whole30'],
            'pescatarian': ['pescatarian', 'pescetarian'],
            'dairy free': ['dairy free']
          };
          
          const dietVariants = dietMapping[filters.diet.toLowerCase()] || [filters.diet];
          
          andConditions.push({
            $or: [
              { diets: { $in: dietVariants } },
              { dietaryTags: { $in: dietVariants } }
            ]
          });
        }

        // Intolerances/Allergy filtering - exclude recipes that contain the allergen
        if (filters.intolerances && filters.intolerances.trim() !== '') {
          andConditions.push({
            $nor: [
              { 'extendedIngredients.name': { $regex: filters.intolerances, $options: 'i' } },
              { 'ingredients.name': { $regex: filters.intolerances, $options: 'i' } },
              { ingredients: { $regex: filters.intolerances, $options: 'i' } }
            ]
          });
        }

        // Max ready time filtering (difficulty: easy/medium)
        if (filters.maxReadyTime && typeof filters.maxReadyTime === 'number') {
          andConditions.push({
            readyInMinutes: { $lte: filters.maxReadyTime }
          });
        }

        // Enhanced ingredient search
        if (filters.ingredients && Array.isArray(filters.ingredients)) {
          const ingredientRegex = filters.ingredients.map((ing: string) => new RegExp(ing, 'i'));
          andConditions.push({
            $or: [
              { 'extendedIngredients.name': { $in: ingredientRegex } },
              { 'ingredients.name': { $in: ingredientRegex } },
              { ingredients: { $in: ingredientRegex } }
            ]
          });
        }

        // Apply AND conditions properly
        if (andConditions.length > 0) {
          query.$and = andConditions;
        }

        // Get total count for this collection
        const collectionTotal = await collection.countDocuments(query);
        totalCount += collectionTotal;

        // Get recipes from this collection (no individual limits - get all matching)
        let collectionRecipes: any[] = [];
        
        if (randomize) {
          // Use aggregation for random sampling - get more than needed for better mixing
          const sampleSize = Math.min(collectionTotal, 200); // Sample up to 200 from each collection
          collectionRecipes = await collection.aggregate([
            { $match: query },
            { $sample: { size: sampleSize } }
          ]).toArray();
        } else {
          // Get all matching recipes from this collection (sorted by creation date)
          collectionRecipes = await collection.find(query)
            .sort({ createdAt: -1 })
            .limit(200) // Limit per collection to prevent memory issues
            .toArray();
        }

        // Add source information to recipes
        collectionRecipes.forEach(recipe => {
          recipe.source = recipe.source || source;
        });
        
        allRecipes.push(...collectionRecipes);
        logger.info(`Collection ${name}: found ${collectionRecipes.length} recipes (${collectionTotal} total matching)`);
        
      } catch (collectionError) {
        logger.warn(`Error querying collection ${name}:`, collectionError);
        continue;
      }
    }

    // Remove duplicates and apply final randomization if requested
    const uniqueRecipes = Array.from(
      new Map(allRecipes.map(recipe => [
        recipe._id?.toString() || recipe.id || recipe.spoonacularId?.toString() || recipe.title,
        recipe
      ])).values()
    );

    // Apply randomization to the combined results if requested
    let finalRecipes = uniqueRecipes;
    if (randomize) {
      finalRecipes = [...uniqueRecipes].sort(() => Math.random() - 0.5);
    }

    // Apply pagination to the final combined results
    const paginatedRecipes = finalRecipes.slice(skip, skip + limit);

    logger.info(`Final results: ${paginatedRecipes.length} recipes (page ${page}) from ${totalCount} total across all collections`, { 
      filters,
      collectionsSearched: collectionsToSearch.map(c => c.name),
      totalUnique: uniqueRecipes.length 
    });
    
    return { 
      recipes: paginatedRecipes as Recipe[], 
      total: totalCount 
    };

  } catch (error) {
    logger.error('searchRecipesMongo error:', error);
    return { recipes: [], total: 0 };
  }
}

// ========================================
// RECIPE RETRIEVAL FUNCTIONS
// ========================================

// Get recipe by ID with flexible ID matching (real MongoDB implementation)
export async function getRecipeById(id: string): Promise<Recipe | null> {
  if (!id) {
    logger.warn('getRecipeById called with empty id');
    return null;
  }

  try {
    // Try multiple collections in priority order
    const collections = [
      'spoonacular_recipes',
      COLLECTIONS.RECIPES,
      COLLECTIONS.USER_RECIPES
    ];

    for (const collectionName of collections) {
      try {
        const collection = await getCollection(collectionName);
        
        // Build query that handles different ID formats
        const query: any = {};
        
        // Try ObjectId format first
        if (isValidObjectId(id)) {
          query._id = toObjectId(id);
        } else {
          // Try other ID fields including string _id for spoonacular recipes
          query.$or = [
            { _id: id }, // Direct string _id match (for spoonacular-XXXXX format)
            { id: id },
            { recipeId: id },
            { slug: id }
          ];
          
          // Handle spoonacular ID extraction (spoonacular-123456 -> 123456)
          if (id.startsWith('spoonacular-')) {
            const spoonacularNumericId = parseInt(id.replace('spoonacular-', ''));
            if (!isNaN(spoonacularNumericId)) {
              query.$or.push({ spoonacularId: spoonacularNumericId });
            }
          }
          
          // Also try as string representation of ObjectId for 24-char strings
          if (id.length === 24) {
            try {
              query.$or.push({ _id: new ObjectId(id) });
            } catch (e) {
              // Ignore invalid ObjectId
            }
          }
        }

        const recipe = await collection.findOne(query);
        if (recipe) {
          logger.info(`Found recipe in ${collectionName}:`, { id, title: recipe.title });
          return recipe as Recipe;
        }
      } catch (collectionError) {
        logger.warn(`Error querying collection ${collectionName}:`, collectionError);
        continue;
      }
    }

    logger.warn('Recipe not found in any collection:', { id });
    return null;

  } catch (error) {
    logger.error('getRecipeById error:', error);
    return null;
  }
}

// Alias for backward compatibility
export const findRecipeById = getRecipeById;

// ========================================
// API COMPATIBILITY WRAPPERS
// ========================================

// Search recipes with compatibility wrapper
export async function searchRecipes(query?: string, filters?: any, options: any = {}): Promise<{ recipes: Recipe[]; totalResults: number; fromCache: boolean }> {
  try {
    const searchFilters = {
      query,
      ...filters
    };
    
    const pagination = {
      page: options.page || 1,
      limit: options.limit || 20
    };

    const { recipes, total } = await searchRecipesMongo(searchFilters, pagination, options.randomize);
    
    return { 
      recipes, 
      totalResults: total, 
      fromCache: true 
    };
  } catch (error) {
    logger.error('searchRecipes error:', error);
    return { recipes: [], totalResults: 0, fromCache: false };
  }
}

// Search recipes by ingredients (real MongoDB implementation)
export async function searchRecipesByIngredients(ingredients: string[], options: any = {}): Promise<{ recipes: Recipe[]; totalResults: number; fromCache: boolean }> {
  try {
    const filters = {
      ingredients: ingredients
    };
    
    const pagination = {
      page: options.page || 1,
      limit: options.limit || 20
    };

    const { recipes, total } = await searchRecipesMongo(filters, pagination);
    
    return { 
      recipes, 
      totalResults: total, 
      fromCache: true 
    };
  } catch (error) {
    logger.error('searchRecipesByIngredients error:', error);
    return { recipes: [], totalResults: 0, fromCache: false };
  }
}

// Get popular recipes (real MongoDB implementation)
export async function getPopularRecipes(options: any = {}): Promise<{ recipes: Recipe[]; totalResults: number; fromCache: boolean }> {
  try {
    const pagination = {
      page: 1,
      limit: options.limit || 20
    };

    // Get random popular recipes
    const { recipes, total } = await searchRecipesMongo({}, pagination, true);
    
    return { 
      recipes, 
      totalResults: total, 
      fromCache: true 
    };
  } catch (error) {
    logger.error('getPopularRecipes error:', error);
    return { recipes: [], totalResults: 0, fromCache: false };
  }
}

// ========================================
// USER-SPECIFIC FUNCTIONS
// ========================================

// List recipes by user (real MongoDB implementation)
export async function listRecipesByUser(userId: string, options: any = {}): Promise<{ recipes: Recipe[]; total: number }> {
  if (!userId) {
    logger.warn('listRecipesByUser called with empty userId');
    return { recipes: [], total: 0 };
  }

  try {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const collection = await getCollection(COLLECTIONS.USER_RECIPES);
    
    // Build query to find recipes by user
    const query: any = {};
    
    // Try different user ID field formats
    if (isValidObjectId(userId)) {
      const objectId = toObjectId(userId);
      query.$or = [
        { userId: objectId },
        { createdBy: objectId },
        { author: objectId },
        { userId: userId },
        { createdBy: userId },
        { author: userId }
      ];
    } else {
      query.$or = [
        { userId: userId },
        { createdBy: userId },
        { author: userId }
      ];
    }

    const cursor = collection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const recipes = await cursor.toArray();
    const total = await collection.countDocuments(query);
    
    logger.info(`Found ${recipes.length} recipes for user ${userId}`);
    return { 
      recipes: recipes as Recipe[], 
      total 
    };

  } catch (error) {
    logger.error('listRecipesByUser error:', error);
    return { recipes: [], total: 0 };
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Get all recipes with pagination (real MongoDB implementation)
export async function getAllRecipes(limit = 50, skip = 0): Promise<Recipe[]> {
  try {
    const page = Math.floor(skip / limit) + 1;
    const result = await searchRecipesMongo({}, { page, limit });
    return result.recipes;
  } catch (error) {
    logger.error('getAllRecipes error:', error);
    return [];
  }
}

// Get total recipe count (real MongoDB implementation)
export async function getRecipeCount(): Promise<number> {
  try {
    const result = await searchRecipesMongo({}, { page: 1, limit: 1 });
    return result.total;
  } catch (error) {
    logger.error('getRecipeCount error:', error);
    return 0;
  }
}

// ========================================
// CRUD OPERATIONS (STUB IMPLEMENTATIONS)
// ========================================

export async function createUserRecipe(recipeData: Partial<Recipe>): Promise<Recipe | null> {
  logger.warn('createUserRecipe: Stub implementation - returning mock recipe');
  return {
    id: 'mock-id',
    title: recipeData.title || 'Mock Recipe',
    summary: recipeData.summary || 'Mock summary',
    image: recipeData.image || '/placeholder-recipe.jpg',
    readyInMinutes: recipeData.readyInMinutes || 30,
    servings: recipeData.servings || 4,
    instructions: recipeData.instructions || [],
    extendedIngredients: recipeData.extendedIngredients || [],
    nutrition: recipeData.nutrition || { nutrients: [] },
    dishTypes: recipeData.dishTypes || [],
    diets: recipeData.diets || [],
    occasions: recipeData.occasions || [],
    spoonacularScore: 0,
    healthScore: 0,
    pricePerServing: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } as Recipe;
}

export async function saveRecipe(recipeData: Partial<Recipe>): Promise<Recipe | null> {
  logger.warn('saveRecipe: Stub implementation - returning null');
  return null;
}

export async function saveRecipeToDb(recipeData: any): Promise<Recipe | null> {
  logger.warn('saveRecipeToDb: Stub implementation - returning null');
  return null;
}

export async function updateRecipe(id: string, updateData: Partial<Recipe>): Promise<Recipe | null> {
  logger.warn('updateRecipe: Stub implementation - returning null');
  return null;
}

export async function deleteRecipe(id: string): Promise<boolean> {
  logger.warn('deleteRecipe: Stub implementation - returning false');
  return false;
}

// ========================================
// DEFAULT EXPORT FOR BACKWARD COMPATIBILITY
// ========================================

export default {
  searchRecipes,
  getRecipeById,
  searchRecipesByIngredients,
  getPopularRecipes,
  saveRecipe,
  updateRecipe,
  deleteRecipe,
  getAllRecipes,
  getRecipeCount,
  searchRecipesMongo,
  createUserRecipe,
  findRecipeById,
  saveRecipeToDb,
  listRecipesByUser
};