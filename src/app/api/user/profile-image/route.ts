/**
 * User Profile Image Upload API Route
 * 
 * Handles profile image uploads to Cloudinary with optimization
 */

import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { MongoDBService, ObjectId } from '@/lib/db';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const profileImage = formData.get('profileImage') as File;
    const userId = formData.get('userId') as string;

    if (!profileImage || !userId) {
      return NextResponse.json(
        { success: false, message: 'Profilbild und User ID sind erforderlich' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!profileImage.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'Nur Bilddateien sind erlaubt' },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    if (profileImage.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'Bild darf maximal 5MB groß sein' },
        { status: 400 }
      );
    }

    // Convert File to buffer
    const bytes = await profileImage.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary with profile-specific transformations
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'smartplates/profiles',
          transformation: [
            { width: 200, height: 200, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
          ],
          public_id: `profile_${userId}_${Date.now()}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // Connect to MongoDB and update user profile
    const mongodb = MongoDBService.getInstance();
    await mongodb.connect();
    const db = await mongodb.getDatabase();

    // Get current user to check for old profile image
    const currentUser = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { profileImage: 1, oldProfileImages: 1 } }
    );

    // Store old profile image public ID for cleanup
        const oldProfileImages = [];
    if (currentUser?.profileImage) {
      // Extract public ID from current profile image URL
      const urlParts = currentUser.profileImage.split('/');
      const publicIdWithExtension = urlParts[urlParts.length - 1];
      const publicId = publicIdWithExtension.split('.')[0];
      if (publicId && publicId.startsWith('profile_')) {
        oldProfileImages.push(`smartplates/profiles/${publicId}`);
      }
    }

    // Update user profile image
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          profileImage: uploadResult.secure_url,
          oldProfileImages: oldProfileImages,
          updatedAt: new Date(),
        },
        $push: {
          activity: {
            type: 'profile_image_updated',
            timestamp: new Date(),
          }
        } as any
      }
    );

    // Clean up old profile images (keep only the last 3)
    if (oldProfileImages.length > 3) {
      const imagesToDelete = oldProfileImages.slice(0, -3);
      
      // Delete old images from Cloudinary (async, don't wait)
      Promise.all(imagesToDelete.map(async (publicId) => {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error('Error deleting old profile image:', error);
        }
      }));

      // Update database to remove deleted image references
      await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $set: { oldProfileImages: oldProfileImages.slice(-3) } }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profilbild erfolgreich aktualisiert',
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    });

  } catch (error) {
    console.error('Profile image upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Fehler beim Hochladen des Profilbildes' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID ist erforderlich' },
        { status: 400 }
      );
    }

    const mongodb = MongoDBService.getInstance();
    await mongodb.connect();
    const db = await mongodb.getDatabase();

    // Get current user profile image
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { profileImage: 1 } }
    );

    if (!user || !user.profileImage) {
      return NextResponse.json(
        { success: false, message: 'Kein Profilbild vorhanden' },
        { status: 404 }
      );
    }

    // Extract public ID from URL
    const urlParts = user.profileImage.split('/');
    const publicIdWithExtension = urlParts[urlParts.length - 1];
    const publicId = publicIdWithExtension.split('.')[0];

    // Delete from Cloudinary
    if (publicId && publicId.startsWith('profile_')) {
      try {
        await cloudinary.uploader.destroy(`smartplates/profiles/${publicId}`);
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
      }
    }

    // Remove profile image from user
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $unset: { profileImage: "" },
        $set: { updatedAt: new Date() },
        $push: {
          activity: {
            type: 'profile_image_removed',
            timestamp: new Date(),
          }
        } as any
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Profilbild erfolgreich entfernt',
    });

  } catch (error) {
    console.error('Profile image deletion error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Fehler beim Entfernen des Profilbildes' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Profile image endpoint - POST or DELETE method required' },
    { status: 405 }
  );
}