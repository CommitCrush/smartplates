/**
 * Email Verification API Route
 * Handles email verification using tokens sent via Resend
 */

import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, updateUser } from '@/models/User';

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
      user: {
        email: user.email,
        name: user.name,
        isEmailVerified: true,
      }
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