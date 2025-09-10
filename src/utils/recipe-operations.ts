/**
 * Recipe Database Operations
 * 
 * Diese Datei enthält alle CRUD-Operationen für Rezepte.
 * Teil der Database & API Foundation.
 */

import { connectToDatabase, COLLECTIONS } from '@/lib/db';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api';
import { ObjectId } from 'mongodb';

// Basis-Interface für Rezepte
interface BasicRecipe {
  _id?: string;
  title: string;
  description: string;
  ingredients: Array<{
    name: string;
    amount: number;
    unit: string;
    category?: string;
  }>;
  instructions: string[];
  cookingTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  categories: string[];
  imageUrl?: string;
  videoUrl?: string;
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  createdBy: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Erstellt ein neues Rezept in der Datenbank
 */
export async function createRecipe(recipeData: {
  title: string;
  description: string;
  ingredients: BasicRecipe['ingredients'];
  instructions: string[];
  cookingTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  categories: string[];
  imageUrl?: string;
  videoUrl?: string;
  nutritionInfo?: BasicRecipe['nutritionInfo'];
  createdBy: string;
  isPublic?: boolean;
}): Promise<ApiResponse<BasicRecipe>> {
  try {
    const database = await connectToDatabase();
    const recipesCollection = database.collection(COLLECTIONS.RECIPES);
    
    const newRecipe = {
      ...recipeData,
      isPublic: recipeData.isPublic ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await recipesCollection.insertOne(newRecipe);
    
    return {
      success: true,
      data: { ...newRecipe, _id: result.insertedId.toString() } as BasicRecipe,
      message: 'Rezept erfolgreich erstellt'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fehler beim Erstellen des Rezepts'
    };
  }
}

/**
 * Findet ein Rezept anhand seiner ID
 */
export async function findRecipeById(recipeId: string): Promise<ApiResponse<BasicRecipe>> {
  try {
    const database = await connectToDatabase();
    const recipesCollection = database.collection(COLLECTIONS.RECIPES);
    
    if (!ObjectId.isValid(recipeId)) {
      return {
        success: false,
        error: 'Ungültige Rezept-ID'
      };
    }
    
    const recipe = await recipesCollection.findOne({ _id: new ObjectId(recipeId) });
    
    if (!recipe) {
      return {
        success: false,
        error: 'Rezept nicht gefunden'
      };
    }
    
    return {
      success: true,
      data: { ...recipe, _id: recipe._id.toString() } as BasicRecipe,
      message: 'Rezept gefunden'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fehler beim Suchen des Rezepts'
    };
  }
}

/**
 * Findet alle Rezepte mit Paginierung und Filterung
 */
export async function findAllRecipes(
  paginationOptions: PaginationParams = {},
  filters: {
    category?: string;
    difficulty?: string;
    maxCookingTime?: number;
    isPublic?: boolean;
    createdBy?: string;
  } = {}
): Promise<PaginatedResponse<BasicRecipe>> {
  try {
    const database = await connectToDatabase();
    const recipesCollection = database.collection(COLLECTIONS.RECIPES);
    
    const currentPage = paginationOptions.page || 1;
    const itemsPerPage = Math.min(paginationOptions.limit || 10, 50);
    const skipItems = (currentPage - 1) * itemsPerPage;
    
    // Filter erstellen
    const searchFilter: Record<string, unknown> = {};
    
    if (filters.category) {
      searchFilter.categories = filters.category;
    }
    
    if (filters.difficulty) {
      searchFilter.difficulty = filters.difficulty;
    }
    
    if (filters.maxCookingTime) {
      searchFilter.cookingTime = { $lte: filters.maxCookingTime };
    }
    
    if (filters.isPublic !== undefined) {
      searchFilter.isPublic = filters.isPublic;
    }
    
    if (filters.createdBy) {
      searchFilter.createdBy = filters.createdBy;
    }
    
    const [recipes, totalRecipes] = await Promise.all([
      recipesCollection
        .find(searchFilter)
        .sort({ createdAt: -1 })
        .skip(skipItems)
        .limit(itemsPerPage)
        .toArray(),
      recipesCollection.countDocuments(searchFilter)
    ]);
    
    const totalPages = Math.ceil(totalRecipes / itemsPerPage);
    
    const recipesWithStringIds = recipes.map(recipe => ({
      ...recipe,
      _id: recipe._id.toString()
    })) as BasicRecipe[];
    
    return {
      success: true,
      data: recipesWithStringIds,
      pagination: {
        currentPage,
        totalPages,
        totalItems: totalRecipes,
        itemsPerPage
      }
    };
  } catch (error) {
    console.error('Fehler beim Laden der Rezepte:', error);
    return {
      success: false,
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10
      }
    };
  }
}

/**
 * Aktualisiert ein Rezept
 */
export async function updateRecipe(
  recipeId: string,
  updateData: Partial<BasicRecipe>
): Promise<ApiResponse<BasicRecipe>> {
  try {
    const database = await connectToDatabase();
    const recipesCollection = database.collection(COLLECTIONS.RECIPES);
    
    if (!ObjectId.isValid(recipeId)) {
      return {
        success: false,
        error: 'Ungültige Rezept-ID'
      };
    }
    
    const dataWithTimestamp = {
      ...updateData,
      updatedAt: new Date()
    };
    
    const result = await recipesCollection.findOneAndUpdate(
      { _id: new ObjectId(recipeId) },
      { $set: dataWithTimestamp },
      { returnDocument: 'after' }
    );
    
    if (!result || !result.value) {
      return {
        success: false,
        error: 'Rezept nicht gefunden'
      };
    }
    
    return {
      success: true,
      data: { ...result.value, _id: result.value._id.toString() } as BasicRecipe,
      message: 'Rezept erfolgreich aktualisiert'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fehler beim Aktualisieren des Rezepts'
    };
  }
}

/**
 * Löscht ein Rezept
 */
export async function deleteRecipe(recipeId: string): Promise<ApiResponse<null>> {
  try {
    const database = await connectToDatabase();
    const recipesCollection = database.collection(COLLECTIONS.RECIPES);
    
    if (!ObjectId.isValid(recipeId)) {
      return {
        success: false,
        error: 'Ungültige Rezept-ID'
      };
    }
    
    const result = await recipesCollection.deleteOne({ _id: new ObjectId(recipeId) });
    
    if (result.deletedCount === 0) {
      return {
        success: false,
        error: 'Rezept nicht gefunden'
      };
    }
    
    return {
      success: true,
      data: null,
      message: 'Rezept erfolgreich gelöscht'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fehler beim Löschen des Rezepts'
    };
  }
}

/**
 * Sucht Rezepte nach Text
 */
export async function searchRecipes(
  searchQuery: string,
  paginationOptions: PaginationParams = {}
): Promise<PaginatedResponse<BasicRecipe>> {
  try {
    const database = await connectToDatabase();
    const recipesCollection = database.collection(COLLECTIONS.RECIPES);
    
    const currentPage = paginationOptions.page || 1;
    const itemsPerPage = Math.min(paginationOptions.limit || 10, 50);
    const skipItems = (currentPage - 1) * itemsPerPage;
    
    // Einfache Text-Suche in title und description
    const searchFilter = {
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ]
    };
    
    const [recipes, totalRecipes] = await Promise.all([
      recipesCollection
        .find(searchFilter)
        .sort({ createdAt: -1 })
        .skip(skipItems)
        .limit(itemsPerPage)
        .toArray(),
      recipesCollection.countDocuments(searchFilter)
    ]);
    
    const totalPages = Math.ceil(totalRecipes / itemsPerPage);
    
    const recipesWithStringIds = recipes.map(recipe => ({
      ...recipe,
      _id: recipe._id.toString()
    })) as BasicRecipe[];
    
    return {
      success: true,
      data: recipesWithStringIds,
      pagination: {
        currentPage,
        totalPages,
        totalItems: totalRecipes,
        itemsPerPage
      }
    };
  } catch (error) {
    console.error('Fehler bei der Rezeptsuche:', error);
    return {
      success: false,
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10
      }
    };
  }
}
