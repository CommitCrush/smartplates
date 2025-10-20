/**
 * Register API Route
 * Handles user registration with email/password and MongoDB storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { createUser, findUserByEmail, updateUser } from '@/models/User';
import { generateToken } from '@/utils/generateToken';
import { sendEmailVerification } from '@/services/emailService';
import { shouldBeAdmin } from '@/config/team';
import crypto from 'crypto';

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { name, email, password, confirmPassword } = body;

    // Input validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Name, email, and password are required' 
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

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Password must be at least 6 characters long' 
        },
        { status: 400 }
      );
    }

    // Confirm password validation
    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Passwords do not match' 
        },
        { status: 400 }
      );
    }

    // Check if user already exists in MongoDB
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User with this email already exists' 
        },
        { status: 409 }
      );
    }

    // Determine user role based on team.ts configuration
    const userRole = shouldBeAdmin(email) ? 'admin' : 'user';
    const isTeamMember = shouldBeAdmin(email);

    // Create user in MongoDB
    const newUser = await createUser({
      name: name.trim(),
      email: email.toLowerCase(),
      password: password, // Will be hashed in createUser function
      role: userRole,
    });

    // Set email verification status for team members
    if (isTeamMember) {
      await updateUser(newUser._id!, {
        isEmailVerified: true,
      });
      // Update the newUser object to reflect the change
      newUser.isEmailVerified = true;
    }

    let verificationMessage = '';

    // Only send verification email for non-team members
    if (!isTeamMember) {
      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Update user with verification token
      await updateUser(newUser._id!, {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      });

      // Send verification email
      try {
        console.log(`🔄 [REGISTER] Attempting to send verification email to: ${newUser.email}`);
        console.log(`🔗 [REGISTER] Verification token: ${verificationToken}`);
        
        await sendEmailVerification({
          email: newUser.email,
          name: newUser.name,
          verificationToken: verificationToken,
        });
        
        verificationMessage = 'Please check your email for verification.';
        console.log(`✅ [REGISTER] Verification email sent successfully to: ${newUser.email}`);
      } catch (emailError) {
        console.error('❌ [REGISTER] Failed to send verification email:', emailError);
        console.error('🔍 [REGISTER] Error details:', JSON.stringify(emailError, null, 2));
        verificationMessage = 'Registration successful, but verification email could not be sent.';
      }
    } else {
      verificationMessage = 'Team member account created - email automatically verified!';
      console.log(`[Team Registration] Admin user ${email} registered with auto-verification`);
    }

    // Generate session token
    const token = generateToken(newUser._id!.toString());

    // User data to return (without password)
    const userData = {
      id: newUser._id!.toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      isEmailVerified: newUser.isEmailVerified,
      createdAt: newUser.createdAt.toISOString(),
    };

    // Set HTTP-only cookie for session
    const response = NextResponse.json(
      {
        success: true,
        message: `Registration successful! ${verificationMessage}`,
        user: userData,
        token: token,
        autoVerified: isTeamMember
      },
      { status: 201 }
    );

    // Set session cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    return response;

  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// Handle CORS for registration
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
