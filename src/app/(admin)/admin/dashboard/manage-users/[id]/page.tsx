import { getCollection, COLLECTIONS, toObjectId } from '@/lib/db';
import { notFound } from 'next/navigation';

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const userId = params.id;
  const usersCollection = await getCollection(COLLECTIONS.USERS);
  const user = await usersCollection.findOne({ _id: toObjectId(userId) });

  if (!user) return notFound();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">User Details</h1>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar || '/placeholder-avatar.svg'}
            alt={user.name}
            className="w-20 h-20 rounded-full border"
          />
          <div>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>
            <span className="inline-block mt-1 px-2 py-1 rounded bg-primary-100 text-primary-700 text-xs font-medium">
              {user.role}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Created At:</span> {user.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}
          </div>
          <div>
            <span className="font-medium">Updated At:</span> {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : '-'}
          </div>
          <div>
            <span className="font-medium">Email Verified:</span> {user.isEmailVerified ? 'Yes' : 'No'}
          </div>
          <div>
            <span className="font-medium">Google ID:</span> {user.googleId || '-'}
          </div>
        </div>
        <div>
          <span className="font-medium">Dietary Restrictions:</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {(user.dietaryRestrictions || []).length > 0
              ? user.dietaryRestrictions.map((r: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-coral-100 text-coral-700 rounded text-xs">
                    {r}
                  </span>
                ))
              : <span className="text-muted-foreground">None</span>}
          </div>
        </div>
        <div>
          <span className="font-medium">Favorite Categories:</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {(user.favoriteCategories || []).length > 0
              ? user.favoriteCategories.map((c: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                    {c}
                  </span>
                ))
              : <span className="text-muted-foreground">None</span>}
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          <div>
            <span className="font-medium">Saved Recipes:</span> {user.savedRecipes?.length || 0}
          </div>
          <div>
            <span className="font-medium">Created Recipes:</span> {user.createdRecipes?.length || 0}
          </div>
        </div>
      </div>
    </div>
  );
}