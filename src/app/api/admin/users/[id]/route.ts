import { NextResponse } from 'next/server';
import { getCollection, COLLECTIONS, toObjectId } from '@/lib/db';
import { UpdateUserInput } from '@/types/user';

// GET /api/admin/users/[id] - Get user by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const usersCollection = await getCollection(COLLECTIONS.USERS);
    const user = await usersCollection.findOne({ _id: toObjectId(params.id) });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch user' }, { status: 500 });
  }
}


// PATCH /api/admin/users/[id] - Update user by ID
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body: UpdateUserInput = await request.json();
    const usersCollection = await getCollection(COLLECTIONS.USERS);
    const result = await usersCollection.updateOne(
      { _id: toObjectId(params.id) },
      { $set: { ...body, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - Delete user by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const usersCollection = await getCollection(COLLECTIONS.USERS);
    const result = await usersCollection.deleteOne({ _id: toObjectId(params.id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 });
  }
}
