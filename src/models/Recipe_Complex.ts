/**
 * Recipe Database Model for SmartPlates
 * 
 * This file contains all database operations for Recipe collection.
 * Clean, reusable functions for CRUD operations with proper error handling.
 */

import { ObjectId } from 'mongodb';
import { getCollection, COLLECTIONS, toObjectId } from '@/lib/db';
import type { Recipe, CreateRecipeInput, UpdateRecipeInput, RecipeFilter, RecipeCard } from '@/types/recipe.d.tsx';

/**
 * Creates a new recipe in the database
 * 
 * @param recipeData - Recipe data to create
 * @returns Promise<Recipe> - Created recipe with generated _id
 */
export async function createRecipe(recipeData: CreateRecipeInput): Promise<Recipe> {
  try {
    const recipesCollection = await getCollection<Recipe>(COLLECTIONS.RECIPES);
    
    // Calculate total time (Spoonacular: readyInMinutes)
    const readyInMinutes = (recipeData.prepTime ?? 0) + (recipeData.cookTime ?? 0);

    // Use Spoonacular-compliant fields
    const newRecipe: Omit<Recipe, '_id'> = {
      title: recipeData.title,
      description: recipeData.description,
      summary: recipeData.description, // Use description as summary if not provided
      image: recipeData.image,
      readyInMinutes,
      servings: recipeData.servings,
      extendedIngredients: recipeData.extendedIngredients,
      analyzedInstructions: recipeData.analyzedInstructions,
      cuisines: [],
      dishTypes: [],
      diets: [],
      nutrition: recipeData.nutrition,
      rating: 0,
      ratingsCount: 0,
      likesCount: 0,
      authorId: recipeData.authorId?.toString(),
      authorName: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublished: recipeData.isPublic !== false,
      isPending: false,
      moderationNotes: '',
    };
    
    // Insert recipe into database
    const result = await recipesCollection.insertOne(newRecipe);
    
    // Update user's createdRecipes array
    const usersCollection = await getCollection(COLLECTIONS.USERS);
    await usersCollection.updateOne(
      { _id: toObjectId(recipeData.authorId) },
      { 
        $addToSet: { createdRecipes: result.insertedId },
        $set: { updatedAt: new Date() }
      }
    );
    
    // Return the created recipe with the new _id
    return {
      _id: result.insertedId,
      ...newRecipe,
    };
    
  } catch (error) {
    console.error('Error creating recipe:', error);
    throw new Error('Failed to create recipe');
  }
}

/**
 * Finds a recipe by its ID
 * 
 * @param recipeId - Recipe ID to search for
 * @returns Promise<Recipe | null> - Found recipe or null if not found
 */
export async function findRecipeById(recipeId: string | ObjectId): Promise<Recipe | null> {
  try {
    const recipesCollection = await getCollection<Recipe>(COLLECTIONS.RECIPES);
    // Only convert to ObjectId if recipeId is a valid string and not already an ObjectId
    // Always use ObjectId for _id filter
    let id: ObjectId;
    if (typeof recipeId === 'string') {
      if (!ObjectId.isValid(recipeId)) return null;
      id = new ObjectId(recipeId);
    } else {
      id = recipeId;
    }
    // Cast _id filter to any to resolve MongoDB/TS type mismatch
    const recipe = await recipesCollection.findOne({ _id: id });
    return recipe;
    
  } catch (error) {
    console.error('Error finding recipe by ID:', error);
    throw new Error('Failed to find recipe');
  }
}

/**
 * Updates a recipe's information
 * 
 * @param recipeId - Recipe ID to update
 * @param updateData - Data to update
 * @returns Promise<Recipe | null> - Updated recipe or null if not found
 */
export async function updateRecipe(recipeId: string | ObjectId, updateData: UpdateRecipeInput): Promise<Recipe | null> {
  try {
    const recipesCollection = await getCollection<Recipe>(COLLECTIONS.RECIPES);
    
    // Calculate readyInMinutes if prep or cook time changed
    const updateWithCalculations: UpdateRecipeInput & { readyInMinutes?: number } = { ...updateData };
    if (updateData.prepTime !== undefined || updateData.cookTime !== undefined) {
      const currentRecipe = await findRecipeById(recipeId);
      if (currentRecipe) {
        const prepTime = updateData.prepTime ?? 0;
        const cookTime = updateData.cookTime ?? 0;
        updateWithCalculations.readyInMinutes = prepTime + cookTime;
      }
    }

    // Add updatedAt timestamp
    const updateWithTimestamp = {
      ...updateWithCalculations,
      updatedAt: new Date().toISOString(),
    };

    // Update recipe and return the updated document
    let id: ObjectId;
    if (typeof recipeId === 'string') {
      if (!ObjectId.isValid(recipeId)) return null;
      id = new ObjectId(recipeId);
    } else {
      id = recipeId;
    }
    const result = await recipesCollection.findOneAndUpdate(
      { _id: id },
      { $set: updateWithTimestamp },
      { returnDocument: 'after' }
    );
    return result || null;
    
  } catch (error) {
    console.error('Error updating recipe:', error);
    throw new Error('Failed to update recipe');
  }
}

/**
 * Deletes a recipe from the database
 * 
 * @param recipeId - Recipe ID to delete
 * @returns Promise<boolean> - True if recipe was deleted, false if not found
 */
export async function deleteRecipe(recipeId: string | ObjectId): Promise<boolean> {
  try {
    const recipesCollection = await getCollection<Recipe>(COLLECTIONS.RECIPES);
    // Get recipe first to know the author
    const recipe = await findRecipeById(recipeId);
    if (!recipe) {
      return false;
    }
    // Only convert to ObjectId if recipeId is a valid string and not already an ObjectId
    let id: ObjectId;
    if (typeof recipeId === 'string') {
      if (!ObjectId.isValid(recipeId)) return false;
      id = new ObjectId(recipeId);
    } else {
      id = recipeId;
    }
    // Delete the recipe
    const result = await recipesCollection.deleteOne({ _id: id } as Record<string, unknown>);
    // Remove from author's createdRecipes array
    if (result.deletedCount > 0 && recipe.authorId && ObjectId.isValid(recipe.authorId)) {
      const usersCollection = await getCollection(COLLECTIONS.USERS);
      const authorIdObj = new ObjectId(recipe.authorId);
      await usersCollection.updateOne(
        { _id: authorIdObj },
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          $pull: { createdRecipes: id } as any,
          $set: { updatedAt: new Date() }
        }
      );
    }
    return result.deletedCount > 0;
    
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw new Error('Failed to delete recipe');
  }
}

/**
 * Gets recipes with filtering and pagination
 * 
 * @param filter - Filter criteria
 * @param limit - Maximum number of recipes to return
 * @param skip - Number of recipes to skip (for pagination)
 * @returns Promise<Recipe[]> - Array of recipes
 */
export async function getRecipes(filter: RecipeFilter = {}, limit: number = 20, skip: number = 0): Promise<Recipe[]> {
  try {
    const recipesCollection = await getCollection<Recipe>(COLLECTIONS.RECIPES);
    
    // Build MongoDB filter object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mongoFilter: any = {};
    
    if (filter.categoryId) {
      mongoFilter.categoryId = toObjectId(filter.categoryId);
    }
    
    if (filter.difficulty) {
      mongoFilter.difficulty = filter.difficulty;
    }
    
    if (filter.mealType) {
      mongoFilter.mealType = filter.mealType;
    }
    
    if (filter.maxPrepTime) {
      mongoFilter.prepTime = { $lte: filter.maxPrepTime };
    }
    
    if (filter.maxCookTime) {
      mongoFilter.cookTime = { $lte: filter.maxCookTime };
    }
    
    if (filter.tags && filter.tags.length > 0) {
      mongoFilter.tags = { $in: filter.tags };
    }
    
    if (filter.authorId) {
      mongoFilter.authorId = toObjectId(filter.authorId);
    }
    
    if (filter.isPublic !== undefined) {
      mongoFilter.isPublic = filter.isPublic;
    }
    
    if (filter.searchTerm) {
      mongoFilter.$or = [
        { title: { $regex: filter.searchTerm, $options: 'i' } },
        { description: { $regex: filter.searchTerm, $options: 'i' } },
        { tags: { $regex: filter.searchTerm, $options: 'i' } },
      ];
    }
    
    const recipes = await recipesCollection
      .find(mongoFilter)
      .sort({ createdAt: -1 })    // Most recent first
      .limit(limit)
      .skip(skip)
      .toArray();
    
    return recipes;
    
  } catch (error) {
    console.error('Error getting recipes:', error);
    throw new Error('Failed to get recipes');
  }
}

/**
 * Gets recipe cards (lightweight data for listings)
 * 
 * @param filter - Filter criteria
 * @param limit - Maximum number of recipes to return
 * @param skip - Number of recipes to skip
 * @returns Promise<RecipeCard[]> - Array of recipe cards
 */
export async function getRecipeCards(filter: RecipeFilter = {}, limit: number = 20, skip: number = 0): Promise<RecipeCard[]> {
  try {
    const recipesCollection = await getCollection<Recipe>(COLLECTIONS.RECIPES);
    
    // Build the same filter as getRecipes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mongoFilter: any = {};
    
    if (filter.categoryId) mongoFilter.categoryId = toObjectId(filter.categoryId);
    if (filter.difficulty) mongoFilter.difficulty = filter.difficulty;
    if (filter.mealType) mongoFilter.mealType = filter.mealType;
    if (filter.maxPrepTime) mongoFilter.prepTime = { $lte: filter.maxPrepTime };
    if (filter.maxCookTime) mongoFilter.cookTime = { $lte: filter.maxCookTime };
    if (filter.tags && filter.tags.length > 0) mongoFilter.tags = { $in: filter.tags };
    if (filter.authorId) mongoFilter.authorId = toObjectId(filter.authorId);
    if (filter.isPublic !== undefined) mongoFilter.isPublic = filter.isPublic;
    
    if (filter.searchTerm) {
      mongoFilter.$or = [
        { title: { $regex: filter.searchTerm, $options: 'i' } },
        { description: { $regex: filter.searchTerm, $options: 'i' } },
        { tags: { $regex: filter.searchTerm, $options: 'i' } },
      ];
    }
    
    // Aggregate to join with user data for author name
    const pipeline = [
      { $match: mongoFilter },
      {
        $lookup: {
          from: COLLECTIONS.USERS,
          localField: 'authorId',
          foreignField: '_id',
          as: 'author'
        }
      },
      { $unwind: '$author' },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          image: 1,
          difficulty: 1,
          totalTime: 1,
          servings: 1,
          rating: 1,
          tags: 1,
          authorName: '$author.name'
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ];
    
    const recipeCards = await recipesCollection.aggregate<RecipeCard>(pipeline).toArray();
    
    return recipeCards;
    
  } catch (error) {
    console.error('Error getting recipe cards:', error);
    throw new Error('Failed to get recipe cards');
  }
}

/**
 * Gets recipes by category
 * 
 * @param categoryId - Category ID to filter by
 * @param limit - Maximum number of recipes to return
 * @returns Promise<Recipe[]> - Array of recipes in the category
 */
export async function getRecipesByCategory(categoryId: string | ObjectId, limit: number = 20): Promise<Recipe[]> {
  return getRecipes({ categoryId }, limit);
}
/**
 * Gets recipes by user (author)
 * 
 * @param userId - User ID to filter by
 * @param limit - Maximum number of recipes to return
 * @returns Promise<Recipe[]> - Array of user's recipes
 */
export async function getRecipesByUser(userId: string | ObjectId, limit: number = 20): Promise<Recipe[]> {
  return getRecipes({ authorId: userId }, limit);
}

/**
 * Searches recipes by text
 * 
 * @param searchTerm - Text to search for
 * @param limit - Maximum number of recipes to return
 * @returns Promise<Recipe[]> - Array of matching recipes
 */
export async function searchRecipes(searchTerm: string, limit: number = 20): Promise<Recipe[]> {
  return getRecipes({ searchTerm }, limit);
}

