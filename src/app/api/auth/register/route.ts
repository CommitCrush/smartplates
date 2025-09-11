/**
 * Register API Route
 * Handles user registration with email/password and MongoDB storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { createUser, findUserByEmail } from '@/models/User';
import { generateToken } from '@/utils/generateToken';

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

    // Create user in MongoDB
    const newUser = await createUser({
      name: name.trim(),
      email: email.toLowerCase(),
      password: password, // Will be hashed in createUser function
      role: 'user',
    });

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
        message: 'Registration successful',
        user: userData,
        token: token
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
