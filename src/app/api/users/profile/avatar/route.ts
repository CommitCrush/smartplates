/**
 * User Avatar Upload API
 * 
 * Handles profile image upload with validation and processing
 * POST /api/users/profile/avatar - Upload new avatar image
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateUser, findUserById } from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Convert file to base64 for storage (simple approach)
    // In production, you'd upload to a cloud storage service like AWS S3, Cloudinary, etc.
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Update user avatar in database
    const updatedUser = await updateUser(session.user.id, {
      avatar: base64Image
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }    return NextResponse.json({
      success: true,
      avatar: updatedUser.avatar,
      message: 'Avatar updated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload avatar',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT endpoint to update avatar URL (for Cloudinary uploads)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
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

    // Update user avatar in database
    const updatedUser = await updateUser(session.user.id, {
      avatar: imageUrl
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
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
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Remove avatar from user
    const updatedUser = await updateUser(session.user.id, {
      avatar: undefined
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Avatar removed successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Avatar delete error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to remove avatar',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}