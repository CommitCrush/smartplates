/**
 * Admin Users API Route - Mock Data Implementation
 * 
 * Provides mock user data for admin management.
 * In a real implementation, this would query the MongoDB users collection.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/authMiddleware';

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
    // Mock users data - In real app, this would come from MongoDB
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
      {
        id: '2',
        name: 'Rozen Developer',
        email: 'rozen@gmail.com',
        role: 'admin',
        isEmailVerified: true,
        createdAt: '2025-09-02T11:00:00Z',
        lastLoginAt: '2025-09-11T12:15:00Z',
        savedRecipes: 15,
        createdRecipes: 12,
      },
      {
        id: '3',
        name: 'Monika Backend',
        email: 'monika@gmail.com',
        role: 'admin',
        isEmailVerified: true,
        createdAt: '2025-09-03T09:30:00Z',
        lastLoginAt: '2025-09-10T16:45:00Z',
        savedRecipes: 31,
        createdRecipes: 5,
      },
      {
        id: '4',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'user',
        isEmailVerified: true,
        createdAt: '2025-09-05T14:20:00Z',
        lastLoginAt: '2025-09-11T09:00:00Z',
        savedRecipes: 42,
        createdRecipes: 3,
      },
      {
        id: '5',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'user',
        isEmailVerified: false,
        createdAt: '2025-09-07T16:45:00Z',
        lastLoginAt: '2025-09-09T13:20:00Z',
        savedRecipes: 18,
        createdRecipes: 1,
      },
      {
        id: '6',
        name: 'Mike Johnson',
        email: 'mike.j@example.com',
        role: 'user',
        isEmailVerified: true,
        createdAt: '2025-09-08T11:10:00Z',
        lastLoginAt: '2025-09-11T11:30:00Z',
        savedRecipes: 7,
        createdRecipes: 0,
      },
    ];

    return NextResponse.json({
      success: true,
      data: mockUsers,
      total: mockUsers.length,
      timestamp: new Date().toISOString(),
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

// Protected route - Admin only
export const GET = withAuth(getUsersHandler, true);
