import type { Collection, ObjectId } from 'mongodb';

let ranOnce = false;

export type DedupeSummary = {
  by: string;
  groups: number;
  removed: number;
};

async function dedupeOnField<T extends { _id: ObjectId }>(col: Collection<T>, field: 'id' | 'spoonacularId'): Promise<DedupeSummary> {
  // Find duplicate groups for the given field
  const groups = await col
    .aggregate<{ _id: string | number; ids: ObjectId[]; count: number }>([
      { $match: { [field]: { $ne: null } } as any },
      { $group: { _id: `$${field}`, ids: { $push: '$_id' }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ])
    .toArray();

  let removed = 0;
  for (const g of groups) {
    // keep the oldest document (smallest ObjectId)
    const sorted = [...g.ids].sort((a: any, b: any) => (a.toString() < b.toString() ? -1 : 1));
    const toDelete = sorted.slice(1);
    if (toDelete.length > 0) {
      const res = await col.deleteMany({ _id: { $in: toDelete } } as any);
      removed += res.deletedCount || 0;
    }
  }

  return { by: field, groups: groups.length, removed };
}

/**
 * Ensure unique indexes and dedupe existing duplicates.
 * Runs once per process to avoid repeated heavy work.
 */
export async function ensureUniqueIndexAndDedupe<T extends { _id: ObjectId }>(col: Collection<T>) {
  if (ranOnce) return;
  ranOnce = true;

  // Try to create indexes first; if they fail due to duplicates, we dedupe and retry.
  const tryCreateIndexes = async () => {
    try {
      await col.createIndex({ id: 1 }, { unique: true });
    } catch {}
    try {
      await col.createIndex({ spoonacularId: 1 }, { unique: true, sparse: true });
    } catch {}
  };

  await tryCreateIndexes();

  // Dedupe on fields, then retry index creation
  await dedupeOnField(col, 'id');
  await dedupeOnField(col, 'spoonacularId');

  await tryCreateIndexes();
}
