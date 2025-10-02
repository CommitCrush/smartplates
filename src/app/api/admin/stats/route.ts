/**
 * Admin Stats API Route
 *
 * Provides comprehensive admin statistics for the admin settings page
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllUsers } from '@/models/User';
import { getCollection, COLLECTIONS } from '@/lib/db';
import { shouldBeAdmin } from '@/config/team';

export async function GET(): Promise<NextResponse> {
  try {
    // Check admin authentication using team config
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isAdmin = shouldBeAdmin(session.user.email);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get user statistics
    const allUsers = await getAllUsers(10000, 0); // Get all users
    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter(user => {
      // Consider users active if they logged in within the last 30 days
      const lastLogin = user.lastLoginAt || user.createdAt;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(lastLogin) > thirtyDaysAgo;
    }).length;

    // Consider users online if they logged in within the last 24 hours
    const onlineUsers = allUsers.filter(user => {
      const lastLogin = user.lastLoginAt || user.createdAt;
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      return new Date(lastLogin) > twentyFourHoursAgo;
    }).length;

    // Get recipe statistics
    const spoonacularCollection = await getCollection('spoonacular_recipes');
    const totalRecipes = await spoonacularCollection.countDocuments();
    const pendingRecipes = 0; // For now, assume no pending recipes in cache

    // Mock additional stats for the admin settings page
    const totalReviews = 0; // Would need a reviews collection
    const reportedContent = 0; // Would need a reports collection

    const stats = {
      totalUsers,
      activeUsers,
      onlineUsers,
      totalRecipes,
      pendingRecipes,
      totalReviews,
      reportedContent,
      systemUptime: '99.9%', // Mock uptime
      storageUsed: '2.3 GB', // Mock storage
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}