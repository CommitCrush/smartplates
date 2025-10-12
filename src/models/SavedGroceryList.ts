
import { getCollection, COLLECTIONS, toObjectId } from "@/lib/db";
import { ObjectId } from "mongodb";

// Interface for a single saved grocery list
export interface SavedGroceryList {
  _id: ObjectId;
  userId: ObjectId;
  name: string; // e.g., "Shopping Trip - 2023-10-28"
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
    checked: boolean;
  }[];
  createdAt: Date;
}

/**
 * Saves a new grocery list for a user.
 *
 * @param userId The ID of the user.
 * @param name A name for the saved list.
 * @param ingredients The array of ingredients to save.
 * @returns The newly created saved list.
 */
export async function saveGroceryList(userId: string | ObjectId, name: string, ingredients: any[]): Promise<SavedGroceryList> {
  try {
    const savedListsCollection = await getCollection<SavedGroceryList>(COLLECTIONS.SAVED_GROCERY_LISTS);

    const newList: Omit<SavedGroceryList, '_id'> = {
      userId: toObjectId(userId),
      name,
      ingredients,
      createdAt: new Date(),
    };

    const result = await savedListsCollection.insertOne(newList);

    return { _id: result.insertedId, ...newList };

  } catch (error) {
    console.error("Error saving grocery list:", error);
    throw new Error("Failed to save the grocery list.");
  }
}

/**
 * Finds all saved grocery lists for a specific user, sorted by most recent.
 *
 * @param userId The ID of the user.
 * @returns An array of saved grocery lists.
 */
export async function findSavedListsByUserId(userId: string | ObjectId): Promise<SavedGroceryList[]> {
  try {
    const savedListsCollection = await getCollection<SavedGroceryList>(COLLECTIONS.SAVED_GROCERY_LISTS);
    const lists = await savedListsCollection
      .find({ userId: toObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();
    return lists;
  } catch (error) {
    console.error("Error finding saved lists by user ID:", error);
    throw new Error("Failed to find saved lists.");
  }
}

/**
 * Deletes a saved grocery list by its ID.
 *
 * @param listId The ID of the list to delete.
 * @param userId The ID of the user who owns the list, for security.
 * @returns A boolean indicating if the deletion was successful.
 */
export async function deleteSavedListById(listId: string | ObjectId, userId: string | ObjectId): Promise<boolean> {
  try {
    const savedListsCollection = await getCollection<SavedGroceryList>(COLLECTIONS.SAVED_GROCERY_LISTS);
    const result = await savedListsCollection.deleteOne({
      _id: toObjectId(listId),
      userId: toObjectId(userId), // Ensure users can only delete their own lists
    });
    return result.deletedCount === 1;
  } catch (error) {
    console.error("Error deleting saved list:", error);
    throw new Error("Failed to delete the saved list.");
  }
}
