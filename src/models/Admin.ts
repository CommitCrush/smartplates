/**
 * Admin Database Model for SmartPlates
 *
 * This file contains all database operations for Admin collection.
 * Tracks admin-specific data including uploaded recipes and activity
 */

import { ObjectId } from "mongodb";
import { getCollection, COLLECTIONS, toObjectId } from "@/lib/db";
import { hashPassword } from "@/utils/password";

export interface Admin {
  _id: ObjectId;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'super-admin';
  
  // Admin-specific fields
  adminId: string; // unique admin identifier
  department?: string; // e.g., "Content", "Technical", "Marketing"
  permissions: string[]; // granular permissions
  
  // Recipe tracking
  uploadedRecipes: ObjectId[]; // Admin-uploaded recipes
  moderatedRecipes: ObjectId[]; // User recipes moderated by this admin
  rejectedRecipes: ObjectId[]; // Rejected recipes with reasons
  
  // Activity tracking
  lastLogin?: Date;
  totalUploads: number;
  totalModerations: number;
  
  // Statistics
  statistics: {
    recipesApproved: number;
    recipesRejected: number;
    recipesUploaded: number;
    usersManaged: number;
  };
  
  // Account status
  isActive: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAdminInput {
  email: string;
  name: string;
  avatar?: string;
  password?: string;
  role?: 'admin' | 'super-admin';
  department?: string;
  permissions?: string[];
}

export interface UpdateAdminInput {
  name?: string;
  avatar?: string;
  department?: string;
  permissions?: string[];
  isActive?: boolean;
}

/**
 * Creates a new admin in the database
 */
export async function createAdmin(adminData: CreateAdminInput): Promise<Admin> {
  try {
    const adminsCollection = await getCollection<Admin>(COLLECTIONS.ADMINS);
    
    // Hash password if provided
    let hashedPassword: string | undefined;
    if (adminData.password) {
      hashedPassword = await hashPassword(adminData.password);
    }
    
    // Generate unique admin ID
    const adminId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newAdmin: Omit<Admin, "_id"> = {
      email: adminData.email,
      name: adminData.name,
      avatar: adminData.avatar,
      role: adminData.role || "admin",
      adminId,
      department: adminData.department,
      permissions: adminData.permissions || ['recipe:upload', 'recipe:moderate'],
      
      // Initialize tracking arrays
      uploadedRecipes: [],
      moderatedRecipes: [],
      rejectedRecipes: [],
      
      // Initialize activity
      totalUploads: 0,
      totalModerations: 0,
      
      // Initialize statistics
      statistics: {
        recipesApproved: 0,
        recipesRejected: 0,
        recipesUploaded: 0,
        usersManaged: 0,
      },
      
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await adminsCollection.insertOne(newAdmin as any);
    
    return {
      ...newAdmin,
      _id: result.insertedId,
    };
  } catch (error) {
    console.error('Error creating admin:', error);
    throw new Error('Failed to create admin');
  }
}

/**
 * Finds admin by ID
 */
export async function getAdminById(id: string): Promise<Admin | null> {
  try {
    const adminsCollection = await getCollection<Admin>(COLLECTIONS.ADMINS);
    return await adminsCollection.findOne({ _id: toObjectId(id) });
  } catch (error) {
    console.error('Error getting admin by ID:', error);
    return null;
  }
}

/**
 * Finds admin by email
 */
export async function getAdminByEmail(email: string): Promise<Admin | null> {
  try {
    const adminsCollection = await getCollection<Admin>(COLLECTIONS.ADMINS);
    return await adminsCollection.findOne({ email: email.toLowerCase() });
  } catch (error) {
    console.error('Error getting admin by email:', error);
    return null;
  }
}

/**
 * Updates admin data
 */
export async function updateAdmin(id: string, updateData: UpdateAdminInput): Promise<Admin | null> {
  try {
    const adminsCollection = await getCollection<Admin>(COLLECTIONS.ADMINS);
    
    const result = await adminsCollection.findOneAndUpdate(
      { _id: toObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );
    
    return result || null;
  } catch (error) {
    console.error('Error updating admin:', error);
    return null;
  }
}

/**
 * Adds a recipe to admin's uploaded recipes
 */
export async function addAdminRecipe(adminId: string, recipeId: string): Promise<boolean> {
  try {
    const adminsCollection = await getCollection<Admin>(COLLECTIONS.ADMINS);
    
    const result = await adminsCollection.updateOne(
      { _id: toObjectId(adminId) },
      {
        $push: { uploadedRecipes: toObjectId(recipeId) },
        $inc: { 
          totalUploads: 1,
          'statistics.recipesUploaded': 1 
        },
        $set: { updatedAt: new Date() },
      }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error adding admin recipe:', error);
    return false;
  }
}

/**
 * Records recipe moderation by admin
 */
export async function recordRecipeModeration(
  adminId: string, 
  recipeId: string, 
  action: 'approved' | 'rejected'
): Promise<boolean> {
  try {
    const adminsCollection = await getCollection<Admin>(COLLECTIONS.ADMINS);
    
    const updateFields: any = {
      $inc: { totalModerations: 1 },
      $set: { updatedAt: new Date() },
    };
    
    if (action === 'approved') {
      updateFields.$push = { moderatedRecipes: toObjectId(recipeId) };
      updateFields.$inc['statistics.recipesApproved'] = 1;
    } else {
      updateFields.$push = { rejectedRecipes: toObjectId(recipeId) };
      updateFields.$inc['statistics.recipesRejected'] = 1;
    }
    
    const result = await adminsCollection.updateOne(
      { _id: toObjectId(adminId) },
      updateFields
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error recording recipe moderation:', error);
    return false;
  }
}

/**
 * Gets admin statistics
 */
export async function getAdminStatistics(adminId: string) {
  try {
    const admin = await getAdminById(adminId);
    
    if (!admin) {
      return null;
    }
    
    return {
      totalUploads: admin.totalUploads,
      totalModerations: admin.totalModerations,
      statistics: admin.statistics,
      uploadedRecipesCount: admin.uploadedRecipes.length,
      moderatedRecipesCount: admin.moderatedRecipes.length,
      rejectedRecipesCount: admin.rejectedRecipes.length,
    };
  } catch (error) {
    console.error('Error getting admin statistics:', error);
    return null;
  }
}

/**
 * Gets all admins with pagination
 */
export async function getAllAdmins(page = 1, limit = 20) {
  try {
    const adminsCollection = await getCollection<Admin>(COLLECTIONS.ADMINS);
    
    const skip = (page - 1) * limit;
    
    const [admins, total] = await Promise.all([
      adminsCollection
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      adminsCollection.countDocuments({})
    ]);
    
    return {
      admins,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error getting all admins:', error);
    throw new Error('Failed to fetch admins');
  }
}

/**
 * Updates admin login timestamp
 */
export async function updateAdminLastLogin(adminId: string): Promise<boolean> {
  try {
    const adminsCollection = await getCollection<Admin>(COLLECTIONS.ADMINS);
    
    const result = await adminsCollection.updateOne(
      { _id: toObjectId(adminId) },
      {
        $set: {
          lastLogin: new Date(),
          updatedAt: new Date(),
        },
      }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error updating admin last login:', error);
    return false;
  }
}

/**
 * Deactivates an admin account
 */
export async function deactivateAdmin(adminId: string): Promise<boolean> {
  try {
    const adminsCollection = await getCollection<Admin>(COLLECTIONS.ADMINS);
    
    const result = await adminsCollection.updateOne(
      { _id: toObjectId(adminId) },
      {
        $set: {
          isActive: false,
          updatedAt: new Date(),
        },
      }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error deactivating admin:', error);
    return false;
  }
}