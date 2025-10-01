/**
 * User Recipe Upload Service
 * 
 * Professional system for user-uploaded recipes with image processing,
 * ingredient extraction, and comprehensive validation
 */

import clientPromise from '@/lib/db';
import { ObjectId } from 'mongodb';

export interface UserRecipe {
  _id?: string;
  userId: string;
  
  // Basic recipe information
  title: string;
  description?: string;
  
  // Recipe details
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  
  // Metadata
  servings: number;
  prepTime?: number; // minutes
  cookTime?: number; // minutes
  totalTime?: number; // calculated field
  difficulty: 'easy' | 'medium' | 'hard';
  
  // Categories and tags
  category: string; // main category
  cuisine?: string; // Italian, Mexican, etc.
  dietaryTags: string[]; // vegetarian, vegan, gluten-free, etc.
  customTags: string[]; // user's custom tags
  
  // Media
  images: RecipeImage[];
  videos?: RecipeVideo[];
  
  // Nutritional information (optional)
  nutrition?: NutritionInfo;
  
  // Recipe source and attribution
  source?: string; // original source if adapted
  isOriginal: boolean; // user's original recipe
  
  // Sharing and visibility
  isPublic: boolean;
  isApproved?: boolean; // admin approval for public recipes
  shareId?: string; // for sharing links
  
  // Usage and ratings
  personalRating?: number; // 1-5 stars
  personalNotes?: string;
  timesCooked: number;
  lastCooked?: Date;
  
  // AI-generated suggestions
  aiSuggestions?: {
    estimatedDifficulty?: string;
    suggestedTags?: string[];
    nutritionEstimate?: Partial<NutritionInfo>;
    cookingTips?: string[];
  };
  
  // Status and moderation
  status: 'draft' | 'published' | 'under-review' | 'rejected';
  moderationNotes?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface RecipeIngredient {
  id: string;
  name: string;
  amount: number;
  unit: string; // cup, tablespoon, gram, etc.
  notes?: string; // "chopped", "optional", etc.
  category?: 'protein' | 'vegetable' | 'grain' | 'spice' | 'dairy' | 'other';
}

export interface RecipeInstruction {
  id: string;
  step: number;
  text: string;
  image?: string;
  time?: number; // minutes for this step
  temperature?: number; // cooking temperature if applicable
  notes?: string;
}

export interface RecipeImage {
  id: string;
  url: string;
  alt?: string;
  isPrimary: boolean; // main recipe image
  caption?: string;
  step?: number; // if related to specific step
  uploadedAt: Date;
}

export interface RecipeVideo {
  id: string;
  url: string;
  title?: string;
  duration?: number; // seconds
  thumbnail?: string;
  step?: number; // if related to specific step
  uploadedAt: Date;
}

export interface NutritionInfo {
  calories?: number;
  protein?: number; // grams
  carbohydrates?: number; // grams
  fat?: number; // grams
  fiber?: number; // grams
  sugar?: number; // grams
  sodium?: number; // milligrams
  
  // Vitamins and minerals (optional)
  vitaminC?: number;
  iron?: number;
  calcium?: number;
}

export interface RecipeUploadData {
  title: string;
  description?: string;
  ingredients: Omit<RecipeIngredient, 'id'>[];
  instructions: Omit<RecipeInstruction, 'id'>[];
  servings: number;
  prepTime?: number;
  cookTime?: number;
  difficulty: UserRecipe['difficulty'];
  category: string;
  cuisine?: string;
  dietaryTags?: string[];
  customTags?: string[];
  images?: File[];
  isPublic?: boolean;
  source?: string;
  isOriginal?: boolean;
}

export interface RecipeValidationError {
  field: string;
  message: string;
  code: string;
}

export class UserRecipeUploadService {
  private static COLLECTION_NAME = 'userRecipes';
  private static MAX_IMAGES = 10;
  private static MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

  /**
   * Upload a new user recipe
   */
  static async uploadRecipe(
    userId: string,
    recipeData: RecipeUploadData,
    imageFiles?: File[]
  ): Promise<{ recipe: UserRecipe; errors?: RecipeValidationError[] }> {
    try {
      // Validate recipe data
      const validationErrors = await this.validateRecipeData(recipeData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.map(e => e.message).join(', ')}`);
      }

      // Process images if provided
      let processedImages: RecipeImage[] = [];
      if (imageFiles && imageFiles.length > 0) {
        processedImages = await this.processRecipeImages(imageFiles);
      }

      // Generate IDs for ingredients and instructions
      const ingredientsWithIds: RecipeIngredient[] = recipeData.ingredients.map((ingredient, index) => ({
        ...ingredient,
        id: `ingredient_${index}_${Date.now()}`,
        category: this.categorizeIngredient(ingredient.name)
      }));

      const instructionsWithIds: RecipeInstruction[] = recipeData.instructions.map((instruction, index) => ({
        ...instruction,
        id: `instruction_${index}_${Date.now()}`,
        step: index + 1
      }));

      // Calculate total time
      const totalTime = (recipeData.prepTime || 0) + (recipeData.cookTime || 0);

      // Create recipe object
      const recipe: Omit<UserRecipe, '_id'> = {
        userId,
        title: recipeData.title.trim(),
        description: recipeData.description?.trim(),
        ingredients: ingredientsWithIds,
        instructions: instructionsWithIds,
        servings: recipeData.servings,
        prepTime: recipeData.prepTime,
        cookTime: recipeData.cookTime,
        totalTime: totalTime > 0 ? totalTime : undefined,
        difficulty: recipeData.difficulty,
        category: recipeData.category,
        cuisine: recipeData.cuisine,
        dietaryTags: recipeData.dietaryTags || [],
        customTags: recipeData.customTags || [],
        images: processedImages,
        videos: [],
        isOriginal: recipeData.isOriginal ?? true,
        source: recipeData.source,
        isPublic: recipeData.isPublic ?? false,
        shareId: recipeData.isPublic ? this.generateShareId() : undefined,
        personalRating: undefined,
        personalNotes: undefined,
        timesCooked: 0,
        status: recipeData.isPublic ? 'under-review' : 'published',
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: recipeData.isPublic ? undefined : new Date()
      };

      // Save to database
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<UserRecipe>(this.COLLECTION_NAME);

      const result = await collection.insertOne(recipe);

      return {
        recipe: {
          ...recipe,
          _id: result.insertedId.toString()
        }
      };
    } catch (error) {
      console.error('Error uploading recipe:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to upload recipe');
    }
  }

  /**
   * Get user's uploaded recipes
   */
  static async getUserRecipes(
    userId: string,
    options: {
      status?: UserRecipe['status'];
      category?: string;
      search?: string;
      sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'timesCooked';
      sortOrder?: 'asc' | 'desc';
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<UserRecipe[]> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<UserRecipe>(this.COLLECTION_NAME);

      // Build query
      const query: any = { userId };

      if (options.status) {
        query.status = options.status;
      }

      if (options.category) {
        query.category = options.category;
      }

      if (options.search) {
        query.$or = [
          { title: { $regex: options.search, $options: 'i' } },
          { description: { $regex: options.search, $options: 'i' } },
          { customTags: { $in: [new RegExp(options.search, 'i')] } }
        ];
      }

      // Build sort
      const sort: any = {};
      const sortBy = options.sortBy || 'updatedAt';
      const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
      sort[sortBy] = sortOrder;

      let cursor = collection.find(query).sort(sort);

      if (options.offset) {
        cursor = cursor.skip(options.offset);
      }

      if (options.limit) {
        cursor = cursor.limit(options.limit);
      }

      const recipes = await cursor.toArray();

      return recipes.map((recipe: any) => ({
        ...recipe,
        _id: recipe._id?.toString()
      }));
    } catch (error) {
      console.error('Error getting user recipes:', error);
      return [];
    }
  }

  /**
   * Update a user recipe
   */
  static async updateRecipe(
    recipeId: string,
    userId: string,
    updates: Partial<UserRecipe>
  ): Promise<boolean> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<UserRecipe>(this.COLLECTION_NAME);

      // If making public, set status to under-review
      if (updates.isPublic && !updates.status) {
        updates.status = 'under-review';
        updates.shareId = this.generateShareId();
      }

      // Recalculate total time if prep or cook time changed
      if (updates.prepTime !== undefined || updates.cookTime !== undefined) {
        const currentRecipe = await collection.findOne({
          _id: new ObjectId(recipeId) as any,
          userId
        });

        if (currentRecipe) {
          const prepTime = updates.prepTime ?? currentRecipe.prepTime ?? 0;
          const cookTime = updates.cookTime ?? currentRecipe.cookTime ?? 0;
          updates.totalTime = prepTime + cookTime;
        }
      }

      const result = await collection.updateOne(
        {
          _id: new ObjectId(recipeId) as any,
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
      console.error('Error updating recipe:', error);
      return false;
    }
  }

  /**
   * Delete a user recipe
   */
  static async deleteRecipe(recipeId: string, userId: string): Promise<boolean> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<UserRecipe>(this.COLLECTION_NAME);

      const result = await collection.deleteOne({
        _id: new ObjectId(recipeId) as any,
        userId
      });

      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting recipe:', error);
      return false;
    }
  }

  /**
   * Get a single recipe by ID
   */
  static async getRecipe(
    recipeId: string,
    userId?: string
  ): Promise<UserRecipe | null> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<UserRecipe>(this.COLLECTION_NAME);

      const query: any = { _id: new ObjectId(recipeId) as any };

      // If userId provided, ensure user owns the recipe or it's public
      if (userId) {
        query.$or = [
          { userId },
          { isPublic: true, status: 'published' }
        ];
      } else {
        // If no userId, only return public published recipes
        query.isPublic = true;
        query.status = 'published';
      }

      const recipe = await collection.findOne(query);

      if (!recipe) return null;

      return {
        ...recipe,
        _id: recipe._id?.toString()
      };
    } catch (error) {
      console.error('Error getting recipe:', error);
      return null;
    }
  }

  /**
   * Validate recipe data
   */
  private static async validateRecipeData(data: RecipeUploadData): Promise<RecipeValidationError[]> {
    const errors: RecipeValidationError[] = [];

    // Title validation
    if (!data.title || data.title.trim().length < 3) {
      errors.push({
        field: 'title',
        message: 'Recipe title must be at least 3 characters long',
        code: 'TITLE_TOO_SHORT'
      });
    }

    if (data.title && data.title.length > 100) {
      errors.push({
        field: 'title',
        message: 'Recipe title must be less than 100 characters',
        code: 'TITLE_TOO_LONG'
      });
    }

    // Ingredients validation
    if (!data.ingredients || data.ingredients.length === 0) {
      errors.push({
        field: 'ingredients',
        message: 'At least one ingredient is required',
        code: 'NO_INGREDIENTS'
      });
    }

    // Instructions validation
    if (!data.instructions || data.instructions.length === 0) {
      errors.push({
        field: 'instructions',
        message: 'At least one instruction is required',
        code: 'NO_INSTRUCTIONS'
      });
    }

    // Servings validation
    if (!data.servings || data.servings < 1 || data.servings > 50) {
      errors.push({
        field: 'servings',
        message: 'Servings must be between 1 and 50',
        code: 'INVALID_SERVINGS'
      });
    }

    // Time validation
    if (data.prepTime && (data.prepTime < 0 || data.prepTime > 1440)) {
      errors.push({
        field: 'prepTime',
        message: 'Prep time must be between 0 and 1440 minutes (24 hours)',
        code: 'INVALID_PREP_TIME'
      });
    }

    if (data.cookTime && (data.cookTime < 0 || data.cookTime > 1440)) {
      errors.push({
        field: 'cookTime',
        message: 'Cook time must be between 0 and 1440 minutes (24 hours)',
        code: 'INVALID_COOK_TIME'
      });
    }

    return errors;
  }

  /**
   * Process and validate recipe images
   */
  private static async processRecipeImages(files: File[]): Promise<RecipeImage[]> {
    const processedImages: RecipeImage[] = [];

    for (let i = 0; i < Math.min(files.length, this.MAX_IMAGES); i++) {
      const file = files[i];

      // Validate file size
      if (file.size > this.MAX_FILE_SIZE) {
        console.warn(`Image ${file.name} exceeds size limit, skipping`);
        continue;
      }

      // Validate file type
      const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
      if (!this.ALLOWED_EXTENSIONS.includes(extension)) {
        console.warn(`Image ${file.name} has unsupported format, skipping`);
        continue;
      }

      // In a real implementation, you would upload to cloud storage here
      // For now, we'll create a placeholder URL
      const imageUrl = `placeholder-${Date.now()}-${i}.jpg`;

      processedImages.push({
        id: `image_${i}_${Date.now()}`,
        url: imageUrl,
        isPrimary: i === 0, // First image is primary
        uploadedAt: new Date()
      });
    }

    return processedImages;
  }

  /**
   * Categorize ingredient based on name
   */
  private static categorizeIngredient(name: string): RecipeIngredient['category'] {
    const lowerName = name.toLowerCase();

    // Protein keywords
    if (/\b(chicken|beef|pork|fish|salmon|tuna|turkey|lamb|egg|tofu|beans|lentils)\b/.test(lowerName)) {
      return 'protein';
    }

    // Vegetable keywords
    if (/\b(onion|garlic|tomato|carrot|celery|pepper|mushroom|spinach|broccoli|potato)\b/.test(lowerName)) {
      return 'vegetable';
    }

    // Grain keywords
    if (/\b(rice|pasta|bread|flour|quinoa|oats|barley|wheat)\b/.test(lowerName)) {
      return 'grain';
    }

    // Dairy keywords
    if (/\b(milk|cheese|butter|cream|yogurt|sour cream)\b/.test(lowerName)) {
      return 'dairy';
    }

    // Spice keywords
    if (/\b(salt|pepper|oregano|basil|thyme|cumin|paprika|cinnamon|ginger)\b/.test(lowerName)) {
      return 'spice';
    }

    return 'other';
  }

  /**
   * Generate a unique share ID
   */
  private static generateShareId(): string {
    return `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get recipe upload statistics for user
   */
  static async getUserUploadStats(userId: string): Promise<{
    totalRecipes: number;
    publishedRecipes: number;
    draftRecipes: number;
    publicRecipes: number;
    totalTimesCooked: number;
    averageRating: number;
    categories: Record<string, number>;
  }> {
    try {
      const client = await clientPromise;
      const db = client.db('smartplates');
      const collection = db.collection<UserRecipe>(this.COLLECTION_NAME);

      const [stats] = await collection.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            totalRecipes: { $sum: 1 },
            publishedRecipes: {
              $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
            },
            draftRecipes: {
              $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
            },
            publicRecipes: {
              $sum: { $cond: [{ $eq: ['$isPublic', true] }, 1, 0] }
            },
            totalTimesCooked: { $sum: '$timesCooked' },
            averageRating: { $avg: '$personalRating' },
            categories: { $push: '$category' }
          }
        }
      ]).toArray();

      if (!stats) {
        return {
          totalRecipes: 0,
          publishedRecipes: 0,
          draftRecipes: 0,
          publicRecipes: 0,
          totalTimesCooked: 0,
          averageRating: 0,
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
        totalRecipes: stats.totalRecipes || 0,
        publishedRecipes: stats.publishedRecipes || 0,
        draftRecipes: stats.draftRecipes || 0,
        publicRecipes: stats.publicRecipes || 0,
        totalTimesCooked: stats.totalTimesCooked || 0,
        averageRating: stats.averageRating || 0,
        categories: categoryCounts
      };
    } catch (error) {
      console.error('Error getting user upload stats:', error);
      return {
        totalRecipes: 0,
        publishedRecipes: 0,
        draftRecipes: 0,
        publicRecipes: 0,
        totalTimesCooked: 0,
        averageRating: 0,
        categories: {}
      };
    }
  }
}