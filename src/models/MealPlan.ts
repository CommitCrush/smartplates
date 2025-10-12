/**
 * MealPlan Model & Types
 * 
 * This model handles weekly meal planning with support for:
 * - Multiple meals per day (breakfast, lunch, dinner, snacks)
 * - Recipe associations (ready for real Recipe integration)
 * - User-specific meal plans
 * - Date-based organization
 */

import { ObjectId, type Collection } from 'mongodb';
import { getCollection, COLLECTIONS } from '@/lib/db';
import { shouldBeAdmin } from '@/config/team';

// ========================================
// TypeScript Interfaces
// ========================================

/**
 * Individual meal slot within a day
 */
export interface MealSlot {
  recipeId?: string; // Reference to Recipe (will be populated later)
  recipeName?: string; // For display purposes and mock data
  servings?: number; // Number of servings planned
  notes?: string; // User notes for this meal
  cookingTime?: number; // In minutes
  prepTime?: number; // In minutes
  
  // Enhanced recipe information
  image?: string; // Recipe image URL
  authorName?: string; // Recipe author name
  authorEmail?: string; // Recipe author email
  authorType?: 'admin' | 'user'; // Recipe author type
  totalTime?: number; // Total cooking time (prep + cook)
  difficulty?: 'easy' | 'medium' | 'hard'; // Recipe difficulty
  category?: string; // Recipe category
}

/**
 * All meals for a single day
 */
export interface DayMeals {
  date: Date;
  breakfast: MealSlot[];
  lunch: MealSlot[];
  dinner: MealSlot[];
  snacks: MealSlot[];
  dailyNotes?: string; // Notes for the entire day
}

/**
 * Complete meal plan for a week
 */
export interface IMealPlan {
  _id?: ObjectId;
  userId: string;
  weekStartDate: Date; // Monday of the week
  weekEndDate: Date; // Sunday of the week
  title?: string; // User-defined name for the meal plan
  days: DayMeals[]; // 7 days of meals
  totalCalories?: number; // Calculated total (optional)
  shoppingListGenerated?: boolean; // Has shopping list been created
  isTemplate?: boolean; // Can be used as a template for future weeks
  tags?: string[]; // User tags for organization
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// MealPlan Service Class
// ========================================

export class MealPlanService {
  private static async getCollection(): Promise<Collection<IMealPlan>> {
    return await getCollection<IMealPlan>(COLLECTIONS.MEAL_PLANS);
  }

  /**
   * Validates meal plan data
   */
  private static validateMealPlan(mealPlan: Partial<IMealPlan>): void {
    if (mealPlan.days && mealPlan.days.length !== 7) {
      throw new Error('A meal plan must contain exactly 7 days');
    }

    // Validate meal slots
    if (mealPlan.days) {
      for (const day of mealPlan.days) {
        for (const mealType of ['breakfast', 'lunch', 'dinner', 'snacks'] as const) {
          for (const meal of day[mealType] || []) {
            if (meal.servings && (meal.servings < 1 || meal.servings > 20)) {
              throw new Error('Servings must be between 1 and 20');
            }
            if (meal.cookingTime && (meal.cookingTime < 0 || meal.cookingTime > 1440)) {
              throw new Error('Cooking time must be between 0 and 1440 minutes');
            }
            if (meal.prepTime && (meal.prepTime < 0 || meal.prepTime > 720)) {
              throw new Error('Prep time must be between 0 and 720 minutes');
            }
            if (meal.notes && meal.notes.length > 500) {
              throw new Error('Notes must be 500 characters or less');
            }
          }
        }
        if (day.dailyNotes && day.dailyNotes.length > 1000) {
          throw new Error('Daily notes must be 1000 characters or less');
        }
      }
    }

    if (mealPlan.title && mealPlan.title.length > 100) {
      throw new Error('Title must be 100 characters or less');
    }

    if (mealPlan.tags) {
      for (const tag of mealPlan.tags) {
        if (tag.length > 50) {
          throw new Error('Tags must be 50 characters or less');
        }
      }
    }
  }

  /**
   * Adjusts date to Monday of the week
   */
  private static adjustToMonday(date: Date): Date {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 1) return new Date(date); // Already Monday
    
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return new Date(date.getTime() - (daysToSubtract * 24 * 60 * 60 * 1000));
  }

  /**
   * Creates a new meal plan
   */
  static async create(mealPlanData: Omit<IMealPlan, '_id' | 'createdAt' | 'updatedAt'>): Promise<IMealPlan> {
    this.validateMealPlan(mealPlanData);
    
    const collection = await this.getCollection();
    const now = new Date();
    
    // Adjust weekStartDate to Monday
    const weekStartDate = this.adjustToMonday(new Date(mealPlanData.weekStartDate));
    const weekEndDate = new Date(weekStartDate.getTime() + (6 * 24 * 60 * 60 * 1000));
    
    const mealPlan: Omit<IMealPlan, '_id'> = {
      ...mealPlanData,
      weekStartDate,
      weekEndDate,
      title: mealPlanData.title || `Meal Plan - Week of ${weekStartDate.toLocaleDateString()}`,
      days: mealPlanData.days || this.createEmptyWeek(weekStartDate),
      shoppingListGenerated: mealPlanData.shoppingListGenerated || false,
      isTemplate: mealPlanData.isTemplate || false,
      tags: mealPlanData.tags || [],
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(mealPlan);
    return { ...mealPlan, _id: result.insertedId };
  }

  /**
   * Creates empty week structure
   */
  private static createEmptyWeek(weekStartDate: Date): DayMeals[] {
    const days: DayMeals[] = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(weekStartDate.getTime() + (i * 24 * 60 * 60 * 1000));
      days.push({
        date: dayDate,
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
      });
    }
    return days;
  }

  /**
   * Finds meal plan by ID
   */
  static async findById(id: string | ObjectId): Promise<IMealPlan | null> {
    const collection = await this.getCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return await collection.findOne({ _id: objectId });
  }

  /**
   * Finds meal plan by user and week
   */
  static async findByUserAndWeek(userId: string, weekStartDate: Date): Promise<IMealPlan | null> {
    const collection = await this.getCollection();
    const adjustedWeekStart = this.adjustToMonday(weekStartDate);
    
    return await collection.findOne({
      userId,
      weekStartDate: adjustedWeekStart
    });
  }

  /**
   * Finds all meal plans for a user
   */
  static async findByUserId(userId: string, options?: { isTemplate?: boolean; limit?: number; skip?: number }): Promise<IMealPlan[]> {
    const collection = await this.getCollection();
    const query: any = { userId };
    
    if (options?.isTemplate !== undefined) {
      query.isTemplate = options.isTemplate;
    }

    let cursor = collection.find(query).sort({ weekStartDate: -1 });
    
    if (options?.skip) cursor = cursor.skip(options.skip);
    if (options?.limit) cursor = cursor.limit(options.limit);
    
    return await cursor.toArray();
  }

  /**
   * Updates a meal plan
   */
  static async updateById(id: string | ObjectId, updates: Partial<IMealPlan>): Promise<IMealPlan | null> {
    this.validateMealPlan(updates);
    
    const collection = await this.getCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };
    
    // Remove _id from updates if present
    delete (updateData as any)._id;
    
    const result = await collection.findOneAndUpdate(
      { _id: objectId },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    return result || null;
  }

  /**
   * Updates meal plan by user and week
   */
  static async updateByUserAndWeek(userId: string, weekStartDate: Date, updates: Partial<IMealPlan>): Promise<IMealPlan | null> {
    this.validateMealPlan(updates);
    
    const collection = await this.getCollection();
    const adjustedWeekStart = this.adjustToMonday(weekStartDate);
    
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };
    
    // Remove _id from updates if present
    delete (updateData as any)._id;
    
    const result = await collection.findOneAndUpdate(
      { 
        userId,
        weekStartDate: adjustedWeekStart
      },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    return result || null;
  }

  /**
   * Deletes a meal plan by ID
   */
  static async deleteById(id: string | ObjectId): Promise<boolean> {
    const collection = await this.getCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const result = await collection.deleteOne({ _id: objectId });
    return result.deletedCount > 0;
  }

  /**
   * Creates a weekly meal plan with empty structure
   */
  static async createWeeklyPlan(userId: string, weekStartDate: Date): Promise<IMealPlan> {
    const adjustedWeekStart = this.adjustToMonday(weekStartDate);
    const weekEndDate = new Date(adjustedWeekStart.getTime() + (6 * 24 * 60 * 60 * 1000));
    
    return await this.create({
      userId,
      weekStartDate: adjustedWeekStart,
      weekEndDate,
      title: `Week of ${adjustedWeekStart.toLocaleDateString()}`,
      days: this.createEmptyWeek(adjustedWeekStart)
    });
  }

  /**
   * Finds user templates
   */
  static async findUserTemplates(userId: string): Promise<IMealPlan[]> {
    return await this.findByUserId(userId, { isTemplate: true });
  }

  /**
   * Static methods for Mongoose-style compatibility
   */
  static async findOne(query: any): Promise<IMealPlan | null> {
    const collection = await this.getCollection();
    return await collection.findOne(query);
  }

  static async find(query: any): Promise<IMealPlan[]> {
    const collection = await this.getCollection();
    return await collection.find(query).toArray();
  }

  static async save(mealPlan: IMealPlan): Promise<IMealPlan> {
    if (mealPlan._id) {
      return await this.updateById(mealPlan._id, mealPlan) || mealPlan;
    } else {
      return await this.create(mealPlan);
    }
  }

  /**
   * Enriches meal slots with recipe information from spoonacular_recipes collection
   */
  static async enrichMealSlotWithRecipe(mealSlot: MealSlot, authorEmail?: string): Promise<MealSlot> {
    if (!mealSlot.recipeId) return mealSlot;

    try {
      // Try to get recipe from spoonacular_recipes collection
      const recipesCollection = await getCollection(COLLECTIONS.RECIPES);
      
      // Build query conditions based on the recipeId format
      const queryConditions: any[] = [];
      
      // If it looks like a spoonacular ID (contains 'spoonacular-' or is just numbers)
      if (mealSlot.recipeId.includes('spoonacular-')) {
        const spoonacularId = mealSlot.recipeId.replace('spoonacular-', '');
        if (!isNaN(parseInt(spoonacularId))) {
          queryConditions.push({ id: parseInt(spoonacularId) });
          queryConditions.push({ spoonacularId: parseInt(spoonacularId) });
        }
      } else if (/^\d+$/.test(mealSlot.recipeId)) {
        // If it's just a number, try both id and spoonacularId
        queryConditions.push({ id: parseInt(mealSlot.recipeId) });
        queryConditions.push({ spoonacularId: parseInt(mealSlot.recipeId) });
      } else if (/^[0-9a-fA-F]{24}$/.test(mealSlot.recipeId)) {
        // Only try ObjectId if it's a valid 24-character hex string
        queryConditions.push({ _id: new ObjectId(mealSlot.recipeId) });
      }
      
      // If no valid conditions, skip enrichment
      if (queryConditions.length === 0) {
        console.warn(`Invalid recipe ID format: ${mealSlot.recipeId}`);
        return mealSlot;
      }
      
      const recipe = await recipesCollection.findOne({ 
        $or: queryConditions
      });

      if (recipe) {
        // Determine author information
        let authorName = 'Unknown';
        let authorType: 'admin' | 'user' = 'user';
        
        if (recipe.authorId || recipe.authorEmail) {
          const usersCollection = await getCollection(COLLECTIONS.USERS);
          const author = await usersCollection.findOne({ 
            $or: [
              { _id: recipe.authorId ? new ObjectId(recipe.authorId) : undefined },
              { email: recipe.authorEmail }
            ].filter(Boolean)
          });
          
          if (author) {
            authorName = author.name || author.displayName || 'Unknown';
            authorType = shouldBeAdmin(author.email) ? 'admin' : 'user';
          }
        } else if (authorEmail) {
          // Use current user as author if no recipe author found
          const usersCollection = await getCollection(COLLECTIONS.USERS);
          const currentUser = await usersCollection.findOne({ email: authorEmail });
          if (currentUser) {
            authorName = currentUser.name || currentUser.displayName || 'Unknown';
            authorType = shouldBeAdmin(authorEmail) ? 'admin' : 'user';
          }
        }

        return {
          ...mealSlot,
          image: recipe.image || recipe.imageUrl || '/placeholder-recipe.svg',
          authorName,
          authorEmail: recipe.authorEmail || authorEmail,
          authorType,
          totalTime: (recipe.readyInMinutes || recipe.cookingTime || 0) + (recipe.preparationMinutes || recipe.prepTime || 0),
          difficulty: recipe.difficulty || 'medium',
          category: recipe.dishTypes?.[0] || recipe.category || 'General',
          cookingTime: recipe.readyInMinutes || recipe.cookingTime || mealSlot.cookingTime,
          prepTime: recipe.preparationMinutes || recipe.prepTime || mealSlot.prepTime
        };
      }
    } catch (error) {
      console.error('Error enriching meal slot with recipe:', error);
    }

    return mealSlot;
  }

  /**
   * Enriches a full meal plan with recipe information
   */
  static async enrichMealPlanWithRecipes(mealPlan: IMealPlan): Promise<IMealPlan> {
    try {
      const enrichedDays = await Promise.all(
        mealPlan.days.map(async (day) => {
          const enrichedDay = { ...day };
          
          // Enrich all meal types
          for (const mealType of ['breakfast', 'lunch', 'dinner', 'snacks'] as const) {
            enrichedDay[mealType] = await Promise.all(
              day[mealType].map(meal => this.enrichMealSlotWithRecipe(meal, mealPlan.userId))
            );
          }
          
          return enrichedDay;
        })
      );

      return {
        ...mealPlan,
        days: enrichedDays
      };
    } catch (error) {
      console.error('Error enriching meal plan with recipes:', error);
      return mealPlan;
    }
  }

  /**
   * Gets total meals count
   */
  static getTotalMealsCount(mealPlan: IMealPlan): number {
    return mealPlan.days.reduce((total: number, day: DayMeals) => {
      return total + 
        day.breakfast.length + 
        day.lunch.length + 
        day.dinner.length + 
        day.snacks.length;
    }, 0);
  }

  /**
   * Gets day by date
   */
  static getDayByDate(mealPlan: IMealPlan, date: Date): DayMeals | undefined {
    return mealPlan.days.find((day: DayMeals) => 
      day.date.toDateString() === date.toDateString()
    );
  }

  /**
   * Gets week number
   */
  static getWeekNumber(mealPlan: IMealPlan): number {
    const startDate = new Date(mealPlan.weekStartDate);
    const oneJan = new Date(startDate.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((startDate.valueOf() - oneJan.valueOf()) / (24 * 60 * 60 * 1000));
    return Math.ceil((startDate.getDay() + 1 + numberOfDays) / 7);
  }
}

// ========================================
// Default Export for Compatibility
// ========================================

// Export service as default for compatibility with existing imports
export default MealPlanService;

// Also export as MealPlan for Mongoose-style compatibility
export { MealPlanService as MealPlan };