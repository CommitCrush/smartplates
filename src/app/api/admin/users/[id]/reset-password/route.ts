import { NextResponse } from 'next/server';
import { getCollection, COLLECTIONS, toObjectId } from '@/lib/db';
import { sendPasswordResetEmail } from '@/services/emailService';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const usersCollection = await getCollection(COLLECTIONS.USERS);
    const user = await usersCollection.findOne({ _id: toObjectId(id) });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    // Sende Passwort-Reset-Link (Dummy-Implementierung)
    await sendPasswordResetEmail({ email: user.email, resetToken: 'dummy-token', name: user.name || 'User' });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to send reset email' }, { status: 500 });
  }
}
