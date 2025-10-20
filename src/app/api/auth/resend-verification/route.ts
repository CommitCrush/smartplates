/**
 * Resend Email Verification API Route
 * Handles resending email verification for existing users
 */

import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, updateUser } from '@/models/User';
import { sendEmailVerification } from '@/services/emailService';
import { generateVerificationToken } from '@/utils/generateToken';

interface ResendVerificationRequest {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ResendVerificationRequest = await request.json();
    const { email } = body;

    // Input validation
    if (!email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email is required' 
        },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email format' 
        },
        { status: 400 }
      );
    }

    // Find user in MongoDB
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found' 
        },
        { status: 404 }
      );
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email is already verified' 
        },
        { status: 400 }
      );
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new verification token
    await updateUser(user._id!.toString(), {
      emailVerificationToken: verificationToken,
      emailVerificationExpires: tokenExpiry
    });

    // Send verification email using Resend
    try {
      await sendEmailVerification({
        email: user.email,
        name: user.name,
        verificationToken: verificationToken
      });

      console.log('✅ Verification email resent successfully to:', user.email);

      return NextResponse.json(
        {
          success: true,
          message: 'Verification email sent successfully'
        },
        { status: 200 }
      );

    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError);
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to send verification email. Please try again later.' 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Resend verification API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// Handle CORS for resend verification
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}