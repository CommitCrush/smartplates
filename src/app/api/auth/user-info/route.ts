/**
 * API Route: Get User Info by Email
 * 
 * Used by LoginForm to get user information for email verification display
 */

import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await findUserByEmail(email.toLowerCase());

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user information (without sensitive data)
    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error('User info error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}