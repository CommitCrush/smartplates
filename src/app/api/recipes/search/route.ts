import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getCollection } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || undefined;
  const allergies = searchParams.get('allergies') || undefined;
  const time = searchParams.get('time') || undefined;
  const quick = searchParams.get('quick') === 'true';

  // Build MongoDB query
  const query: any = {};
  if (q) query.$text = { $search: q };
  if (category) query.category = category;
  if (allergies) query.allergies = allergies;
  if (time) query.time = { $lte: Number(time) };
  if (quick) query.quick = true;

  try {
    const collection = await getCollection('recipes');
    const recipes = await collection.find(query).limit(50).toArray();
    return NextResponse.json({ recipes });
  } catch (error: any) {
    return NextResponse.json({ error: 'Search failed', details: error?.message }, { status: 500 });
  }
}
