/**
 * Admin Users API Route - Mock Data Implementation
 * 
 * Provides mock user data for admin management.
 * In a real implementation, this would query the MongoDB users collection.
 */


import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/authMiddleware';
import { getCollection, COLLECTIONS } from '@/lib/db';

async function getUsersHandler(request: Request): Promise<NextResponse> {
  try {
    // Echte Userdaten aus MongoDB holen
    const usersCollection = await getCollection(COLLECTIONS.USERS);
    const users = await usersCollection.find({}).toArray();

    // Optional: Felder für die Admin-Ansicht anpassen/filtern
    const mappedUsers = users.map((user) => ({
      id: user._id?.toString() ?? '',
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isActive: typeof user.isActive === 'boolean' ? user.isActive : true, // fallback: true
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt || user.updatedAt || user.createdAt,
      savedRecipes: user.savedRecipes?.length || 0,
      createdRecipes: user.createdRecipes?.length || 0,
      avatar: user.avatar || '',
    }));

    return NextResponse.json({
      success: true,
      data: mappedUsers,
      total: mappedUsers.length,
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
