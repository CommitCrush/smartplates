import { NextResponse } from 'next/server';
import { getCollection, COLLECTIONS, toObjectId } from '@/lib/db';
import { UpdateUserInput } from '@/types/user';

// Hilfsfunktion, um die ID aus der URL zu holen
function getIdFromRequest(request: Request) {
  const url = new URL(request.url);
  return url.pathname.split('/').pop(); // Letztes Segment = ID
}

// GET /api/admin/users/[id] - Get user by ID
export async function GET(request: Request) {
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
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PATCH /api/admin/users/[id] - Update user by ID
export async function PATCH(request: Request) {
  try {
    const id = getIdFromRequest(request);
    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const body: UpdateUserInput = await request.json();
    const usersCollection = await getCollection(COLLECTIONS.USERS);
    const result = await usersCollection.updateOne(
      { _id: toObjectId(id) },
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
export async function DELETE(request: Request) {
  try {
    const id = getIdFromRequest(request);
    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const usersCollection = await getCollection(COLLECTIONS.USERS);
    const result = await usersCollection.deleteOne({ _id: toObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 });
  }
}
