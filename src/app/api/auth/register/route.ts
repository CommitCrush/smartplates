/**
 * Register API Route
 * Handles user registration with email/password and MongoDB storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { createUser, findUserByEmail, generateEmailVerificationToken } from '@/models/User';
import { shouldBeAdmin, isTeamMember } from '@/config/team';
import { sendEmailVerification } from '@/services/emailService';
import { toObjectId } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, confirmPassword } = body;

    console.log('🔥 REGISTER API: Starting registration for:', email);

    // Input validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Confirm password validation
    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Determine user role and verification status
    const userRole = shouldBeAdmin(email) ? 'admin' : 'user';
    const isTeamMemberEmail = isTeamMember(email);
    
    console.log('🔥 REGISTER API: User role determined:', { 
      email, 
      userRole, 
      isTeamMemberEmail 
    });

    // Create user with appropriate verification status
    const newUser = await createUser({
      name: name.trim(),
      email: email.toLowerCase(),
      password: password,
      role: userRole,
      isEmailVerified: isTeamMemberEmail, // ✅ Team members auto-verified
    });

    console.log('🔥 REGISTER API: User created successfully:', {
      id: newUser._id?.toString(),
      email: newUser.email,
      isEmailVerified: newUser.isEmailVerified
    });

    // Handle email verification
    let emailSent = false;
    let verificationMessage = '';

    if (isTeamMemberEmail) {
      // Team member - no verification email needed
      verificationMessage = 'Team member account created - email automatically verified!';
      console.log('🔥 REGISTER API: Team member - skipping email verification');
    } else {
      // Regular user - send verification email
      try {
        console.log('🔥 REGISTER API: Generating verification token...');
        const verificationToken = await generateEmailVerificationToken(toObjectId(newUser._id!));
        
        console.log('🔥 REGISTER API: Sending verification email via Resend...');
        await sendEmailVerification({
          email: newUser.email,
          name: newUser.name,
          verificationToken
        });
        
        emailSent = true;
        verificationMessage = 'Registration successful! Please check your email to verify your account.';
        console.log('🔥 REGISTER API: ✅ Verification email sent successfully!');
      } catch (emailError) {
        console.error('🔥 REGISTER API: ❌ Failed to send verification email:', emailError);
        
        // Check if it's an invalid email address error
        if (emailError instanceof Error && emailError.message === 'Invalid email address') {
          verificationMessage = 'Registration failed: Please provide a valid email address.';
        } else {
          // Don't fail registration if email fails for other reasons
          verificationMessage = 'Account created, but verification email could not be sent. Please contact support.';
        }
      }
    }

    // User data to return
    const userData = {
      id: newUser._id!.toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      isEmailVerified: newUser.isEmailVerified,
      createdAt: newUser.createdAt.toISOString(),
    };

    console.log('🔥 REGISTER API: Registration completed successfully:', {
      userData,
      emailSent,
      autoVerified: isTeamMemberEmail
    });

    return NextResponse.json(
      {
        success: true,
        message: verificationMessage,
        user: userData,
        emailSent,
        autoVerified: isTeamMemberEmail
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('🔥 REGISTER API: ❌ Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
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
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
