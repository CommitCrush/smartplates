/**
 * Reset Password API Route
 * Handles password reset with token validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCollection, COLLECTIONS } from '@/lib/db';
import { updateUser } from '@/models/User';
import { hashPassword } from '@/utils/password';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Reset-Token und neues Passwort sind erforderlich' 
        },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Passwort muss mindestens 6 Zeichen lang sein' 
        },
        { status: 400 }
      );
    }

    // Find user with this reset token
    const usersCollection = await getCollection(COLLECTIONS.USERS);
    
    const user = await usersCollection.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() } // Token not expired
    });

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Reset-Token ist ungültig oder abgelaufen' 
        },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update user with new password and remove reset token
    await updateUser(user._id, {
      password: hashedPassword,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Passwort wurde erfolgreich zurückgesetzt',
    });

  } catch (error) {
    console.error('Reset password error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Fehler beim Zurücksetzen des Passworts. Bitte versuchen Sie es erneut.' 
      },
      { status: 500 }
    );
  }
}