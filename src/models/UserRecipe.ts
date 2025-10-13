/**
 * UserRecipe Database Model for SmartPlates
 *
 * This file handles user-uploaded recipes (including admin uploads)
 * Separate from Spoonacular Recipe collection for clear data organization
 */

import { ObjectId } from "mongodb";
import { getCollection, COLLECTIONS, toObjectId } from "@/lib/db";

export interface UserRecipe {
  _id: ObjectId;
  
  // Author information
  authorId: ObjectId; // User or Admin ID
  authorType: 'user' | 'admin'; // Type of author
  authorName: string; // For display purposes
  
  // Basic recipe information (matching EnhancedRecipeFormData)
  title: string;
  description: string;
  
  // Recipe content
  ingredients: UserRecipeIngredient[];
  instructions: UserRecipeInstruction[];
  
  // Recipe metadata
  servings: number;
  prepTime: number; // minutes
  cookTime: number; // minutes
  totalTime: number; // calculated: prepTime + cookTime
  difficulty: 'easy' | 'medium' | 'hard';
  
  // Categories and tags (matching form interface)
  category: string;
  cuisine?: string;
  dietaryTags: string[]; // vegetarian, vegan, etc.
  allergens: string[]; // contains allergens
  customTags: string[]; // user-defined tags
  
  // Media (Cloudinary URLs)
  images: UserRecipeImage[];
  primaryImageUrl?: string;
  
  // Recipe source and attribution
  source?: string;
  isOriginal: boolean;
  
  // Visibility and status
  isPublic: boolean;
  status: 'draft' | 'published' | 'under-review' | 'approved' | 'rejected';
  
  // Admin moderation (for user uploads)
  moderationNotes?: string;
  moderatedBy?: ObjectId; // Admin who moderated
  moderatedAt?: Date;
  
  // Usage tracking
  views: number;
  likes: number;
  saves: number;
  timesCooked: number;
  
  // User interactions
  likedBy: ObjectId[]; // User IDs who liked this recipe
  savedBy: ObjectId[]; // User IDs who saved this recipe
  cookedBy: ObjectId[]; // User IDs who marked as cooked
  
  // Reviews and ratings
  reviews: UserRecipeReview[];
  averageRating: number;
  totalReviews: number;
  
  // SEO and discovery
  searchTags: string[]; // Generated tags for search
  slug: string; // URL-friendly slug
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface UserRecipeIngredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  notes?: string;
}

export interface UserRecipeInstruction {
  id: string;
  stepNumber: number;
  instruction: string;
  time?: number; // minutes
  temperature?: number; // celsius
}

export interface UserRecipeImage {
  id: string;
  url: string;
  alt?: string;
  isPrimary: boolean;
  caption?: string;
}

export interface UserRecipeReview {
  id: string;
  userId: ObjectId;
  userName: string;
  rating: number; // 1-5
  comment?: string;
  images?: string[]; // review images
  createdAt: Date;
}

export interface CreateUserRecipeInput {
  authorId: string;
  authorType: 'user' | 'admin';
  authorName: string;
  title: string;
  description: string;
  ingredients: UserRecipeIngredient[];
  instructions: UserRecipeInstruction[];
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  cuisine?: string;
  dietaryTags: string[];
  allergens: string[];
  customTags: string[];
  images: UserRecipeImage[];
  primaryImageUrl?: string;
  source?: string;
  isOriginal: boolean;
  isPublic: boolean;
}

export interface UpdateUserRecipeInput {
  title?: string;
  description?: string;
  ingredients?: UserRecipeIngredient[];
  instructions?: UserRecipeInstruction[];
  servings?: number;
  prepTime?: number;
  cookTime?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  cuisine?: string;
  dietaryTags?: string[];
  allergens?: string[];
  customTags?: string[];
  images?: UserRecipeImage[];
  primaryImageUrl?: string;
  source?: string;
  isOriginal?: boolean;
  isPublic?: boolean;
  status?: 'draft' | 'published' | 'under-review' | 'approved' | 'rejected';
}

/**
 * Creates a new user recipe
 */
export async function createUserRecipe(recipeData: CreateUserRecipeInput): Promise<UserRecipe> {
  try {
    const userRecipesCollection = await getCollection<UserRecipe>(COLLECTIONS.USER_RECIPES);
    
    // Generate URL-friendly slug
    const slug = recipeData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Generate search tags
    const searchTags = [
      ...recipeData.dietaryTags,
      ...recipeData.customTags,
      recipeData.category,
      recipeData.difficulty,
      ...(recipeData.cuisine ? [recipeData.cuisine] : [])
    ];
    
    const newRecipe: Omit<UserRecipe, "_id"> = {
      authorId: toObjectId(recipeData.authorId),
      authorType: recipeData.authorType,
      authorName: recipeData.authorName,
      title: recipeData.title,
      description: recipeData.description,
      ingredients: recipeData.ingredients,
      instructions: recipeData.instructions.map((instruction, index) => ({
        ...instruction,
        stepNumber: index + 1,
      })),
      servings: recipeData.servings,
      prepTime: recipeData.prepTime,
      cookTime: recipeData.cookTime,
      totalTime: recipeData.prepTime + recipeData.cookTime,
      difficulty: recipeData.difficulty,
      category: recipeData.category,
      cuisine: recipeData.cuisine,
      dietaryTags: recipeData.dietaryTags,
      allergens: recipeData.allergens,
      customTags: recipeData.customTags,
      images: recipeData.images,
      primaryImageUrl: recipeData.primaryImageUrl,
      source: recipeData.source,
      isOriginal: recipeData.isOriginal,
      isPublic: recipeData.isPublic,
      
      // Default status based on author type
      status: recipeData.authorType === 'admin' ? 'approved' : 'under-review',
      
      // Initialize counters
      views: 0,
      likes: 0,
      saves: 0,
      timesCooked: 0,
      
      // Initialize arrays
      likedBy: [],
      savedBy: [],
      cookedBy: [],
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
      
      // SEO
      searchTags,
      slug: `${slug}-${Date.now()}`, // Add timestamp to ensure uniqueness
      
      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: recipeData.isPublic ? new Date() : undefined,
    };
    
    const result = await userRecipesCollection.insertOne(newRecipe as any);
    
    return {
      ...newRecipe,
      _id: result.insertedId,
    };
  } catch (error) {
    console.error('Error creating user recipe:', error);
    throw new Error('Failed to create recipe');
  }
}

/**
 * Gets user recipe by ID
 */
export async function getUserRecipeById(id: string): Promise<UserRecipe | null> {
  try {
    const userRecipesCollection = await getCollection<UserRecipe>(COLLECTIONS.USER_RECIPES);
    return await userRecipesCollection.findOne({ _id: toObjectId(id) });
  } catch (error) {
    console.error('Error getting user recipe by ID:', error);
    return null;
  }
}

/**
 * Gets user recipe by slug
 */
export async function getUserRecipeBySlug(slug: string): Promise<UserRecipe | null> {
  try {
    const userRecipesCollection = await getCollection<UserRecipe>(COLLECTIONS.USER_RECIPES);
    return await userRecipesCollection.findOne({ slug });
  } catch (error) {
    console.error('Error getting user recipe by slug:', error);
    return null;
  }
}

/**
 * Updates user recipe
 */
export async function updateUserRecipe(id: string, updateData: UpdateUserRecipeInput): Promise<UserRecipe | null> {
  try {
    const userRecipesCollection = await getCollection<UserRecipe>(COLLECTIONS.USER_RECIPES);
    
    // Calculate total time if prep or cook time changed
    const updates: any = {
      ...updateData,
      updatedAt: new Date(),
    };
    
    if (updateData.prepTime !== undefined || updateData.cookTime !== undefined) {
      const recipe = await getUserRecipeById(id);
      if (recipe) {
        const prepTime = updateData.prepTime ?? recipe.prepTime;
        const cookTime = updateData.cookTime ?? recipe.cookTime;
        updates.totalTime = prepTime + cookTime;
      }
    }
    
    const result = await userRecipesCollection.findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: updates },
      { returnDocument: 'after' }
    );
    
    return result || null;
  } catch (error) {
    console.error('Error updating user recipe:', error);
    return null;
  }
}

/**
 * Gets recipes by author
 */
export async function getRecipesByAuthor(authorId: string, authorType: 'user' | 'admin', page = 1, limit = 20) {
  try {
    const userRecipesCollection = await getCollection<UserRecipe>(COLLECTIONS.USER_RECIPES);
    
    const skip = (page - 1) * limit;
    
    const [recipes, total] = await Promise.all([
      userRecipesCollection
        .find({ authorId: toObjectId(authorId), authorType })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      userRecipesCollection.countDocuments({ authorId: toObjectId(authorId), authorType })
    ]);
    
    return {
      recipes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error getting recipes by author:', error);
    throw new Error('Failed to fetch recipes');
  }
}

/**
 * Gets public recipes with filters
 */
export async function getPublicUserRecipes(filters: {
  category?: string;
  dietary?: string[];
  difficulty?: string;
  cuisine?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'popular' | 'rating';
} = {}) {
  try {
    const userRecipesCollection = await getCollection<UserRecipe>(COLLECTIONS.USER_RECIPES);
    
    const {
      category,
      dietary,
      difficulty,
      cuisine,
      search,
      page = 1,
      limit = 20,
      sortBy = 'newest'
    } = filters;
    
    // Build query
    const query: any = {
      isPublic: true,
      status: { $in: ['approved', 'published'] }
    };
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (cuisine) query.cuisine = cuisine;
    if (dietary?.length) {
      query.dietaryTags = { $in: dietary };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { searchTags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Build sort
    let sort: any = {};
    switch (sortBy) {
      case 'popular':
        sort = { likes: -1, views: -1 };
        break;
      case 'rating':
        sort = { averageRating: -1, totalReviews: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }
    
    const skip = (page - 1) * limit;
    
    const [recipes, total] = await Promise.all([
      userRecipesCollection
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray(),
      userRecipesCollection.countDocuments(query)
    ]);
    
    return {
      recipes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error getting public user recipes:', error);
    throw new Error('Failed to fetch recipes');
  }
}

/**
 * Increments recipe view count
 */
export async function incrementRecipeViews(id: string): Promise<boolean> {
  try {
    const userRecipesCollection = await getCollection<UserRecipe>(COLLECTIONS.USER_RECIPES);
    
    const result = await userRecipesCollection.updateOne(
      { _id: toObjectId(id) },
      { $inc: { views: 1 } }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error incrementing recipe views:', error);
    return false;
  }
}

/**
 * Toggles recipe like by user
 */
export async function toggleRecipeLike(recipeId: string, userId: string): Promise<boolean> {
  try {
    const userRecipesCollection = await getCollection<UserRecipe>(COLLECTIONS.USER_RECIPES);
    
    const recipe = await getUserRecipeById(recipeId);
    if (!recipe) return false;
    
    const userObjectId = toObjectId(userId);
    const isLiked = recipe.likedBy.some(id => id.toString() === userId);
    
    const result = await userRecipesCollection.updateOne(
      { _id: toObjectId(recipeId) },
      isLiked 
        ? { 
            $pull: { likedBy: userObjectId },
            $inc: { likes: -1 }
          }
        : { 
            $push: { likedBy: userObjectId },
            $inc: { likes: 1 }
          }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error toggling recipe like:', error);
    return false;
  }
}

/**
 * Deletes user recipe
 */
export async function deleteUserRecipe(id: string): Promise<boolean> {
  try {
    const userRecipesCollection = await getCollection<UserRecipe>(COLLECTIONS.USER_RECIPES);
    
    const result = await userRecipesCollection.deleteOne({ _id: toObjectId(id) });
    
    return result.deletedCount > 0;
  } catch (error) {
    console.error('Error deleting user recipe:', error);
    return false;
  }
}

/**
 * Gets recipes pending moderation
 */
export async function getRecipesPendingModeration(page = 1, limit = 20) {
  try {
    const userRecipesCollection = await getCollection<UserRecipe>(COLLECTIONS.USER_RECIPES);
    
    const skip = (page - 1) * limit;
    
    const [recipes, total] = await Promise.all([
      userRecipesCollection
        .find({ status: 'under-review' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      userRecipesCollection.countDocuments({ status: 'under-review' })
    ]);
    
    return {
      recipes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error getting recipes pending moderation:', error);
    throw new Error('Failed to fetch pending recipes');
  }
}