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

    // Enhanced email validation (format + domain verification)
    try {
      // Step 1: Basic format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, error: 'Invalid email format' },
          { status: 400 }
        );
      }

      // Step 2: Enhanced email format validation
      const { validate: validateEmailFormat } = await import('email-validator');
      if (!validateEmailFormat(email)) {
        return NextResponse.json(
          { success: false, error: 'Please provide a valid email address format' },
          { status: 400 }
        );
      }

      // Step 3: Domain validation (check if domain has valid MX records)
      const domain = email.split('@')[1];
      const dns = await import('dns').then(m => m.promises);
      await dns.resolveMx(domain);
      console.log('🔥 REGISTER API: ✅ Email domain verified:', domain);
      
    } catch (emailValidationError) {
      console.error('🔥 REGISTER API: ❌ Email validation failed:', emailValidationError);
      
      // Check if it's a DNS resolution error (invalid domain)
      if (emailValidationError instanceof Error) {
        const error = emailValidationError as any; // Cast to access DNS error codes
        if (error.code === 'ENOTFOUND' || error.code === 'ENODATA' || emailValidationError.message.includes('queryMx')) {
          return NextResponse.json(
            { success: false, error: 'This email domain does not exist or cannot receive emails' },
            { status: 400 }
          );
        } else if (emailValidationError.message.includes('Invalid email')) {
          return NextResponse.json(
            { success: false, error: 'Please provide a valid email address format' },
            { status: 400 }
          );
        }
      }
      
      // For other validation errors, return generic message
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address' },
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

    // ✅ CRITICAL: For non-team members, validate email delivery BEFORE creating user
    if (!isTeamMemberEmail) {
      console.log('🔥 REGISTER API: Testing email delivery before creating user...');
      try {
        // Test email delivery by attempting to send a test verification
        const testToken = 'test-token-for-validation';
        await sendEmailVerification({
          email: email.toLowerCase(),
          name: name.trim(),
          verificationToken: testToken
        });
        console.log('🔥 REGISTER API: ✅ Email delivery validated successfully');
      } catch (emailTestError) {
        console.error('🔥 REGISTER API: ❌ Email delivery test failed:', emailTestError);
        
        // Return specific error message based on email validation failure
        if (emailTestError instanceof Error) {
          if (emailTestError.message === 'Invalid email address format') {
            return NextResponse.json(
              { success: false, error: 'Please provide a valid email address format' },
              { status: 400 }
            );
          } else if (emailTestError.message === 'Email domain does not exist or cannot receive emails') {
            return NextResponse.json(
              { success: false, error: 'This email domain does not exist or cannot receive emails' },
              { status: 400 }
            );
          } else if (emailTestError.message.includes('Invalid email')) {
            return NextResponse.json(
              { success: false, error: 'Please provide a valid email address' },
              { status: 400 }
            );
          }
        }
        
        // For other email service errors (like API issues), return generic error
        return NextResponse.json(
          { success: false, error: 'Unable to verify email address. Please try again later.' },
          { status: 500 }
        );
      }
    }

    // Create user with appropriate verification status (only after email validation passes)
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
      // Regular user - send actual verification email (we already validated it works)
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
        
        // This should rarely happen since we pre-validated email delivery
        verificationMessage = 'Account created, but verification email could not be sent. Please contact support.';
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
