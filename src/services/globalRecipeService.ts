/**
 * Global Recipe Service
 * 
 * Unified service for handling both user-uploaded recipes and admin recipes
 * Provides consistent interface for recipe operations across the application
 */

import { createUserRecipe, getUserRecipeById, updateUserRecipe, deleteUserRecipe, getRecipesByAuthor, getPublicUserRecipes, toggleRecipeLike, incrementRecipeViews } from '@/models/UserRecipe';
import { addAdminRecipe, getAdminById } from '@/models/Admin';
import { findUserById } from '@/models/User';
import type { CreateUserRecipeInput, UpdateUserRecipeInput, UserRecipe } from '@/models/UserRecipe';

export interface GlobalRecipeData {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  authorType: 'user' | 'admin';
  category: string;
  cuisine?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prepTime: number;
  cookTime: number;
  totalTime: number;
  servings: number;
  ingredients: Array<{
    id: string;
    name: string;
    amount: number;
    unit: string;
    notes?: string;
  }>;
  instructions: Array<{
    id: string;
    stepNumber: number;
    instruction: string;
    time?: number;
    temperature?: number;
  }>;
  dietaryTags: string[];
  allergens: string[];
  customTags: string[];
  images: Array<{
    id: string;
    url: string;
    alt?: string;
    isPrimary: boolean;
    caption?: string;
  }>;
  primaryImageUrl?: string;
  source?: string;
  isOriginal: boolean;
  isPublic: boolean;
  status: 'draft' | 'published' | 'under-review' | 'approved' | 'rejected';
  views: number;
  likes: number;
  saves: number;
  averageRating: number;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeSearchFilters {
  category?: string;
  dietary?: string[];
  difficulty?: string;
  cuisine?: string;
  search?: string;
  authorType?: 'user' | 'admin' | 'all';
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'popular' | 'rating';
}

export interface RecipeUploadInput {
  title: string;
  description: string;
  ingredients: Array<{
    id: string;
    name: string;
    amount: number;
    unit: string;
    notes?: string;
  }>;
  instructions: Array<{
    id: string;
    stepNumber: number;
    instruction: string;
    time?: number;
    temperature?: number;
  }>;
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  cuisine?: string;
  dietaryTags: string[];
  allergens: string[];
  customTags: string[];
  images: Array<{
    id: string;
    url: string;
    alt?: string;
    isPrimary: boolean;
    caption?: string;
  }>;
  primaryImageUrl?: string;
  source?: string;
  isOriginal: boolean;
  isPublic: boolean;
  authorId: string;
  authorType: 'user' | 'admin';
}

/**
 * Creates a new recipe (user or admin)
 */
export async function createGlobalRecipe(recipeData: RecipeUploadInput): Promise<GlobalRecipeData> {
  try {
    // Get author details
    const author = recipeData.authorType === 'admin' 
      ? await getAdminById(recipeData.authorId)
      : await findUserById(recipeData.authorId);
    
    if (!author) {
      throw new Error('Author not found');
    }

    // Create recipe in UserRecipes collection
    const userRecipeInput: CreateUserRecipeInput = {
      authorId: recipeData.authorId,
      authorType: recipeData.authorType,
      authorName: author.name,
      title: recipeData.title,
      description: recipeData.description,
      ingredients: recipeData.ingredients,
      instructions: recipeData.instructions,
      servings: recipeData.servings,
      prepTime: recipeData.prepTime,
      cookTime: recipeData.cookTime,
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
    };

    const newRecipe = await createUserRecipe(userRecipeInput);

    // If admin recipe, track in admin model
    if (recipeData.authorType === 'admin') {
      await addAdminRecipe(recipeData.authorId, newRecipe._id.toString());
    }

    return transformToGlobalRecipe(newRecipe);
  } catch (error) {
    console.error('Error creating global recipe:', error);
    throw new Error('Failed to create recipe');
  }
}

/**
 * Gets a recipe by ID
 */
export async function getGlobalRecipeById(id: string): Promise<GlobalRecipeData | null> {
  try {
    const recipe = await getUserRecipeById(id);
    
    if (!recipe) {
      return null;
    }

    return transformToGlobalRecipe(recipe);
  } catch (error) {
    console.error('Error getting global recipe by ID:', error);
    return null;
  }
}

/**
 * Updates a recipe
 */
export async function updateGlobalRecipe(id: string, updateData: Partial<RecipeUploadInput>): Promise<GlobalRecipeData | null> {
  try {
    const userRecipeUpdate: UpdateUserRecipeInput = {
      title: updateData.title,
      description: updateData.description,
      ingredients: updateData.ingredients,
      instructions: updateData.instructions,
      servings: updateData.servings,
      prepTime: updateData.prepTime,
      cookTime: updateData.cookTime,
      difficulty: updateData.difficulty,
      category: updateData.category,
      cuisine: updateData.cuisine,
      dietaryTags: updateData.dietaryTags,
      allergens: updateData.allergens,
      customTags: updateData.customTags,
      images: updateData.images,
      primaryImageUrl: updateData.primaryImageUrl,
      source: updateData.source,
      isOriginal: updateData.isOriginal,
      isPublic: updateData.isPublic,
    };

    const updatedRecipe = await updateUserRecipe(id, userRecipeUpdate);
    
    if (!updatedRecipe) {
      return null;
    }

    return transformToGlobalRecipe(updatedRecipe);
  } catch (error) {
    console.error('Error updating global recipe:', error);
    return null;
  }
}

/**
 * Deletes a recipe
 */
export async function deleteGlobalRecipe(id: string): Promise<boolean> {
  try {
    return await deleteUserRecipe(id);
  } catch (error) {
    console.error('Error deleting global recipe:', error);
    return false;
  }
}

/**
 * Gets recipes by author (user or admin)
 */
export async function getRecipesByGlobalAuthor(authorId: string, authorType: 'user' | 'admin', page = 1, limit = 20) {
  try {
    const result = await getRecipesByAuthor(authorId, authorType, page, limit);
    
    return {
      recipes: result.recipes.map(transformToGlobalRecipe),
      pagination: result.pagination,
    };
  } catch (error) {
    console.error('Error getting recipes by global author:', error);
    throw new Error('Failed to fetch recipes');
  }
}

/**
 * Searches public recipes with advanced filters
 */
export async function searchGlobalRecipes(filters: RecipeSearchFilters = {}) {
  try {
    // For now, only search user recipes (can be extended to include multiple sources)
    const result = await getPublicUserRecipes({
      category: filters.category,
      dietary: filters.dietary,
      difficulty: filters.difficulty,
      cuisine: filters.cuisine,
      search: filters.search,
      page: filters.page,
      limit: filters.limit,
      sortBy: filters.sortBy,
    });
    
    return {
      recipes: result.recipes.map(transformToGlobalRecipe),
      pagination: result.pagination,
    };
  } catch (error) {
    console.error('Error searching global recipes:', error);
    throw new Error('Failed to search recipes');
  }
}

/**
 * Toggles like on a recipe
 */
export async function toggleGlobalRecipeLike(recipeId: string, userId: string): Promise<boolean> {
  try {
    return await toggleRecipeLike(recipeId, userId);
  } catch (error) {
    console.error('Error toggling global recipe like:', error);
    return false;
  }
}

/**
 * Increments view count for a recipe
 */
export async function incrementGlobalRecipeViews(recipeId: string): Promise<boolean> {
  try {
    return await incrementRecipeViews(recipeId);
  } catch (error) {
    console.error('Error incrementing global recipe views:', error);
    return false;
  }
}

/**
 * Gets recipe statistics for admin dashboard
 */
export async function getGlobalRecipeStatistics() {
  try {
    // This would aggregate statistics from both user and admin recipes
    // For now, placeholder implementation
    return {
      totalRecipes: 0,
      publishedRecipes: 0,
      pendingRecipes: 0,
      adminRecipes: 0,
      userRecipes: 0,
      totalViews: 0,
      totalLikes: 0,
    };
  } catch (error) {
    console.error('Error getting global recipe statistics:', error);
    return null;
  }
}

/**
 * Validates recipe data before upload
 */
export function validateRecipeData(recipeData: Partial<RecipeUploadInput>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!recipeData.title?.trim()) {
    errors.push('Titel ist erforderlich');
  } else if (recipeData.title.length < 3) {
    errors.push('Titel muss mindestens 3 Zeichen lang sein');
  }

  if (!recipeData.description?.trim()) {
    errors.push('Beschreibung ist erforderlich');
  } else if (recipeData.description.length < 10) {
    errors.push('Beschreibung muss mindestens 10 Zeichen lang sein');
  }

  if (!recipeData.ingredients?.length || recipeData.ingredients.length < 2) {
    errors.push('Mindestens 2 Zutaten sind erforderlich');
  }

  if (!recipeData.instructions?.length || recipeData.instructions.length < 2) {
    errors.push('Mindestens 2 Anweisungen sind erforderlich');
  }

  if (!recipeData.category) {
    errors.push('Kategorie ist erforderlich');
  }

  if (!recipeData.servings || recipeData.servings < 1) {
    errors.push('Anzahl der Portionen muss mindestens 1 sein');
  }

  if (!recipeData.prepTime || recipeData.prepTime < 0) {
    errors.push('Vorbereitungszeit muss eine positive Zahl sein');
  }

  if (!recipeData.cookTime || recipeData.cookTime < 0) {
    errors.push('Kochzeit muss eine positive Zahl sein');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Transforms UserRecipe to GlobalRecipeData
 */
function transformToGlobalRecipe(userRecipe: UserRecipe): GlobalRecipeData {
  return {
    id: userRecipe._id.toString(),
    title: userRecipe.title,
    description: userRecipe.description,
    authorId: userRecipe.authorId.toString(),
    authorName: userRecipe.authorName,
    authorType: userRecipe.authorType,
    category: userRecipe.category,
    cuisine: userRecipe.cuisine,
    difficulty: userRecipe.difficulty,
    prepTime: userRecipe.prepTime,
    cookTime: userRecipe.cookTime,
    totalTime: userRecipe.totalTime,
    servings: userRecipe.servings,
    ingredients: userRecipe.ingredients,
    instructions: userRecipe.instructions,
    dietaryTags: userRecipe.dietaryTags,
    allergens: userRecipe.allergens,
    customTags: userRecipe.customTags,
    images: userRecipe.images,
    primaryImageUrl: userRecipe.primaryImageUrl,
    source: userRecipe.source,
    isOriginal: userRecipe.isOriginal,
    isPublic: userRecipe.isPublic,
    status: userRecipe.status,
    views: userRecipe.views,
    likes: userRecipe.likes,
    saves: userRecipe.saves,
    averageRating: userRecipe.averageRating,
    slug: userRecipe.slug,
    createdAt: userRecipe.createdAt,
    updatedAt: userRecipe.updatedAt,
  };
}

/**
 * Gets available categories for recipes
 */
export function getRecipeCategories() {
  return [
    { value: 'breakfast', label: 'Frühstück', icon: '🌅' },
    { value: 'lunch', label: 'Mittagessen', icon: '🥗' },
    { value: 'dinner', label: 'Abendessen', icon: '🍽️' },
    { value: 'dessert', label: 'Dessert', icon: '🍰' },
    { value: 'snack', label: 'Snack', icon: '🍿' },
    { value: 'appetizer', label: 'Vorspeise', icon: '🥙' },
    { value: 'beverage', label: 'Getränke', icon: '🥤' },
  ];
}

/**
 * Gets available dietary tags
 */
export function getDietaryTags() {
  return [
    'Vegetarisch', 'Vegan', 'Glutenfrei', 'Laktosefrei', 'Nussfrei',
    'Sojafrei', 'Zuckerfrei', 'Low-Carb', 'Keto', 'Paleo', 'Vollkorn'
  ];
}

/**
 * Gets available allergen options
 */
export function getAllergenOptions() {
  return [
    'Nüsse', 'Erdnüsse', 'Milchprodukte', 'Eier', 'Soja', 
    'Weizen/Gluten', 'Fisch', 'Meeresfrüchte', 'Sesam', 'Sulfite'
  ];
}