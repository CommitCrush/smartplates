/**
 * Category Database Operations
 * 
 * Diese Datei enthält alle CRUD-Operationen für Kategorien.
 * Teil der Database & API Foundation.
 */

import { connectToDatabase, COLLECTIONS } from '@/lib/db';
import { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api';
import { ObjectId } from 'mongodb';

// Basis-Interface für Kategorien
interface BasicCategory {
  _id?: string;
  name: string;
  description: string;
  imageUrl?: string;
  recipeCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Erstellt eine neue Kategorie in der Datenbank
 */
export async function createCategory(categoryData: {
  name: string;
  description: string;
  imageUrl?: string;
}): Promise<ApiResponse<BasicCategory>> {
  try {
    const database = await connectToDatabase();
    const categoriesCollection = database.collection(COLLECTIONS.CATEGORIES);
    
    // Prüfen ob Kategorie bereits existiert
    const existingCategory = await categoriesCollection.findOne({ 
      name: { $regex: new RegExp(`^${categoryData.name}$`, 'i') } 
    });
    
    if (existingCategory) {
      return {
        success: false,
        error: 'Eine Kategorie mit diesem Namen existiert bereits'
      };
    }
    
    const newCategory = {
      ...categoryData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await categoriesCollection.insertOne(newCategory);
    
    return {
      success: true,
      data: { ...newCategory, _id: result.insertedId.toString() } as BasicCategory,
      message: 'Kategorie erfolgreich erstellt'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fehler beim Erstellen der Kategorie'
    };
  }
}

/**
 * Findet eine Kategorie anhand ihrer ID
 */
export async function findCategoryById(categoryId: string): Promise<ApiResponse<BasicCategory>> {
  try {
    const database = await connectToDatabase();
    const categoriesCollection = database.collection(COLLECTIONS.CATEGORIES);
    
    if (!ObjectId.isValid(categoryId)) {
      return {
        success: false,
        error: 'Ungültige Kategorie-ID'
      };
    }
    
    const category = await categoriesCollection.findOne({ _id: new ObjectId(categoryId) });
    
    if (!category) {
      return {
        success: false,
        error: 'Kategorie nicht gefunden'
      };
    }
    
    // Anzahl der Rezepte in dieser Kategorie zählen
    const recipesCollection = database.collection(COLLECTIONS.RECIPES);
    const recipeCount = await recipesCollection.countDocuments({ 
      categories: categoryId 
    });
    
    return {
      success: true,
      data: { 
        ...category, 
        _id: category._id.toString(),
        recipeCount 
      } as BasicCategory,
      message: 'Kategorie gefunden'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fehler beim Suchen der Kategorie'
    };
  }
}

/**
 * Findet alle Kategorien mit Paginierung
 */
export async function findAllCategories(
  paginationOptions: PaginationParams = {}
): Promise<PaginatedResponse<BasicCategory>> {
  try {
    const database = await connectToDatabase();
    const categoriesCollection = database.collection(COLLECTIONS.CATEGORIES);
    const recipesCollection = database.collection(COLLECTIONS.RECIPES);
    
    const currentPage = paginationOptions.page || 1;
    const itemsPerPage = Math.min(paginationOptions.limit || 20, 50);
    const skipItems = (currentPage - 1) * itemsPerPage;
    
    const [categories, totalCategories] = await Promise.all([
      categoriesCollection
        .find({})
        .sort({ name: 1 }) // Alphabetisch sortieren
        .skip(skipItems)
        .limit(itemsPerPage)
        .toArray(),
      categoriesCollection.countDocuments({})
    ]);
    
    // Rezeptanzahl für jede Kategorie ermitteln
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const recipeCount = await recipesCollection.countDocuments({
          categories: category._id.toString()
        });
        
        return {
          ...category,
          _id: category._id.toString(),
          recipeCount
        } as BasicCategory;
      })
    );
    
    const totalPages = Math.ceil(totalCategories / itemsPerPage);
    
    return {
      success: true,
      data: categoriesWithCounts,
      pagination: {
        currentPage,
        totalPages,
        totalItems: totalCategories,
        itemsPerPage
      }
    };
  } catch (error) {
    console.error('Fehler beim Laden der Kategorien:', error);
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
 * Aktualisiert eine Kategorie
 */
export async function updateCategory(
  categoryId: string,
  updateData: Partial<BasicCategory>
): Promise<ApiResponse<BasicCategory>> {
  try {
    const database = await connectToDatabase();
    const categoriesCollection = database.collection(COLLECTIONS.CATEGORIES);
    
    if (!ObjectId.isValid(categoryId)) {
      return {
        success: false,
        error: 'Ungültige Kategorie-ID'
      };
    }
    
    // Prüfen ob neuer Name bereits existiert (falls Name geändert wird)
    if (updateData.name) {
      const existingCategory = await categoriesCollection.findOne({
        name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
        _id: { $ne: new ObjectId(categoryId) }
      });
      
      if (existingCategory) {
        return {
          success: false,
          error: 'Eine Kategorie mit diesem Namen existiert bereits'
        };
      }
    }
    
    const dataWithTimestamp = {
      ...updateData,
      updatedAt: new Date()
    };
    
    const result = await categoriesCollection.findOneAndUpdate(
      { _id: new ObjectId(categoryId) },
      { $set: dataWithTimestamp },
      { returnDocument: 'after' }
    );
    
    if (!result || !result.value) {
      return {
        success: false,
        error: 'Kategorie nicht gefunden'
      };
    }
    
    return {
      success: true,
      data: { ...result.value, _id: result.value._id.toString() } as BasicCategory,
      message: 'Kategorie erfolgreich aktualisiert'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fehler beim Aktualisieren der Kategorie'
    };
  }
}

/**
 * Löscht eine Kategorie
 */
export async function deleteCategory(categoryId: string): Promise<ApiResponse<null>> {
  try {
    const database = await connectToDatabase();
    const categoriesCollection = database.collection(COLLECTIONS.CATEGORIES);
    const recipesCollection = database.collection(COLLECTIONS.RECIPES);
    
    if (!ObjectId.isValid(categoryId)) {
      return {
        success: false,
        error: 'Ungültige Kategorie-ID'
      };
    }
    
    // Prüfen ob Kategorie in Rezepten verwendet wird
    const recipesUsingCategory = await recipesCollection.countDocuments({
      categories: categoryId
    });
    
    if (recipesUsingCategory > 0) {
      return {
        success: false,
        error: `Kategorie kann nicht gelöscht werden. Sie wird noch in ${recipesUsingCategory} Rezept(en) verwendet.`
      };
    }
    
    const result = await categoriesCollection.deleteOne({ _id: new ObjectId(categoryId) });
    
    if (result.deletedCount === 0) {
      return {
        success: false,
        error: 'Kategorie nicht gefunden'
      };
    }
    
    return {
      success: true,
      data: null,
      message: 'Kategorie erfolgreich gelöscht'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fehler beim Löschen der Kategorie'
    };
  }
}

/**
 * Sucht Kategorien nach Name
 */
export async function searchCategories(
  searchQuery: string,
  paginationOptions: PaginationParams = {}
): Promise<PaginatedResponse<BasicCategory>> {
  try {
    const database = await connectToDatabase();
    const categoriesCollection = database.collection(COLLECTIONS.CATEGORIES);
    
    const currentPage = paginationOptions.page || 1;
    const itemsPerPage = Math.min(paginationOptions.limit || 20, 50);
    const skipItems = (currentPage - 1) * itemsPerPage;
    
    // Text-Suche in name und description
    const searchFilter = {
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ]
    };
    
    const [categories, totalCategories] = await Promise.all([
      categoriesCollection
        .find(searchFilter)
        .sort({ name: 1 })
        .skip(skipItems)
        .limit(itemsPerPage)
        .toArray(),
      categoriesCollection.countDocuments(searchFilter)
    ]);
    
    const totalPages = Math.ceil(totalCategories / itemsPerPage);
    
    const categoriesWithStringIds = categories.map(category => ({
      ...category,
      _id: category._id.toString()
    })) as BasicCategory[];
    
    return {
      success: true,
      data: categoriesWithStringIds,
      pagination: {
        currentPage,
        totalPages,
        totalItems: totalCategories,
        itemsPerPage
      }
    };
  } catch (error) {
    console.error('Fehler bei der Kategoriensuche:', error);
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
 * Findet Kategorie nach Name
 */
export async function findCategoryByName(name: string): Promise<ApiResponse<BasicCategory>> {
  try {
    const database = await connectToDatabase();
    const categoriesCollection = database.collection(COLLECTIONS.CATEGORIES);
    
    const category = await categoriesCollection.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    
    if (!category) {
      return {
        success: false,
        error: 'Kategorie mit diesem Namen nicht gefunden'
      };
    }
    
    return {
      success: true,
      data: { ...category, _id: category._id.toString() } as BasicCategory,
      message: 'Kategorie gefunden'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fehler beim Suchen der Kategorie'
    };
  }
}
