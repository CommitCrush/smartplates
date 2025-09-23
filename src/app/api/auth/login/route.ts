/**
 * Login API Route
 * Handles user authentication with MongoDB and password verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/models/User';
import { verifyPassword } from '@/utils/password';
import { generateToken } from '@/utils/generateToken';
import { shouldBeAdmin } from '@/config/team';

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email and password are required' 
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
          error: 'Invalid email or password' 
        },
        { status: 401 }
      );
    }

    // Verify password
    if (!user.password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid authentication method' 
        },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email or password' 
        },
        { status: 401 }
      );
    }

    // Generate session token
    const token = generateToken(user._id!.toString());

    // Update user role based on team.ts configuration (in case it has changed)
    const currentRole = shouldBeAdmin(user.email) ? 'admin' : 'user';

    // User data to return (without password)
    const userData = {
      id: user._id!.toString(),
      email: user.email,
      name: user.name,
      role: currentRole, // Use dynamically determined role from team.ts
      isEmailVerified: user.isEmailVerified,
    };

    // Set HTTP-only cookie for session
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: userData,
        token: token
      },
      { status: 200 }
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
    console.error('Login API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// Handle CORS for login
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
