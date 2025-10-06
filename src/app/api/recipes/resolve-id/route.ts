import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, COLLECTIONS } from '@/lib/db';

// POST { id: string } -> { mongoId: string, source: 'mongo'|'spoonacular'|'preloaded'|'unknown' }
export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    const recipes = db.collection(COLLECTIONS.RECIPES);

    // If already an ObjectId-like string, try direct lookup
    try {
      const { ObjectId } = await import('mongodb');
      if (ObjectId.isValid(id)) {
        const found = await recipes.findOne({ _id: new ObjectId(id) });
        if (found) {
          return NextResponse.json({ mongoId: String(found._id), source: 'mongo' });
        }
      }
    } catch {}

    // If spoonacular ID, try to find by spoonacularId stored in Mongo recipe model
    const numeric = /^[0-9]+$/.test(id) ? parseInt(id, 10) : null;
    if (numeric != null) {
      const foundBySpoon = await recipes.findOne({ spoonacularId: numeric });
      if (foundBySpoon) {
        return NextResponse.json({ mongoId: String(foundBySpoon._id), source: 'mongo' });
      }
      // Otherwise indicate that it is a spoonacular ID
      return NextResponse.json({ mongoId: `spoonacular-${id}`, source: 'spoonacular' });
    }

    if (typeof id === 'string' && id.startsWith('spoonacular-')) {
      const base = id.replace('spoonacular-', '');
      const n = /^[0-9]+$/.test(base) ? parseInt(base, 10) : null;
      if (n != null) {
        const foundBySpoon = await recipes.findOne({ spoonacularId: n });
        if (foundBySpoon) {
          return NextResponse.json({ mongoId: String(foundBySpoon._id), source: 'mongo' });
        }
      }
      return NextResponse.json({ mongoId: id, source: 'spoonacular' });
    }

    if (typeof id === 'string' && id.startsWith('preloaded-')) {
      return NextResponse.json({ mongoId: id, source: 'preloaded' });
    }

    // Last try: maybe the recipe was stored with a string id field
    const foundByStringId = await recipes.findOne({ id });
    if (foundByStringId) {
      return NextResponse.json({ mongoId: String(foundByStringId._id), source: 'mongo' });
    }

    return NextResponse.json({ mongoId: id, source: 'unknown' });
  } catch (error) {
    console.error('resolve-id error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
