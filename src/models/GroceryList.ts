
import { getCollection, COLLECTIONS, toObjectId } from "@/lib/db";
import { ObjectId } from "mongodb";

// This interface can be expanded if there are more properties in a grocery list
export interface GroceryList {
  _id: ObjectId;
  userId: ObjectId;
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Finds a grocery list for a specific user.
 *
 * @param userId The ID of the user.
 * @returns The user's grocery list or null if not found.
 */
export async function findGroceryListByUserId(userId: string | ObjectId): Promise<GroceryList | null> {
  try {
    const groceryCollection = await getCollection<GroceryList>(COLLECTIONS.GROCERY_LISTS);
    const list = await groceryCollection.findOne({ userId: toObjectId(userId) });
    return list;
  } catch (error) {
    console.error("Error finding grocery list by user ID:", error);
    throw new Error("Failed to find grocery list.");
  }
}

/**
 * Creates or updates a grocery list for a user.
 * If a list exists, it adds the new ingredients. If not, it creates a new list.
 *
 * @param userId The ID of the user.
 * @param ingredients The ingredients to add.
 * @returns The created or updated grocery list.
 */
export async function createOrUpdateGroceryList(userId: string | ObjectId, ingredients: any[]): Promise<GroceryList> {
  try {
    const groceryCollection = await getCollection<GroceryList>(COLLECTIONS.GROCERY_LISTS);

    const result = await groceryCollection.findOneAndUpdate(
      { userId: toObjectId(userId) },
      {
        $push: { ingredients: { $each: ingredients } },
        $setOnInsert: { createdAt: new Date(), userId: toObjectId(userId) },
        $set: { updatedAt: new Date() }
      },
      { 
        upsert: true, // Create the document if it doesn't exist
        returnDocument: "after" // Return the updated document
      }
    );

    if (!result) {
        throw new Error("Failed to create or update grocery list.");
    }

    return result;
  } catch (error) {
    console.error("Error creating or updating grocery list:", error);
    throw error;
  }
}
