/**
 * Current User API Route
 * Returns the currently authenticated user based on custom token
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/utils/generateToken';
import { findUserById } from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No authentication token found' 
        },
        { status: 401 }
      );
    }

    // Verify custom token
    const verification = verifyToken(token);
    
    if (!verification.valid || !verification.userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid or expired token' 
        },
        { status: 401 }
      );
    }

    // Find user in database
    const user = await findUserById(verification.userId);
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found' 
        },
        { status: 404 }
      );
    }

    // Return user data (without password)
    const userData = {
      id: user._id!.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    };

    return NextResponse.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Current user API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}