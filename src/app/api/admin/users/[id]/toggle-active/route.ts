import { NextResponse } from 'next/server';
import { getCollection, COLLECTIONS, toObjectId } from '@/lib/db';

function getIdFromRequest(request: Request) {
  const url = new URL(request.url);
  return url.pathname.split('/').pop(); // letztes Segment = ID
}

export async function PATCH(request: Request) {
  try {
    const id = getIdFromRequest(request);
    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const usersCollection = await getCollection(COLLECTIONS.USERS);
    const user = await usersCollection.findOne({ _id: toObjectId(id) });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const isActive = !user.isActive;
    await usersCollection.updateOne(
      { _id: toObjectId(id) },
      { $set: { isActive, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true, isActive });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to toggle active' }, { status: 500 });
  }
}
