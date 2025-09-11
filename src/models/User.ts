/**
 * User Database Model for SmartPlates
 *
 * This file contains all database operations for User collection.
 * Clean, reusable functions for CRUD operations with proper error handling.
 */

import { ObjectId } from "mongodb";
import { getCollection, COLLECTIONS, toObjectId } from "@/lib/db";
import { hashPassword } from "@/utils/password";
import {
  User,
  CreateUserInput,
  UpdateUserInput,
  PublicUserProfile,
} from "@/types/user";

/**
 * Creates a new user in the database
 *
 * @param userData - User data to create
 * @returns Promise<User> - Created user with generated _id
 */
export async function createUser(userData: CreateUserInput): Promise<User> {
  try {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS);
    
    // Hash password if provided
    let hashedPassword: string | undefined;
    if (userData.password) {
      hashedPassword = await hashPassword(userData.password);
    }
    
    // Basisdaten mit Defaults
    const newUser: Omit<User, "_id"> = {
      email: userData.email,
      name: userData.name,
      avatar: userData.avatar,
      role: userData.role || "user",          // Default "user"
      isEmailVerified: false,                 // Default false
      dietaryRestrictions: userData.dietaryRestrictions || [],
      favoriteCategories: userData.favoriteCategories || [],
      savedRecipes: [],
      createdRecipes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Add password if provided
    if (hashedPassword) {
      newUser.password = hashedPassword;
    }
    
    // googleId nur setzen, wenn wirklich vorhanden
    if (userData.googleId && userData.googleId.trim() !== "") {
      newUser.googleId = userData.googleId;
    }
    
    const result = await usersCollection.insertOne(newUser);
    return { _id: result.insertedId, ...newUser };
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}
/**
 * Finds a user by their ID
 *
 * @param userId - User ID to search for
 * @returns Promise<User | null> - Found user or null if not found
 */
export async function findUserById(
  userId: string | ObjectId
): Promise<User | null> {
  try {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS);

    const user = await usersCollection.findOne({
      _id: toObjectId(userId),
    });

    return user;
  } catch (error) {
    console.error("Error finding user by ID:", error);
    throw new Error("Failed to find user");
  }
}

/**
 * Finds a user by their email address
 *
 * @param email - Email address to search for
 * @returns Promise<User | null> - Found user or null if not found
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS);

    const user = await usersCollection.findOne({
      email: email.toLowerCase(), // Case-insensitive search
    });

    return user;
  } catch (error) {
    console.error("Error finding user by email:", error);
    throw new Error("Failed to find user");
  }
}

/**
 * Finds a user by their Google ID
 *
 * @param googleId - Google OAuth ID to search for
 * @returns Promise<User | null> - Found user or null if not found
 */
export async function findUserByGoogleId(
  googleId: string
): Promise<User | null> {
  try {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS);

    const user = await usersCollection.findOne({
      googleId: googleId,
    });

    return user;
  } catch (error) {
    console.error("Error finding user by Google ID:", error);
    throw new Error("Failed to find user");
  }
}

/**
 * Updates a user's information
 *
 * @param userId - User ID to update
 * @param updateData - Data to update
 * @returns Promise<User | null> - Updated user or null if not found
 */
export async function updateUser(
  userId: string | ObjectId,
  updateData: UpdateUserInput
): Promise<User | null> {
  try {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS);

    // Add updatedAt timestamp
    const updateWithTimestamp = {
      ...updateData,
      updatedAt: new Date(),
    };

    // Update user and return the updated document
    const result = await usersCollection.findOneAndUpdate(
      { _id: toObjectId(userId) },
      { $set: updateWithTimestamp },
      { returnDocument: "after" } // Return the updated document
    );

    return result || null;
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
}

/**
 * Deletes a user from the database
 *
 * @param userId - User ID to delete
 * @returns Promise<boolean> - True if user was deleted, false if not found
 */
export async function deleteUser(userId: string | ObjectId): Promise<boolean> {
  try {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS);

    const result = await usersCollection.deleteOne({
      _id: toObjectId(userId),
    });

    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
}

/**
 * Gets all users (for admin purposes)
 *
 * @param limit - Maximum number of users to return
 * @param skip - Number of users to skip (for pagination)
 * @returns Promise<User[]> - Array of users
 */
export async function getAllUsers(
  limit: number = 50,
  skip: number = 0
): Promise<User[]> {
  try {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS);

    const users = await usersCollection
      .find({})
      .sort({ createdAt: -1 }) // Most recent first
      .limit(limit)
      .skip(skip)
      .toArray();

    return users;
  } catch (error) {
    console.error("Error getting all users:", error);
    throw new Error("Failed to get users");
  }
}

/**
 * Gets public user profile (safe for public viewing)
 *
 * @param userId - User ID to get profile for
 * @returns Promise<PublicUserProfile | null> - Public profile or null if not found
 */
export async function getPublicUserProfile(
  userId: string | ObjectId
): Promise<PublicUserProfile | null> {
  try {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS);

    const user = await usersCollection.findOne(
      { _id: toObjectId(userId) },
      {
        // Only return safe, public fields
        projection: {
          _id: 1,
          name: 1,
          avatar: 1,
          createdRecipes: 1,
          createdAt: 1,
        },
      }
    );

    return user as PublicUserProfile | null;
  } catch (error) {
    console.error("Error getting public user profile:", error);
    throw new Error("Failed to get user profile");
  }
}

/**
 * Adds a recipe to user's saved recipes
 *
 * @param userId - User ID
 * @param recipeId - Recipe ID to save
 * @returns Promise<boolean> - True if recipe was saved successfully
 */
export async function saveRecipeForUser(
  userId: string | ObjectId,
  recipeId: string | ObjectId
): Promise<boolean> {
  try {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS);

    const result = await usersCollection.updateOne(
      { _id: toObjectId(userId) },
      {
        $addToSet: { savedRecipes: toObjectId(recipeId) }, // $addToSet prevents duplicates
        $set: { updatedAt: new Date() },
      }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error saving recipe for user:", error);
    throw new Error("Failed to save recipe");
  }
}

/**
 * Removes a recipe from user's saved recipes
 *
 * @param userId - User ID
 * @param recipeId - Recipe ID to remove
 * @returns Promise<boolean> - True if recipe was removed successfully
 */
export async function removeSavedRecipeForUser(
  userId: string | ObjectId,
  recipeId: string | ObjectId
): Promise<boolean> {
  try {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS);

    const result = await usersCollection.updateOne(
      { _id: toObjectId(userId) },
      {
        $pull: { savedRecipes: toObjectId(recipeId) }, // $pull removes the item
        $set: { updatedAt: new Date() },
      }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error removing saved recipe for user:", error);
    throw new Error("Failed to remove saved recipe");
  }
}
