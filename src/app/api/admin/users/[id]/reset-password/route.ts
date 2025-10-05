import { NextResponse } from 'next/server';
import { getCollection, COLLECTIONS, toObjectId } from '@/lib/db';
import { sendPasswordResetEmail } from '@/services/emailService';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const usersCollection = await getCollection(COLLECTIONS.USERS);
    const user = await usersCollection.findOne({ _id: toObjectId(params.id) });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    // Sende Passwort-Reset-Link (Dummy-Implementierung)
    await sendPasswordResetEmail(user.email, user._id.toString());
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to send reset email' }, { status: 500 });
  }
}
