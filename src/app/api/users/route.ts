/**
 * Users API Route - Protected
 * 
 * This demonstrates how to use authentication middleware
 * to protect API routes from unauthorized access.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, handleCors, rateLimit } from '@/middleware/authMiddleware';
import { getAllUsers, createUser } from '@/models/User';
import { CreateUserInput } from '@/types/user';

/**
 * GET /api/users
 * Gets all users (admin only)
 */
async function getUsersHandler(request: NextRequest) {
  try {
    // Handle CORS preflight
    const corsResponse = handleCors(request);
    if (corsResponse) return corsResponse;
    
    // Apply rate limiting
    const rateLimitResponse = rateLimit(request, 100, 15 * 60 * 1000);
    if (rateLimitResponse) return rateLimitResponse;
    
    // Get pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Get users from database
    const users = await getAllUsers(limit, skip);
    
    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total: users.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch users' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Creates a new user (admin only)
 */
async function createUserHandler(request: NextRequest) {
  try {
    // Handle CORS preflight
    const corsResponse = handleCors(request);
    if (corsResponse) return corsResponse;
    
    // Apply rate limiting
    const rateLimitResponse = rateLimit(request, 10, 15 * 60 * 1000);
    if (rateLimitResponse) return rateLimitResponse;
    
    // Parse request body
    const userData: CreateUserInput = await request.json();
    
    // Validate required fields
    if (!userData.email || !userData.name) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email and name are required' 
        },
        { status: 400 }
      );
    }
    
    // Create user in database
    const newUser = await createUser(userData);
    
    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create user' 
      },
      { status: 500 }
    );
  }
}

// Protect the route handlers with authentication middleware
// Both require admin role
export const GET = withAuth(getUsersHandler, true);    // Admin only
export const POST = withAuth(createUserHandler, true);  // Admin only
