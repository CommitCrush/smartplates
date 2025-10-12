/**
 * User Avatar API Route - Simplified for Cloudinary URLs
 * 
 * Handles avatar URL updates from Cloudinary uploads
 * PUT /api/users/profile/avatar - Update avatar URL in MongoDB
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateUser, findUserByEmail } from '@/models/User';

// PUT endpoint to update avatar URL (for Cloudinary uploads)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { imageUrl, publicId } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Find user by email to get ID
    const user = await findUserByEmail(session.user.email);
    
    if (!user?._id) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user avatar in database
    const updatedUser = await updateUser(user._id, {
      avatar: imageUrl
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update avatar' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      avatar: updatedUser.avatar,
      message: 'Avatar updated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Avatar update error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update avatar',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove avatar
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find user by email to get ID
    const user = await findUserByEmail(session.user.email);
    
    if (!user?._id) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove user avatar
    const updatedUser = await updateUser(user._id, {
      avatar: undefined
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to remove avatar' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Avatar removed successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Avatar removal error:', error);
    return NextResponse.json(
      {
        error: 'Failed to remove avatar',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}