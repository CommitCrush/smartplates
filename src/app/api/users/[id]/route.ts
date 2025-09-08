/**
 * Individual User API Route - Protected
 * 
 * Handles operations on specific users by ID.
 * GET: Get user details (admin or own profile)
 * PUT: Update user (admin or own profile)
 * DELETE: Delete user (admin only)
 */

import { NextResponse } from 'next/server';
import { withAuth, handleCors, rateLimit, AuthenticatedRequest } from '@/middleware/authMiddleware';
import { findUserById, updateUser, deleteUser } from '@/models/User';
import { UpdateUserInput, User } from '@/types/user';
import { isValidObjectId } from '@/lib/db';

/**
 * GET /api/users/[id]
 * Gets user details (admin or own profile only)
 */
async function getUserHandler(request: AuthenticatedRequest, currentUser: User) {
  try {
    // Handle CORS preflight
    const corsResponse = handleCors(request);
    if (corsResponse) return corsResponse;
    
    // Apply rate limiting
    const rateLimitResponse = rateLimit(request, 100, 15 * 60 * 1000);
    if (rateLimitResponse) return rateLimitResponse;
    
    // Extract user ID from URL
    const userId = request.url.split('/').pop();
    
    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid user ID' 
        },
        { status: 400 }
      );
    }
    
    // Check permissions: admin can see any user, regular users can only see their own profile
    const isAdmin = currentUser.role === 'admin';
    const isOwnProfile = currentUser._id?.toString() === userId;
    
    if (!isAdmin && !isOwnProfile) {
      return NextResponse.json(
        { 
          success: false,
          error: 'You can only access your own profile' 
        },
        { status: 403 }
      );
    }
    
    // Get user from database
    const user = await findUserById(userId);
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'User not found' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: user
    });
    
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch user' 
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[id]
 * Updates user (admin or own profile only)
 */
async function updateUserHandler(request: AuthenticatedRequest, currentUser: User) {
  try {
    // Handle CORS preflight
    const corsResponse = handleCors(request);
    if (corsResponse) return corsResponse;
    
    // Apply rate limiting
    const rateLimitResponse = rateLimit(request, 50, 15 * 60 * 1000);
    if (rateLimitResponse) return rateLimitResponse;
    
    // Extract user ID from URL
    const userId = request.url.split('/').pop();
    
    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid user ID' 
        },
        { status: 400 }
      );
    }
    
    // Check permissions: admin can update any user, regular users can only update their own profile
    const isAdmin = currentUser.role === 'admin';
    const isOwnProfile = currentUser._id?.toString() === userId;
    
    if (!isAdmin && !isOwnProfile) {
      return NextResponse.json(
        { 
          success: false,
          error: 'You can only update your own profile' 
        },
        { status: 403 }
      );
    }
    
    // Parse request body
    const updateData: UpdateUserInput = await request.json();
    
    // Non-admin users cannot change certain fields
    if (!isAdmin) {
      // Remove admin-only fields for regular users
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (updateData as any).role;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (updateData as any).isEmailVerified;
    }
    
    // Update user in database
    const updatedUser = await updateUser(userId, updateData);
    
    if (!updatedUser) {
      return NextResponse.json(
        { 
          success: false,
          error: 'User not found' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update user' 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]
 * Deletes user (admin only)
 */
async function deleteUserHandler(request: AuthenticatedRequest, currentUser: User) {
  try {
    // Handle CORS preflight
    const corsResponse = handleCors(request);
    if (corsResponse) return corsResponse;
    
    // Apply rate limiting
    const rateLimitResponse = rateLimit(request, 10, 15 * 60 * 1000);
    if (rateLimitResponse) return rateLimitResponse;
    
    // Extract user ID from URL
    const userId = request.url.split('/').pop();
    
    if (!userId || !isValidObjectId(userId)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid user ID' 
        },
        { status: 400 }
      );
    }
    
    // Prevent users from deleting themselves
    if (currentUser._id?.toString() === userId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'You cannot delete your own account this way' 
        },
        { status: 400 }
      );
    }
    
    // Delete user from database
    const deleted = await deleteUser(userId);
    
    if (!deleted) {
      return NextResponse.json(
        { 
          success: false,
          error: 'User not found' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete user' 
      },
      { status: 500 }
    );
  }
}

// Protect the route handlers with authentication middleware
export const GET = withAuth(getUserHandler);           // User or admin
export const PUT = withAuth(updateUserHandler);        // User or admin
export const DELETE = withAuth(deleteUserHandler, true); // Admin only
