/**
 * Email Change Verification API Route
 * 
 * Verifies and completes email address changes
 * GET /api/auth/verify-email-change?token=...
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getCollection, COLLECTIONS } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/auth/error?error=missing_token', request.url));
    }

    // Connect to database
    await connectToDatabase();
    const usersCollection = await getCollection(COLLECTIONS.USERS);

    // Find user with this verification token
    const user = await usersCollection.findOne({
      'pendingEmailChange.verificationToken': token,
      'pendingEmailChange.expiresAt': { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.redirect(new URL('/auth/error?error=invalid_or_expired_token', request.url));
    }

    const pendingChange = user.pendingEmailChange;
    
    // Check if new email is still available
    const existingUser = await usersCollection.findOne({
      email: pendingChange.newEmail
    });

    if (existingUser) {
      return NextResponse.redirect(new URL('/auth/error?error=email_already_taken', request.url));
    }

    // Update user's email and remove pending change
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          email: pendingChange.newEmail,
          emailVerified: new Date(),
          updatedAt: new Date()
        },
        $unset: {
          pendingEmailChange: 1
        }
      }
    );

    console.log(`✅ Email changed successfully from ${user.email} to ${pendingChange.newEmail}`);

    // Redirect to success page
    return NextResponse.redirect(new URL('/auth/email-changed?success=true', request.url));

  } catch (error) {
    console.error('GET /api/auth/verify-email-change error:', error);
    return NextResponse.redirect(new URL('/auth/error?error=verification_failed', request.url));
  }
}