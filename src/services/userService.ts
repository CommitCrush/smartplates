import { getCollection, COLLECTIONS, toObjectId } from "@/lib/db";
import { User } from "@/types/user";

export async function getUserById(id: string): Promise<User | null> {
  const usersCollection = await getCollection(COLLECTIONS.USERS);
  const user = await usersCollection.findOne({ _id: toObjectId(id) });
  return user as User | null;
}

export async function updateUser(id: string, data: Partial<User>): Promise<boolean> {
  const usersCollection = await getCollection(COLLECTIONS.USERS);
  const result = await usersCollection.updateOne(
    { _id: toObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } }
  );
  return result.modifiedCount > 0;
}
