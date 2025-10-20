/**
 * Validate Reset Token API Route
 * Validates password reset tokens before allowing password reset
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCollection, COLLECTIONS } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Reset-Token ist erforderlich' 
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
      return NextResponse.json({
        valid: false,
        error: 'Reset-Token ist ungültig oder abgelaufen',
      });
    }

    return NextResponse.json({
      valid: true,
      message: 'Reset-Token ist gültig',
    });

  } catch (error) {
    console.error('Validate reset token error:', error);
    
    return NextResponse.json(
      { 
        valid: false, 
        error: 'Fehler beim Validieren des Reset-Tokens' 
      },
      { status: 500 }
    );
  }
}