import { NextResponse } from 'next/server';
import { getCollection, COLLECTIONS, toObjectId } from '@/lib/db';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const usersCollection = await getCollection(COLLECTIONS.USERS);
    const user = await usersCollection.findOne({ _id: toObjectId(id) });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    const isActive = user.isActive === false ? true : false;
    await usersCollection.updateOne(
      { _id: toObjectId(id) },
      { $set: { isActive, updatedAt: new Date() } }
    );
    return NextResponse.json({ success: true, isActive });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to toggle active' }, { status: 500 });
  }
}
