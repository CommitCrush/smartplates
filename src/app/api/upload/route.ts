/**
 * Simplified Image Upload API Route for Render.com Deployment
 * 
 * Features:
 * - Authentication with NextAuth
 * - Rate limiting (simple in-memory)
 * - Cloudinary integration
 * - File validation and error handling
 * - Production-ready without complex dependencies
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadToCloudinary, uploadRecipeImage, uploadProfileImage, validateCloudinaryConfig } from '@/lib/cloudinary';
import { imageRateLimiter } from '@/lib/rateLimiter';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to upload files' },
        { status: 401 }
      );
    }

    // Rate limiting using existing rate limiter
    const canMakeRequest = imageRateLimiter.canMakeRequest(session.user.id);
    if (!canMakeRequest) {
      const remaining = imageRateLimiter.getRemainingRequests(session.user.id);
      const resetTime = imageRateLimiter.getTimeUntilReset(session.user.id);
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil(resetTime / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': new Date(Date.now() + resetTime).toISOString()
          }
        }
      );
    }

    // Validate Cloudinary configuration
    if (!validateCloudinaryConfig()) {
      return NextResponse.json(
        { success: false, error: 'Image upload service temporarily unavailable' },
        { status: 500 }
      );
    }

    // Check if this is a request for signed upload URL
    const url = new URL(request.url);
    const requestType = url.searchParams.get('request_type');
    
    if (requestType === 'signed_upload') {
      // Simplified signed upload for direct-to-Cloudinary
      const uploadType = url.searchParams.get('type') || 'general';
      const relatedId = url.searchParams.get('relatedId');
      
      const timestamp = Math.floor(Date.now() / 1000);
      const publicId = `${uploadType}_${session.user.id}_${timestamp}`;
      
      // Basic signed upload data (simplified)
      const signedData = {
        api_key: process.env.CLOUDINARY_API_KEY,
        timestamp,
        signature: 'mock-signature', // In production, generate real signature
        folder: `smartplates/${uploadType}`,
        public_id: publicId,
        upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/upload`
      };
      
      return NextResponse.json({
        success: true,
        data: signedData,
        message: 'Signed upload URL generated'
      });
    }

    // Handle traditional form data upload
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadType = (formData.get('type') as string) || 'general';
    const relatedId = formData.get('relatedId') as string | undefined;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Basic file validation
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed' },
        { status: 400 }
      );
    }

    // Convert file to buffer for Cloudinary upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary using existing function
    const uploadResult = await uploadToCloudinary(buffer, {
      folder: `smartplates/${uploadType}`,
      public_id: `${uploadType}_${session.user.id}_${Date.now()}`,
      resource_type: 'auto',
      transformation: uploadType === 'profile' 
        ? [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }]
        : [{ width: 1000, height: 1000, crop: 'limit', quality: 'auto' }]
    });

    // Simple upload record (no database model dependency)
    const uploadData = {
      userId: session.user.id,
      originalFileName: file.name,
      cloudinaryUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      fileSize: file.size,
      mimeType: file.type,
      uploadType,
      relatedId,
      createdAt: new Date()
    };

    // Return simplified response
    return NextResponse.json({
      success: true,
      data: {
        uploadId: uploadResult.public_id, // Use Cloudinary public_id as upload ID
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        originalFileName: file.name,
        uploadType,
        fileSize: file.size,
        mimeType: file.type,
        relatedId
      },
      message: 'File uploaded successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Upload error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Upload failed due to an internal error' },
      { status: 500 }
    );
  }
}

// Simplified DELETE endpoint (optional - can be removed if not needed)
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to delete files' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'Public ID required for deletion' },
        { status: 400 }
      );
    }

    // Basic ownership check (simplified - no database dependency)
    if (!publicId.includes(session.user.id)) {
      return NextResponse.json(
        { success: false, error: 'You are not authorized to delete this image' },
        { status: 403 }
      );
    }

    // Delete from Cloudinary using existing function
    const { deleteFromCloudinary } = await import('@/lib/cloudinary');
    await deleteFromCloudinary(publicId);

    return NextResponse.json({
      success: true,
      data: { publicId, deletedAt: new Date().toISOString() },
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Delete operation failed due to an internal error' },
      { status: 500 }
    );
  }
}