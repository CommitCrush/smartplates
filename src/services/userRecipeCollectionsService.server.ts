/**
 * User Recipe Collections Service
 * 
 * Professional system for organizing user's personal recipe collections
 */

import clientPromise from '@/lib/db';
import { ObjectId } from 'mongodb';

export interface RecipeCollection {
  _id?: string;
  userId: string;
  name: string;
  description?: string;
  
  // Collection settings
  color?: string; // Hex color for visual organization
  icon?: string; // Icon identifier
  isPrivate: boolean;
  
  // Recipe management
  recipeIds: string[]; // Array of recipe IDs
  recipeCount: number; // Cached count for performance
  
  // Organization
  tags: string[];
  category?: 'favorites' | 'to-try' | 'family-recipes' | 'quick-meals' | 'custom';
  
  // Sharing
  shareId?: string; // For public sharing
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastAccessed?: Date;
}

export interface CollectionRecipe {
  _id?: string;
  userId: string;
  collectionId: string;
  recipeId: string;
  
  // User notes and customizations
  personalNotes?: string;
  personalRating?: number; // 1-5 stars
  customServings?: number;
  customTags?: string[];
  
  // Usage tracking
  timesCooked?: number;
  lastCooked?: Date;
  
  // Recipe snapshot (for performance)
  recipeName: string;
  recipeImage?: string;
  cookTime?: number;
  difficulty?: string;
  
  addedAt: Date;
  updatedAt: Date;
}

export interface CollectionWithRecipes extends RecipeCollection {
  recipes: CollectionRecipe[];
}

export class UserRecipeCollectionsService {
  private static COLLECTIONS_TABLE = 'userRecipeCollections';
  private static COLLECTION_RECIPES_TABLE = 'collectionRecipes';

  /**
   * Create a new recipe collection
   */
  static async createCollection(
    userId: string,
    collectionData: {
      name: string;
      description?: string;
      color?: string;
      icon?: string;
      isPrivate?: boolean;
      category?: RecipeCollection['category'];
      tags?: string[];
    }
  ): Promise<RecipeCollection> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<RecipeCollection>(this.COLLECTIONS_TABLE);

      // Check if collection name already exists for user
      const existingCollection = await collection.findOne({
        userId,
        name: collectionData.name.trim()
      });

      if (existingCollection) {
        throw new Error('A collection with this name already exists');
      }

      const newCollection: Omit<RecipeCollection, '_id'> = {
        userId,
        name: collectionData.name.trim(),
        description: collectionData.description?.trim(),
        color: collectionData.color || '#22c55e',
        icon: collectionData.icon || 'collection',
        isPrivate: collectionData.isPrivate ?? true,
        recipeIds: [],
        recipeCount: 0,
        tags: collectionData.tags || [],
        category: collectionData.category || 'custom',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await collection.insertOne(newCollection);

      return {
        ...newCollection,
        _id: result.insertedId.toString()
      };
    } catch (error) {
      console.error('Error creating collection:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create collection');
    }
  }

  /**
   * Get all collections for a user
   */
  static async getUserCollections(
    userId: string,
    options: {
      includeRecipeCount?: boolean;
      category?: RecipeCollection['category'];
      search?: string;
      sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'recipeCount';
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<RecipeCollection[]> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<RecipeCollection>(this.COLLECTIONS_TABLE);

      // Build query
      const query: any = { userId };

      if (options.category) {
        query.category = options.category;
      }

      if (options.search) {
        query.$or = [
          { name: { $regex: options.search, $options: 'i' } },
          { description: { $regex: options.search, $options: 'i' } },
          { tags: { $in: [new RegExp(options.search, 'i')] } }
        ];
      }

      // Build sort
      const sort: any = {};
      const sortBy = options.sortBy || 'updatedAt';
      const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
      sort[sortBy] = sortOrder;

      const collections = await collection.find(query).sort(sort).toArray();

      return collections.map((coll: any) => ({
        ...coll,
        _id: coll._id?.toString()
      }));
    } catch (error) {
      console.error('Error getting user collections:', error);
      return [];
    }
  }

  /**
   * Get a specific collection with recipes
   */
  static async getCollectionWithRecipes(
    collectionId: string,
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      sortBy?: 'addedAt' | 'recipeName' | 'personalRating' | 'timesCooked';
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<CollectionWithRecipes | null> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collectionsCol = db.collection<RecipeCollection>(this.COLLECTIONS_TABLE);
      const recipesCol = db.collection<CollectionRecipe>(this.COLLECTION_RECIPES_TABLE);

      // Get collection
      const collection = await collectionsCol.findOne({
        _id: new ObjectId(collectionId) as any,
        userId
      });

      if (!collection) return null;

      // Get recipes in collection
      const sort: any = {};
      const sortBy = options.sortBy || 'addedAt';
      const sortOrder = options.sortOrder === 'desc' ? -1 : 1;
      sort[sortBy] = sortOrder;

      let cursor = recipesCol
        .find({ collectionId })
        .sort(sort);

      if (options.offset) {
        cursor = cursor.skip(options.offset);
      }

      if (options.limit) {
        cursor = cursor.limit(options.limit);
      }

      const recipes = await cursor.toArray();

      // Update last accessed
      await collectionsCol.updateOne(
        { _id: new ObjectId(collectionId) as any as any },
        { $set: { lastAccessed: new Date() } }
      );

      return {
        ...collection,
        _id: collection._id?.toString(),
        recipes: recipes.map((recipe: any) => ({
          ...recipe,
          _id: recipe._id?.toString()
        }))
      };
    } catch (error) {
      console.error('Error getting collection with recipes:', error);
      return null;
    }
  }

  /**
   * Add a recipe to a collection
   */
  static async addRecipeToCollection(
    userId: string,
    collectionId: string,
    recipeData: {
      recipeId: string;
      recipeName: string;
      recipeImage?: string;
      cookTime?: number;
      difficulty?: string;
      personalNotes?: string;
      personalRating?: number;
      customTags?: string[];
    }
  ): Promise<boolean> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collectionsCol = db.collection<RecipeCollection>(this.COLLECTIONS_TABLE);
      const recipesCol = db.collection<CollectionRecipe>(this.COLLECTION_RECIPES_TABLE);

      // Verify collection ownership
      const collection = await collectionsCol.findOne({
        _id: new ObjectId(collectionId) as any,
        userId
      });

      if (!collection) {
        throw new Error('Collection not found');
      }

      // Check if recipe already exists in collection
      const existingRecipe = await recipesCol.findOne({
        collectionId,
        recipeId: recipeData.recipeId
      });

      if (existingRecipe) {
        throw new Error('Recipe already exists in this collection');
      }

      // Add recipe to collection
      const collectionRecipe: Omit<CollectionRecipe, '_id'> = {
        userId,
        collectionId,
        recipeId: recipeData.recipeId,
        recipeName: recipeData.recipeName,
        recipeImage: recipeData.recipeImage,
        cookTime: recipeData.cookTime,
        difficulty: recipeData.difficulty,
        personalNotes: recipeData.personalNotes,
        personalRating: recipeData.personalRating,
        customTags: recipeData.customTags || [],
        timesCooked: 0,
        addedAt: new Date(),
        updatedAt: new Date()
      };

      await recipesCol.insertOne(collectionRecipe);

      // Update collection recipe count and IDs
      await collectionsCol.updateOne(
        { _id: new ObjectId(collectionId) as any as any },
        {
          $push: { recipeIds: recipeData.recipeId },
          $inc: { recipeCount: 1 },
          $set: { updatedAt: new Date() }
        }
      );

      return true;
    } catch (error) {
      console.error('Error adding recipe to collection:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to add recipe to collection');
    }
  }

  /**
   * Remove a recipe from a collection
   */
  static async removeRecipeFromCollection(
    userId: string,
    collectionId: string,
    recipeId: string
  ): Promise<boolean> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collectionsCol = db.collection<RecipeCollection>(this.COLLECTIONS_TABLE);
      const recipesCol = db.collection<CollectionRecipe>(this.COLLECTION_RECIPES_TABLE);

      // Remove recipe from collection
      const result = await recipesCol.deleteOne({
        collectionId,
        recipeId,
        userId
      });

      if (result.deletedCount === 0) {
        return false;
      }

      // Update collection recipe count and IDs
      await collectionsCol.updateOne(
        { _id: new ObjectId(collectionId) as any as any, userId },
        {
          $pull: { recipeIds: recipeId },
          $inc: { recipeCount: -1 },
          $set: { updatedAt: new Date() }
        }
      );

      return true;
    } catch (error) {
      console.error('Error removing recipe from collection:', error);
      return false;
    }
  }

  /**
   * Update collection details
   */
  static async updateCollection(
    collectionId: string,
    userId: string,
    updates: Partial<Pick<RecipeCollection, 'name' | 'description' | 'color' | 'icon' | 'isPrivate' | 'category' | 'tags'>>
  ): Promise<boolean> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<RecipeCollection>(this.COLLECTIONS_TABLE);

      // If updating name, check for duplicates
      if (updates.name) {
        const existingCollection = await collection.findOne({
          userId,
          name: updates.name.trim(),
          _id: { $ne: new ObjectId(collectionId) as any }
        });

        if (existingCollection) {
          throw new Error('A collection with this name already exists');
        }
      }

      const result = await collection.updateOne(
        { 
          _id: new ObjectId(collectionId) as any,
          userId 
        },
        {
          $set: {
            ...updates,
            updatedAt: new Date()
          }
        }
      );

      return result.matchedCount > 0;
    } catch (error) {
      console.error('Error updating collection:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update collection');
    }
  }

  /**
   * Delete a collection and all its recipes
   */
  static async deleteCollection(collectionId: string, userId: string): Promise<boolean> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collectionsCol = db.collection<RecipeCollection>(this.COLLECTIONS_TABLE);
      const recipesCol = db.collection<CollectionRecipe>(this.COLLECTION_RECIPES_TABLE);

      // Delete all recipes in the collection
      await recipesCol.deleteMany({ collectionId });

      // Delete the collection
      const result = await collectionsCol.deleteOne({
        _id: new ObjectId(collectionId) as any,
        userId
      });

      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting collection:', error);
      return false;
    }
  }

  /**
   * Update recipe notes and rating in collection
   */
  static async updateCollectionRecipe(
    userId: string,
    collectionId: string,
    recipeId: string,
    updates: {
      personalNotes?: string;
      personalRating?: number;
      customTags?: string[];
      timesCooked?: number;
      lastCooked?: Date;
    }
  ): Promise<boolean> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const recipesCol = db.collection<CollectionRecipe>(this.COLLECTION_RECIPES_TABLE);

      const result = await recipesCol.updateOne(
        {
          collectionId,
          recipeId,
          userId
        },
        {
          $set: {
            ...updates,
            updatedAt: new Date()
          }
        }
      );

      return result.matchedCount > 0;
    } catch (error) {
      console.error('Error updating collection recipe:', error);
      return false;
    }
  }

  /**
   * Search recipes across all user collections
   */
  static async searchUserRecipes(
    userId: string,
    searchQuery: string,
    options: {
      collectionIds?: string[];
      tags?: string[];
      rating?: number;
      limit?: number;
    } = {}
  ): Promise<CollectionRecipe[]> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const recipesCol = db.collection<CollectionRecipe>(this.COLLECTION_RECIPES_TABLE);

      const query: any = { userId };

      // Text search
      if (searchQuery.trim()) {
        query.$or = [
          { recipeName: { $regex: searchQuery, $options: 'i' } },
          { personalNotes: { $regex: searchQuery, $options: 'i' } },
          { customTags: { $in: [new RegExp(searchQuery, 'i')] } }
        ];
      }

      // Filter by collections
      if (options.collectionIds && options.collectionIds.length > 0) {
        query.collectionId = { $in: options.collectionIds };
      }

      // Filter by tags
      if (options.tags && options.tags.length > 0) {
        query.customTags = { $in: options.tags };
      }

      // Filter by rating
      if (options.rating) {
        query.personalRating = { $gte: options.rating };
      }

      let cursor = recipesCol.find(query).sort({ updatedAt: -1 });

      if (options.limit) {
        cursor = cursor.limit(options.limit);
      }

      const recipes = await cursor.toArray();

      return recipes.map((recipe: any) => ({
        ...recipe,
        _id: recipe._id?.toString()
      }));
    } catch (error) {
      console.error('Error searching user recipes:', error);
      return [];
    }
  }

  /**
   * Get user's collection statistics
   */
  static async getUserCollectionStats(userId: string): Promise<{
    totalCollections: number;
    totalRecipes: number;
    averageRating: number;
    mostUsedCollection: string | null;
    recentActivity: {
      recentlyAdded: CollectionRecipe[];
      recentlyCooked: CollectionRecipe[];
    };
  }> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collectionsCol = db.collection<RecipeCollection>(this.COLLECTIONS_TABLE);
      const recipesCol = db.collection<CollectionRecipe>(this.COLLECTION_RECIPES_TABLE);

      const [collectionStats, recipeStats] = await Promise.all([
        collectionsCol.aggregate([
          { $match: { userId } },
          {
            $group: {
              _id: null,
              totalCollections: { $sum: 1 },
              totalRecipes: { $sum: '$recipeCount' },
              mostUsedCollection: {
                $max: {
                  k: '$recipeCount',
                  v: '$name'
                }
              }
            }
          }
        ]).toArray(),
        recipesCol.aggregate([
          { $match: { userId } },
          {
            $group: {
              _id: null,
              averageRating: { $avg: '$personalRating' },
              totalCookCount: { $sum: '$timesCooked' }
            }
          }
        ]).toArray()
      ]);

      // Get recent activity
      const [recentlyAdded, recentlyCooked] = await Promise.all([
        recipesCol.find({ userId })
          .sort({ addedAt: -1 })
          .limit(5)
          .toArray(),
        recipesCol.find({ 
          userId,
          lastCooked: { $exists: true }
        })
          .sort({ lastCooked: -1 })
          .limit(5)
          .toArray()
      ]);

      const collectionData = collectionStats[0] || {};
      const recipeData = recipeStats[0] || {};

      return {
        totalCollections: collectionData.totalCollections || 0,
        totalRecipes: collectionData.totalRecipes || 0,
        averageRating: recipeData.averageRating || 0,
        mostUsedCollection: collectionData.mostUsedCollection?.v || null,
        recentActivity: {
          recentlyAdded: recentlyAdded.map((recipe: any) => ({
            ...recipe,
            _id: recipe._id?.toString()
          })),
          recentlyCooked: recentlyCooked.map((recipe: any) => ({
            ...recipe,
            _id: recipe._id?.toString()
          }))
        }
      };
    } catch (error) {
      console.error('Error getting user collection stats:', error);
      return {
        totalCollections: 0,
        totalRecipes: 0,
        averageRating: 0,
        mostUsedCollection: null,
        recentActivity: {
          recentlyAdded: [],
          recentlyCooked: []
        }
      };
    }
  }
}