/**
 * Saved Meal Plans Service
 * 
 * Professional server-side service for saved meal plans with MongoDB integration
 */

import clientPromise from '@/lib/db';
import { ObjectId } from 'mongodb';
import type { IMealPlan } from '@/types/meal-planning';
import type { 
  MealPlanTemplate, 
  TemplateCategoryType, 
  TemplateFilter 
} from '@/types/meal-plan-templates';

export interface SavedMealPlan {
  _id?: string;
  userId: string;
  originalPlanId?: string;
  name: string;
  description?: string;
  
  // Plan data
  planData: IMealPlan;
  
  // Organization
  tags: string[];
  category?: string;
  isFavorite: boolean;
  
  // Sharing
  isPublic: boolean;
  shareId?: string; // For public sharing
  
  // Usage tracking
  lastUsed?: Date;
  usageCount: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export class SavedMealPlansService {
  private static COLLECTION_NAME = 'savedMealPlans';
  private static TEMPLATES_COLLECTION_NAME = 'mealPlanTemplates';

  /**
   * Save a meal plan for future use
   */
  static async saveMealPlan(
    userId: string,
    mealPlan: IMealPlan,
    name: string,
    options: {
      description?: string;
      tags?: string[];
      category?: string;
      isPublic?: boolean;
    } = {}
  ): Promise<SavedMealPlan> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<SavedMealPlan>(this.COLLECTION_NAME);

      const savedPlan: Omit<SavedMealPlan, '_id'> = {
        userId,
        name: name.trim(),
        description: options.description?.trim(),
        planData: {
          ...mealPlan,
          userId, // Ensure userId matches
        },
        tags: options.tags || [],
        category: options.category,
        isFavorite: false,
        isPublic: options.isPublic || false,
        shareId: options.isPublic ? this.generateShareId() : undefined,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await collection.insertOne(savedPlan);
      
      return {
        ...savedPlan,
        _id: result.insertedId.toString()
      };
    } catch (error) {
      console.error('Error saving meal plan:', error);
      throw new Error('Failed to save meal plan');
    }
  }

  /**
   * Get all saved meal plans for a user
   */
  static async getUserSavedPlans(
    userId: string,
    options: {
      category?: string;
      tags?: string[];
      search?: string;
      sortBy?: 'name' | 'createdAt' | 'lastUsed' | 'usageCount';
      sortOrder?: 'asc' | 'desc';
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<SavedMealPlan[]> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<SavedMealPlan>(this.COLLECTION_NAME);

      // Build query
      const query: any = { userId };

      if (options.category) {
        query.category = options.category;
      }

      if (options.tags && options.tags.length > 0) {
        query.tags = { $in: options.tags };
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
      const sortBy = options.sortBy || 'createdAt';
      const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
      sort[sortBy] = sortOrder;

      let cursor = collection.find(query).sort(sort);

      if (options.offset) {
        cursor = cursor.skip(options.offset);
      }

      if (options.limit) {
        cursor = cursor.limit(options.limit);
      }

      const plans = await cursor.toArray();
      
      return plans.map((plan: any) => ({
        ...plan,
        _id: plan._id?.toString()
      }));
    } catch (error) {
      console.error('Error getting saved meal plans:', error);
      throw new Error('Failed to retrieve saved meal plans');
    }
  }

  /**
   * Get a specific saved meal plan
   */
  static async getSavedPlan(
    planId: string,
    userId?: string
  ): Promise<SavedMealPlan | null> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<SavedMealPlan>(this.COLLECTION_NAME);

      const query: any = { _id: new ObjectId(planId) as any };
      
      // If userId provided, ensure user owns the plan or it's public
      if (userId) {
        query.$or = [
          { userId },
          { isPublic: true }
        ];
      } else {
        // If no userId, only return public plans
        query.isPublic = true;
      }

      const plan = await collection.findOne(query);
      
      if (!plan) return null;

      return {
        ...plan,
        _id: plan._id?.toString()
      };
    } catch (error) {
      console.error('Error getting saved meal plan:', error);
      return null;
    }
  }

  /**
   * Update a saved meal plan
   */
  static async updateSavedPlan(
    planId: string,
    userId: string,
    updates: Partial<Pick<SavedMealPlan, 'name' | 'description' | 'tags' | 'category' | 'isFavorite' | 'isPublic' | 'shareId'>>
  ): Promise<boolean> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<SavedMealPlan>(this.COLLECTION_NAME);

      const updateDoc: any = {
        ...updates,
        updatedAt: new Date()
      };

      // Handle public sharing
      if (updates.isPublic !== undefined) {
        if (updates.isPublic && !updates.shareId) {
          updateDoc.shareId = this.generateShareId();
        } else if (!updates.isPublic) {
          updateDoc.$unset = { shareId: 1 };
        }
      }

      const result = await collection.updateOne(
        { 
          _id: new ObjectId(planId) as any as any,
          userId 
        },
        updateDoc.$unset ? updateDoc : { $set: updateDoc }
      );

      return result.matchedCount > 0;
    } catch (error) {
      console.error('Error updating saved meal plan:', error);
      return false;
    }
  }

  /**
   * Delete a saved meal plan
   */
  static async deleteSavedPlan(planId: string, userId: string): Promise<boolean> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<SavedMealPlan>(this.COLLECTION_NAME);

      const result = await collection.deleteOne({
        _id: new ObjectId(planId) as any as any,
        userId
      });

      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting saved meal plan:', error);
      return false;
    }
  }

  /**
   * Increment usage count when a plan is used
   */
  static async incrementUsageCount(planId: string, userId: string): Promise<void> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<SavedMealPlan>(this.COLLECTION_NAME);

      await collection.updateOne(
        { 
          _id: new ObjectId(planId) as any as any,
          userId 
        },
        {
          $inc: { usageCount: 1 },
          $set: { lastUsed: new Date() }
        }
      );
    } catch (error) {
      console.error('Error incrementing usage count:', error);
    }
  }

  /**
   * Get public meal plans for browsing
   */
  static async getPublicPlans(
    options: {
      category?: string;
      tags?: string[];
      search?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<SavedMealPlan[]> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<SavedMealPlan>(this.COLLECTION_NAME);

      const query: any = { isPublic: true };

      if (options.category) {
        query.category = options.category;
      }

      if (options.tags && options.tags.length > 0) {
        query.tags = { $in: options.tags };
      }

      if (options.search) {
        query.$or = [
          { name: { $regex: options.search, $options: 'i' } },
          { description: { $regex: options.search, $options: 'i' } }
        ];
      }

      let cursor = collection
        .find(query)
        .sort({ usageCount: -1, createdAt: -1 });

      if (options.offset) {
        cursor = cursor.skip(options.offset);
      }

      if (options.limit) {
        cursor = cursor.limit(options.limit);
      }

      const plans = await cursor.toArray();
      
      return plans.map((plan: any) => ({
        ...plan,
        _id: plan._id?.toString()
      }));
    } catch (error) {
      console.error('Error getting public meal plans:', error);
      return [];
    }
  }

  /**
   * Get meal plan by share ID
   */
  static async getPlanByShareId(shareId: string): Promise<SavedMealPlan | null> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<SavedMealPlan>(this.COLLECTION_NAME);

      const plan = await collection.findOne({
        shareId,
        isPublic: true
      });

      if (!plan) return null;

      return {
        ...plan,
        _id: plan._id?.toString()
      };
    } catch (error) {
      console.error('Error getting plan by share ID:', error);
      return null;
    }
  }

  /**
   * Generate a unique share ID for public plans
   */
  private static generateShareId(): string {
    return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get user's meal plan statistics
   */
  static async getUserPlanStats(userId: string): Promise<{
    totalPlans: number;
    favoritePlans: number;
    publicPlans: number;
    totalUsage: number;
    categories: Record<string, number>;
  }> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<SavedMealPlan>(this.COLLECTION_NAME);

      const [stats] = await collection.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            totalPlans: { $sum: 1 },
            favoritePlans: {
              $sum: { $cond: [{ $eq: ['$isFavorite', true] }, 1, 0] }
            },
            publicPlans: {
              $sum: { $cond: [{ $eq: ['$isPublic', true] }, 1, 0] }
            },
            totalUsage: { $sum: '$usageCount' },
            categories: {
              $push: '$category'
            }
          }
        }
      ]).toArray();

      if (!stats) {
        return {
          totalPlans: 0,
          favoritePlans: 0,
          publicPlans: 0,
          totalUsage: 0,
          categories: {}
        };
      }

      // Count categories
      const categoryCounts: Record<string, number> = {};
      stats.categories.forEach((cat: string) => {
        if (cat) {
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        }
      });

      return {
        totalPlans: stats.totalPlans || 0,
        favoritePlans: stats.favoritePlans || 0,
        publicPlans: stats.publicPlans || 0,
        totalUsage: stats.totalUsage || 0,
        categories: categoryCounts
      };
    } catch (error) {
      console.error('Error getting user plan stats:', error);
      return {
        totalPlans: 0,
        favoritePlans: 0,
        publicPlans: 0,
        totalUsage: 0,
        categories: {}
      };
    }
  }
}