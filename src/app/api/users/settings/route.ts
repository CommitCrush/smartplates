import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { findUserByEmail, updateUser } from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await findUserByEmail(session.user.email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user settings with defaults if not set
    const settings = {
      dietaryRestrictions: (user as any).settings?.dietaryRestrictions || user.dietaryRestrictions || [],
      allergies: (user as any).settings?.allergies || [],
      cuisinePreferences: (user as any).settings?.cuisinePreferences || user.favoriteCategories || [],
      emailNotifications: {
        recipeRecommendations: (user as any).settings?.emailNotifications?.recipeRecommendations ?? true,
        mealPlanReminders: (user as any).settings?.emailNotifications?.mealPlanReminders ?? true,
        newFeatures: (user as any).settings?.emailNotifications?.newFeatures ?? false,
        newsletter: (user as any).settings?.emailNotifications?.newsletter ?? false
      },
      privacy: {
        profileVisibility: (user as any).settings?.privacy?.profileVisibility || 'public',
        showEmail: (user as any).settings?.privacy?.showEmail ?? false,
        showLocation: (user as any).settings?.privacy?.showLocation ?? true
      },
      preferences: {
        defaultServings: (user as any).settings?.preferences?.defaultServings || 4,
        measurementUnit: (user as any).settings?.preferences?.measurementUnit || 'metric',
        theme: (user as any).settings?.preferences?.theme || 'system'
      }
    };

    return NextResponse.json(settings);

  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    const allowedFields = [
      'dietaryRestrictions',
      'allergies', 
      'cuisinePreferences',
      'emailNotifications',
      'privacy',
      'preferences'
    ];
    
    // Filter out any fields not in allowedFields
    const filteredSettings = Object.keys(body)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = body[key];
        return obj;
      }, {} as any);

    const user = await findUserByEmail(session.user.email);
    
    if (!user || !user._id) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const updatedUser = await updateUser(
      user._id,
      { 
        settings: {
          ...filteredSettings,
          updatedAt: new Date()
        }
      } as any
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Settings updated successfully',
      settings: (updatedUser as any).settings 
    });

  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
