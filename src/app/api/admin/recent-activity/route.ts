/**
 * Admin Recent Activity API Route
 *
 * Provides recent system events and activities for the admin dashboard.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface ActivityEvent {
  id: string;
  type: 'user_registration' | 'recipe_created' | 'system_backup' | 'user_login' | 'api_call';
  message: string;
  timestamp: string;
  metadata?: any;
}

async function getRecentActivity(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Check if user is admin
    // For now, assume session validation is sufficient

    // Mock recent activity data - in real implementation, this would come from MongoDB
    const mockActivities: ActivityEvent[] = [
      {
        id: '1',
        type: 'user_registration',
        message: '5 new users registered',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
        metadata: { count: 5 }
      },
      {
        id: '2',
        type: 'system_backup',
        message: 'Database backup completed',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
        metadata: { success: true }
      },
      {
        id: '3',
        type: 'recipe_created',
        message: '12 new recipes added to cache',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        metadata: { count: 12 }
      },
      {
        id: '4',
        type: 'user_login',
        message: 'Admin user logged in',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        metadata: { user: 'admin' }
      },
      {
        id: '5',
        type: 'api_call',
        message: 'Spoonacular API quota check performed',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        metadata: { endpoint: 'quota' }
      },
      {
        id: '6',
        type: 'system_backup',
        message: 'System maintenance completed',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        metadata: { type: 'maintenance' }
      }
    ];

    return NextResponse.json(mockActivities);

  } catch (error) {
    console.error('❌ Admin Recent Activity: Fatal error:', error);

    // Return empty array on error
    return NextResponse.json([]);
  }
}

export async function GET() {
  return getRecentActivity();
}