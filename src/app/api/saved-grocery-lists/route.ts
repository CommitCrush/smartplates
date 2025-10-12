
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { findUserByEmail } from '@/models/User';
import { saveGroceryList, findSavedListsByUserId } from '@/models/SavedGroceryList';
import { connectToDatabase } from '@/lib/db';

// POST request to save a new grocery list
export async function POST(req: NextRequest) {
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

    const { name, ingredients } = await req.json();

    if (!name || !ingredients) {
        return NextResponse.json({ message: 'Missing required fields: name and ingredients' }, { status: 400 });
    }

    const savedList = await saveGroceryList(user._id, name, ingredients);

    return NextResponse.json(savedList, { status: 201 }); // 201 for resource created

  } catch (error) {
    console.error('[API /saved-grocery-lists POST]', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}

// GET request to fetch all of a user's saved grocery lists
export async function GET(req: NextRequest) {
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

    const savedLists = await findSavedListsByUserId(user._id);

    return NextResponse.json(savedLists, { status: 200 });

  } catch (error) {
    console.error('[API /saved-grocery-lists GET]', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}
