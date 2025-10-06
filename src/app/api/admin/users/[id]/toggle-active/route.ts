import { NextResponse } from 'next/server';
import { getCollection, COLLECTIONS, toObjectId } from '@/lib/db';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const usersCollection = await getCollection(COLLECTIONS.USERS);
    const user = await usersCollection.findOne({ _id: toObjectId(params.id) });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    const isActive = user.isActive === false ? true : false;
    await usersCollection.updateOne(
      { _id: toObjectId(params.id) },
      { $set: { isActive, updatedAt: new Date() } }
    );
    return NextResponse.json({ success: true, isActive });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to toggle active' }, { status: 500 });
  }
}
