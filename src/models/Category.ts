/**
 * Category Database Model for SmartPlates
 * 
 * This file contains all database operations for Category collection.
 * Clean, reusable functions for CRUD operations with proper error handling.
 */

import { ObjectId } from 'mongodb';
import { getCollection, COLLECTIONS, toObjectId } from '@/lib/db';
import { Category, CreateCategoryInput, UpdateCategoryInput, CategoryWithStats, CategoryOption } from '@/types/category';

/**
 * Creates a new category in the database
 * 
 * @param categoryData - Category data to create
 * @returns Promise<Category> - Created category with generated _id
 */
export async function createCategory(categoryData: CreateCategoryInput): Promise<Category> {
  try {
    const categoriesCollection = await getCollection<Category>(COLLECTIONS.CATEGORIES);
    
    // Get the next sort order if not provided
    let sortOrder = categoryData.sortOrder;
    if (sortOrder === undefined) {
      const lastCategory = await categoriesCollection
        .findOne({}, { sort: { sortOrder: -1 } });
      sortOrder = (lastCategory?.sortOrder || 0) + 1;
    }
    
    // Create category object with default values and timestamps
    const newCategory: Omit<Category, '_id'> = {
      name: categoryData.name,
      description: categoryData.description,
      icon: categoryData.icon,
      color: categoryData.color || '#22c55e',    // Default green color
      image: categoryData.image,
      isActive: categoryData.isActive !== false,  // Default to true
      sortOrder: sortOrder,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Insert category into database
    const result = await categoriesCollection.insertOne(newCategory);
    
    // Return the created category with the new _id
    return {
      _id: result.insertedId,
      ...newCategory,
    };
    
  } catch (error) {
    console.error('Error creating category:', error);
    throw new Error('Failed to create category');
  }
}

/**
 * Finds a category by its ID
 * 
 * @param categoryId - Category ID to search for
 * @returns Promise<Category | null> - Found category or null if not found
 */
export async function findCategoryById(categoryId: string | ObjectId): Promise<Category | null> {
  try {
    const categoriesCollection = await getCollection<Category>(COLLECTIONS.CATEGORIES);
    
    const category = await categoriesCollection.findOne({
      _id: toObjectId(categoryId)
    });
    
    return category;
    
  } catch (error) {
    console.error('Error finding category by ID:', error);
    throw new Error('Failed to find category');
  }
}

/**
 * Finds a category by its name
 * 
 * @param name - Category name to search for
 * @returns Promise<Category | null> - Found category or null if not found
 */
export async function findCategoryByName(name: string): Promise<Category | null> {
  try {
    const categoriesCollection = await getCollection<Category>(COLLECTIONS.CATEGORIES);
    
    const category = await categoriesCollection.findOne({
      name: { $regex: `^${name}$`, $options: 'i' }  // Case-insensitive exact match
    });
    
    return category;
    
  } catch (error) {
    console.error('Error finding category by name:', error);
    throw new Error('Failed to find category');
  }
}

/**
 * Updates a category's information
 * 
 * @param categoryId - Category ID to update
 * @param updateData - Data to update
 * @returns Promise<Category | null> - Updated category or null if not found
 */
export async function updateCategory(categoryId: string | ObjectId, updateData: UpdateCategoryInput): Promise<Category | null> {
  try {
    const categoriesCollection = await getCollection<Category>(COLLECTIONS.CATEGORIES);
    
    // Add updatedAt timestamp
    const updateWithTimestamp = {
      ...updateData,
      updatedAt: new Date(),
    };
    
    // Update category and return the updated document
    const result = await categoriesCollection.findOneAndUpdate(
      { _id: toObjectId(categoryId) },
      { $set: updateWithTimestamp },
      { returnDocument: 'after' }
    );
    
    return result || null;
    
  } catch (error) {
    console.error('Error updating category:', error);
    throw new Error('Failed to update category');
  }
}

/**
 * Deletes a category from the database
 * Note: This should check if any recipes use this category first
 * 
 * @param categoryId - Category ID to delete
 * @returns Promise<boolean> - True if category was deleted, false if not found
 */
export async function deleteCategory(categoryId: string | ObjectId): Promise<boolean> {
  try {
    // First check if any recipes use this category
    const recipesCollection = await getCollection(COLLECTIONS.RECIPES);
    const recipeCount = await recipesCollection.countDocuments({
      categoryId: toObjectId(categoryId)
    });
    
    if (recipeCount > 0) {
      throw new Error('Cannot delete category that has recipes. Move or delete recipes first.');
    }
    
    const categoriesCollection = await getCollection<Category>(COLLECTIONS.CATEGORIES);
    
    const result = await categoriesCollection.deleteOne({
      _id: toObjectId(categoryId)
    });
    
    return result.deletedCount > 0;
    
  } catch (error) {
    console.error('Error deleting category:', error);
    throw new Error('Failed to delete category');
  }
}

/**
 * Gets all active categories sorted by sortOrder
 * 
 * @param includeInactive - Whether to include inactive categories
 * @returns Promise<Category[]> - Array of categories
 */
export async function getAllCategories(includeInactive: boolean = false): Promise<Category[]> {
  try {
    const categoriesCollection = await getCollection<Category>(COLLECTIONS.CATEGORIES);
    
    const filter = includeInactive ? {} : { isActive: true };
    
    const categories = await categoriesCollection
      .find(filter)
      .sort({ sortOrder: 1 })    // Sort by sortOrder ascending
      .toArray();
    
    return categories;
    
  } catch (error) {
    console.error('Error getting all categories:', error);
    throw new Error('Failed to get categories');
  }
}

/**
 * Gets categories with recipe statistics
 * 
 * @param includeInactive - Whether to include inactive categories
 * @returns Promise<CategoryWithStats[]> - Array of categories with stats
 */
export async function getCategoriesWithStats(includeInactive: boolean = false): Promise<CategoryWithStats[]> {
  try {
    const categoriesCollection = await getCollection<Category>(COLLECTIONS.CATEGORIES);
    
    const matchStage = includeInactive ? {} : { isActive: true };
    
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: COLLECTIONS.RECIPES,
          let: { categoryId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$categoryId', '$$categoryId'] } } },
            { $match: { isPublic: true } }  // Only count public recipes
          ],
          as: 'recipes'
        }
      },
      {
        $addFields: {
          recipeCount: { $size: '$recipes' },
          recentRecipes: {
            $slice: [
              { $map: { input: '$recipes', as: 'recipe', in: '$$recipe.title' } },
              3  // Get 3 most recent recipe titles
            ]
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          icon: 1,
          color: 1,
          image: 1,
          isActive: 1,
          sortOrder: 1,
          createdAt: 1,
          updatedAt: 1,
          recipeCount: 1,
          recentRecipes: 1
        }
      },
      { $sort: { sortOrder: 1 } }
    ];
    
    const categoriesWithStats = await categoriesCollection
      .aggregate<CategoryWithStats>(pipeline)
      .toArray();
    
    return categoriesWithStats;
    
  } catch (error) {
    console.error('Error getting categories with stats:', error);
    throw new Error('Failed to get categories with stats');
  }
}

/**
 * Gets category options for dropdowns and forms
 * 
 * @returns Promise<CategoryOption[]> - Array of simplified category options
 */
export async function getCategoryOptions(): Promise<CategoryOption[]> {
  try {
    const categoriesCollection = await getCollection<Category>(COLLECTIONS.CATEGORIES);
    
    const categories = await categoriesCollection
      .find(
        { isActive: true },
        {
          projection: {
            _id: 1,
            name: 1,
            icon: 1
          }
        }
      )
      .sort({ sortOrder: 1 })
      .toArray();
    
    return categories as CategoryOption[];
    
  } catch (error) {
    console.error('Error getting category options:', error);
    throw new Error('Failed to get category options');
  }
}

/**
 * Reorders categories by updating their sortOrder
 * 
 * @param categoryIds - Array of category IDs in the new order
 * @returns Promise<boolean> - True if reordering was successful
 */
export async function reorderCategories(categoryIds: (string | ObjectId)[]): Promise<boolean> {
  try {
    const categoriesCollection = await getCollection<Category>(COLLECTIONS.CATEGORIES);
    
    // Update each category with its new sort order
    const updatePromises = categoryIds.map((categoryId, index) =>
      categoriesCollection.updateOne(
        { _id: toObjectId(categoryId) },
        { 
          $set: { 
            sortOrder: index + 1,
            updatedAt: new Date()
          }
        }
      )
    );
    
    await Promise.all(updatePromises);
    
    return true;
    
  } catch (error) {
    console.error('Error reordering categories:', error);
    throw new Error('Failed to reorder categories');
  }
}

/**
 * Gets category usage statistics
 * 
 * @param categoryId - Category ID to get stats for
 * @returns Promise<number> - Number of recipes in this category
 */
export async function getCategoryUsageCount(categoryId: string | ObjectId): Promise<number> {
  try {
    const recipesCollection = await getCollection(COLLECTIONS.RECIPES);
    
    const count = await recipesCollection.countDocuments({
      categoryId: toObjectId(categoryId),
      isPublic: true
    });
    
    return count;
    
  } catch (error) {
    console.error('Error getting category usage count:', error);
    throw new Error('Failed to get category usage count');
  }
}
