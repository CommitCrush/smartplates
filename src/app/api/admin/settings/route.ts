/**
 * Admin Settings API Route
 *
 * Provides system settings management for admin panel
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { shouldBeAdmin } from '@/config/team';

// Default system settings
const defaultSettings = {
  siteName: 'SmartPlates',
  siteDescription: 'Deine intelligente Kochplattform',
  maintenanceMode: false,
  allowUserRegistration: true,
  requireEmailVerification: true,
  maxRecipesPerUser: 100,
  maxImageSize: 5,
  autoModeration: true,
  moderationKeywords: ['spam', 'fake', 'inappropriate'],
  emailNotifications: true,
  backupFrequency: 'daily',
};

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

    // For now, return default settings
    // In a real implementation, this would fetch from a database
    return NextResponse.json({ settings: defaultSettings });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request): Promise<NextResponse> {
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

    const { settings } = await request.json();

    // Validate settings
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Invalid settings data' },
        { status: 400 }
      );
    }

    // In a real implementation, this would save to a database
    // For now, just return success
    console.log('Admin settings updated:', settings);

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Error updating admin settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}