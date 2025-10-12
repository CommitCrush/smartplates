
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { findUserByEmail } from '@/models/User';
import { deleteSavedListById } from '@/models/SavedGroceryList';
import { connectToDatabase } from '@/lib/db';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await findUserByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const listId = params.id;
    if (!listId) {
      return NextResponse.json({ message: 'List ID is required' }, { status: 400 });
    }

    const wasDeleted = await deleteSavedListById(listId, user._id);

    if (wasDeleted) {
      return NextResponse.json({ message: 'List deleted successfully' }, { status: 200 });
    } else {
      // This could mean the list was not found or didn't belong to the user
      return NextResponse.json({ message: 'List not found or you do not have permission to delete it' }, { status: 404 });
    }

  } catch (error) {
    console.error(`[API /saved-grocery-lists/${params.id} DELETE]`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}
