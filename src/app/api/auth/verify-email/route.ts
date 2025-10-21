/**
 * Email Verification API Route
 * Handles email verification using tokens sent via Resend
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailToken, findUserByEmail, generateToken, updateUser } from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Verification token is required' 
        },
        { status: 400 }
      );
    }

    // Find user with this verification token
    const { getCollection, COLLECTIONS } = await import('@/lib/db');
    const usersCollection = await getCollection(COLLECTIONS.USERS);
    
    const user = await usersCollection.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() } // Token not expired
    });

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid or expired verification token' 
        },
        { status: 400 }
      );
    }

    // Update user to mark email as verified and remove token
    await updateUser(user._id, {
      isEmailVerified: true,
      emailVerificationToken: undefined,
      emailVerificationExpires: undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
    });

  } catch (error) {
    console.error('Email verification error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Verification failed. Please try again.' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    console.log('🔥 VERIFY EMAIL API: Starting verification process');
    console.log('   Token provided:', token ? token.substring(0, 8) + '...' : 'None');

    if (!token) {
      console.log('🔥 VERIFY EMAIL API: ❌ No token provided');
      return NextResponse.json(
        { success: false, message: 'Missing verification token' },
        { status: 400 }
      );
    }

    // Verify the token
    console.log('🔥 VERIFY EMAIL API: Verifying token in database...');
    const user = await verifyEmailToken(token);

    if (!user) {
      console.log('🔥 VERIFY EMAIL API: ❌ Invalid or expired token');
      return NextResponse.json(
        { success: false, message: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    console.log('🔥 VERIFY EMAIL API: ✅ Email verified successfully for:', user.email);

    // Generate JWT token for automatic login
    const jwtToken = await generateToken({
      id: user._id!.toString(),
      email: user.email,
      name: user.name,
      role: user.role
    });

    console.log('🔥 VERIFY EMAIL API: JWT token generated for auto-login');

    const response = NextResponse.json(
      {
        success: true,
        message: 'Email verified successfully! You are now logged in.',
        user: {
          id: user._id!.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          isEmailVerified: true
        },
        redirectTo: user.role === 'admin' ? '/admin' : '/user'
      },
      { status: 200 }
    );

    // Set HTTP-only cookie for authentication
    response.cookies.set('auth-token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    console.log('🔥 VERIFY EMAIL API: Auth cookie set, user will be redirected to dashboard');

    return response;

  } catch (error) {
    console.error('🔥 VERIFY EMAIL API: ❌ Verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error during verification' },
      { status: 500 }
    );
  }
}