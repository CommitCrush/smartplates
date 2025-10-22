import { NextResponse } from 'next/server';
import { getCollection, COLLECTIONS, toObjectId } from '@/lib/db';
import { sendPasswordResetEmail } from '@/services/emailService';

/**
 * POST /api/admin/users/[id]/reset-password
 * Sends a password reset email to a user by ID
 */
export async function POST(request: Request) {
  try {
    // ID aus der URL extrahieren
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop(); // letzte Segment = [id]

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const usersCollection = await getCollection(COLLECTIONS.USERS);

    const user = await usersCollection.findOne({ _id: toObjectId(id) });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Passwort-Reset-Mail senden (nur E-Mail übergeben)
    await sendPasswordResetEmail(user.email);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send reset email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send reset email' },
      { status: 500 }
    );
  }
}
