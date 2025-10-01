import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { findUserById } from '@/models/User';

interface ProfileParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: ProfileParams
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    // Handle "me" parameter - use current user's ID from session
    let targetUserId = id;
    if (id === 'me') {
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'User not authenticated' },
          { status: 401 }
        );
      }
      targetUserId = session.user.id;
    }

    // Find the requested user
    const user = await findUserById(targetUserId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Determine if the current user is viewing their own profile
    const isOwner = session?.user?.email === user.email;

    // Create public profile data
    const profileData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: (user as any).bio || '',
      location: (user as any).location || '',
      dietaryRestrictions: user.dietaryRestrictions || [],
      favoriteCategories: user.favoriteCategories || [],
      createdAt: user.createdAt,
      isOwner
    };

    // If not the owner and profile is private, limit data
    const settings = (user as any).settings;
    if (!isOwner && settings?.privacy?.profileVisibility === 'private') {
      return NextResponse.json({
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        isOwner: false,
        isPrivate: true
      });
    }

    // If not the owner, respect privacy settings
    if (!isOwner && settings?.privacy) {
      if (!settings.privacy.showEmail) {
        profileData.email = ''; // Hide email instead of deleting
      }
      if (!settings.privacy.showLocation) {
        profileData.location = ''; // Hide location instead of deleting
      }
    }

    return NextResponse.json(profileData);

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
