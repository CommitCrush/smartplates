
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { findUserByEmail } from '@/models/User';
import { findGroceryListByUserId, createOrUpdateGroceryList } from '@/models/GroceryList';
import { connectToDatabase } from '@/lib/db';

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

    const { ingredients } = await req.json();

    // Use the new native MongoDB function
    const updatedList = await createOrUpdateGroceryList(user._id, ingredients);

    return NextResponse.json(updatedList, { status: 200 });
  } catch (error) {
    console.error('[API /grocery-list POST]', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}

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

    // Use the new native MongoDB function
    const groceryList = await findGroceryListByUserId(user._id);

    if (!groceryList) {
      // If no list is found, it's not an error. Return an empty list.
      return NextResponse.json({ ingredients: [] }, { status: 200 });
    }

    return NextResponse.json(groceryList, { status: 200 });
  } catch (error) {
    console.error('[API /grocery-list GET]', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}
