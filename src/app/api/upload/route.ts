/**
 * Enhanced Image Upload API Route with Security & Performance Improvements
 * 
 * Features:
 * - Database-based ownership verification
 * - Rate limiting (5 uploads/minute per user)
 * - Structured error responses
 * - Direct-to-Cloudinary signed uploads
 * - Comprehensive validation and error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadToCloudinary, uploadRecipeImage, uploadProfileImage, validateCloudinaryConfig } from '@/lib/cloudinary';
import { generateSignedUpload, DirectUploadOptions } from '@/lib/cloudinaryDirect';
import { uploadRateLimiter } from '@/utils/rateLimiter';
import { UploadErrorCode, createErrorResponse, createSuccessResponse } from '@/types/apiResponse';
import ImageUpload from '@/models/ImageUpload';
import { connectToDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      const { response, statusCode } = createErrorResponse(
        UploadErrorCode.AUTHENTICATION_REQUIRED,
        'Authentication required to upload files',
        401
      );
      return NextResponse.json(response, { status: statusCode });
    }

    // Rate limiting
    const rateLimitResult = uploadRateLimiter.check(session.user.id);
    if (!rateLimitResult.allowed) {
      const { response, statusCode } = createErrorResponse(
        UploadErrorCode.RATE_LIMIT_EXCEEDED,
        'Rate limit exceeded. Please try again later.',
        429,
        undefined,
        Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
      );
      return NextResponse.json(response, { 
        status: statusCode,
        headers: {
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
        }
      });
    }

    // Connect to database
    await connectToDatabase();

    // Validate Cloudinary configuration
    if (!validateCloudinaryConfig()) {
      const { response, statusCode } = createErrorResponse(
        UploadErrorCode.CLOUDINARY_CONFIG_MISSING,
        'Cloudinary configuration missing',
        500
      );
      return NextResponse.json(response, { status: statusCode });
    }

    // Check if this is a request for signed upload URL
    const url = new URL(request.url);
    const requestType = url.searchParams.get('request_type');
    
    if (requestType === 'signed_upload') {
      // Generate signed upload URL for direct-to-Cloudinary upload
      const uploadType = url.searchParams.get('type') || 'general';
      const relatedId = url.searchParams.get('relatedId') || undefined;
      
      const directUploadOptions: DirectUploadOptions = {
        userId: session.user.id,
        uploadType: uploadType as 'recipe' | 'profile' | 'general',
        relatedId
      };
      
      const signedData = await generateSignedUpload(directUploadOptions);
      
      return NextResponse.json(
        createSuccessResponse(signedData, 'Signed upload URL generated')
      );
    }

    // Parse form data for traditional upload
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadType = formData.get('type') as string || 'general';
    const recipeId = formData.get('recipeId') as string;

    if (!file) {
      const { response, statusCode } = createErrorResponse(
        UploadErrorCode.NO_FILE_PROVIDED,
        'No file provided for upload'
      );
      return NextResponse.json(response, { status: statusCode });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      const { response, statusCode } = createErrorResponse(
        UploadErrorCode.INVALID_FILE_TYPE,
        'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      );
      return NextResponse.json(response, { status: statusCode });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      const { response, statusCode } = createErrorResponse(
        UploadErrorCode.FILE_TOO_LARGE,
        'File size too large. Maximum size is 10MB.'
      );
      return NextResponse.json(response, { status: statusCode });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Convert buffer to base64 for Cloudinary
    const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`;

    let uploadResult;

    // Upload based on type
    switch (uploadType) {
      case 'recipe':
        if (!recipeId) {
          const { response, statusCode } = createErrorResponse(
            UploadErrorCode.RECIPE_ID_REQUIRED,
            'Recipe ID required for recipe image upload'
          );
          return NextResponse.json(response, { status: statusCode });
        }
        uploadResult = await uploadRecipeImage(base64Data, recipeId, session.user.id);
        break;

      case 'profile':
        uploadResult = await uploadProfileImage(base64Data, session.user.id);
        break;

      default:
        uploadResult = await uploadToCloudinary(base64Data, {
          folder: `smartplates/${uploadType}`,
          tags: [uploadType, session.user.id],
        });
        break;
    }

    // Store upload record in database for ownership verification
    const imageUpload = new ImageUpload({
      publicId: uploadResult.public_id,
      secureUrl: uploadResult.secure_url,
      userId: session.user.id,
      uploadType: uploadType as 'recipe' | 'profile' | 'general',
      relatedId: recipeId,
      metadata: {
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        bytes: uploadResult.bytes
      }
    });

    await imageUpload.save();

    const responseData = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      uploadId: imageUpload._id
    };

    return NextResponse.json(
      createSuccessResponse(responseData, 'File uploaded successfully')
    );

  } catch (error) {
    console.error('Upload error:', error);
    const { response, statusCode } = createErrorResponse(
      UploadErrorCode.UPLOAD_FAILED,
      'Upload failed due to an internal error',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
    return NextResponse.json(response, { status: statusCode });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      const { response, statusCode } = createErrorResponse(
        UploadErrorCode.AUTHENTICATION_REQUIRED,
        'Authentication required to delete files',
        401
      );
      return NextResponse.json(response, { status: statusCode });
    }

    // Connect to database
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      const { response, statusCode } = createErrorResponse(
        UploadErrorCode.PUBLIC_ID_REQUIRED,
        'Public ID required for deletion'
      );
      return NextResponse.json(response, { status: statusCode });
    }

    // Database-based ownership verification (SECURE)
    const isOwner = await ImageUpload.verifyOwnership(publicId, session.user.id);
    
    if (!isOwner) {
      const { response, statusCode } = createErrorResponse(
        UploadErrorCode.UNAUTHORIZED,
        'You are not authorized to delete this image',
        403
      );
      return NextResponse.json(response, { status: statusCode });
    }

    // Delete from Cloudinary
    const { deleteFromCloudinary } = await import('@/lib/cloudinary');
    await deleteFromCloudinary(publicId);

    // Remove from database
    const deletionResult = await ImageUpload.safeDelete(publicId, session.user.id);
    
    if (!deletionResult) {
      const { response, statusCode } = createErrorResponse(
        UploadErrorCode.DATABASE_ERROR,
        'Failed to remove image record from database',
        500
      );
      return NextResponse.json(response, { status: statusCode });
    }

    return NextResponse.json(
      createSuccessResponse(
        { publicId, deletedAt: new Date().toISOString() },
        'Image deleted successfully'
      )
    );

  } catch (error) {
    console.error('Delete error:', error);
    const { response, statusCode } = createErrorResponse(
      UploadErrorCode.DELETE_FAILED,
      'Delete operation failed due to an internal error',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
    return NextResponse.json(response, { status: statusCode });
  }
}