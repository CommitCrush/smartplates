/**
 * Admin Users API Route - Mock Data Implementation
 * 
 * Provides mock user data for admin management.
 * In a real implementation, this would query the MongoDB users collection.
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/authMiddleware';
import { getAllUsers } from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { shouldBeAdmin } from '@/config/team';

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
  savedRecipes: number;
  createdRecipes: number;
}

async function getUsersHandler(request: Request): Promise<NextResponse> {
  try {
    // Check admin authentication using team config
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isAdmin = shouldBeAdmin(session.user.email);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Fetch real users from database
    const users = await getAllUsers(1000, 0); // Get up to 1000 users

    // Transform to expected format
    const transformedUsers: MockUser[] = users.map((user: any) => ({
      id: user._id?.toString() || user.id,
      name: user.name || 'Unknown User',
      email: user.email || '',
      role: shouldBeAdmin(user.email) ? 'admin' : 'user',
      isEmailVerified: user.emailVerified ? true : false,
      createdAt: user.createdAt || new Date().toISOString(),
      lastLoginAt: (user as any).lastLoginAt || user.createdAt || new Date().toISOString(),
      savedRecipes: (user as any).savedRecipes?.length || 0,
      createdRecipes: (user as any).createdRecipes?.length || 0,
    }));

    return NextResponse.json({
      success: true,
      data: transformedUsers,
      total: transformedUsers.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching users:', error);

    // Fallback to mock data if database fails
    const mockUsers: MockUser[] = [
      {
        id: '1',
        name: 'Esse Team',
        email: 'esse@gmail.com',
        role: 'admin',
        isEmailVerified: true,
        createdAt: '2025-09-01T10:00:00Z',
        lastLoginAt: '2025-09-11T14:30:00Z',
        savedRecipes: 23,
        createdRecipes: 8,
      },
    ];

    return NextResponse.json({
      success: true,
      data: mockUsers,
      total: mockUsers.length,
      timestamp: new Date().toISOString(),
    });
  }
}

// Protected route - Admin only
export const GET = withAuth(getUsersHandler, true);
