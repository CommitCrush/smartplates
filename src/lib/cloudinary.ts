/**
 * Cloudinary Configuration and Utilities
 * 
 * Handles image uploads, transformations, and management using Cloudinary
 */

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload interface for TypeScript
 */
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  [key: string]: any;
}

/**
 * Upload options interface
 */
export interface UploadOptions {
  folder?: string;
  public_id?: string;
  transformation?: object[];
  tags?: string[];
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  format?: string;
  quality?: string | number;
}

/**
 * Upload image to Cloudinary
 */
export async function uploadToCloudinary(
  file: string | Buffer,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
  try {
    const uploadOptions = {
      folder: options.folder || 'smartplates',
      resource_type: options.resource_type || 'auto',
      quality: options.quality || 'auto',
      fetch_format: 'auto',
      ...options,
    };

    const result = await cloudinary.uploader.upload(file as string, uploadOptions);
    return result as CloudinaryUploadResult;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(
  files: (string | Buffer)[],
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult[]> {
  try {
    const uploadPromises = files.map((file, index) =>
      uploadToCloudinary(file, {
        ...options,
        public_id: options.public_id ? `${options.public_id}_${index}` : undefined,
      })
    );

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Multiple upload error:', error);
    throw new Error(`Failed to upload multiple images: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete image from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get optimized image URL with transformations
 */
export function getOptimizedImageUrl(
  publicId: string,
  transformations: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  } = {}
): string {
  try {
    return cloudinary.url(publicId, {
      quality: transformations.quality || 'auto',
      fetch_format: transformations.format || 'auto',
      width: transformations.width,
      height: transformations.height,
      crop: transformations.crop || 'fill',
    });
  } catch (error) {
    console.error('URL generation error:', error);
    return '';
  }
}

/**
 * Upload recipe image with specific optimizations
 */
export async function uploadRecipeImage(
  imageFile: string | Buffer,
  recipeId: string,
  userId: string
): Promise<CloudinaryUploadResult> {
  return uploadToCloudinary(imageFile, {
    folder: `smartplates/recipes/${userId}`,
    public_id: `recipe_${recipeId}_${Date.now()}`,
    transformation: [
      { width: 800, height: 600, crop: 'fill' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ],
    tags: ['recipe', 'user_upload', userId, recipeId],
  });
}

/**
 * Upload user profile image
 */
export async function uploadProfileImage(
  imageFile: string | Buffer,
  userId: string
): Promise<CloudinaryUploadResult> {
  return uploadToCloudinary(imageFile, {
    folder: `smartplates/profiles`,
    public_id: `profile_${userId}`,
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ],
    tags: ['profile', 'user_upload', userId],
  });
}

/**
 * Generate recipe image transformations for different sizes
 */
export function getRecipeImageUrls(publicId: string) {
  return {
    thumbnail: getOptimizedImageUrl(publicId, { width: 150, height: 150 }),
    card: getOptimizedImageUrl(publicId, { width: 400, height: 300 }),
    large: getOptimizedImageUrl(publicId, { width: 800, height: 600 }),
    original: cloudinary.url(publicId),
  };
}

/**
 * Validate Cloudinary configuration
 */
export function validateCloudinaryConfig(): boolean {
  const requiredVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.error(`Missing Cloudinary environment variable: ${varName}`);
      return false;
    }
  }
  
  return true;
}

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    const regex = /\/upload\/(?:v\d+\/)?(.+)$/;
    const match = url.match(regex);
    
    if (match && match[1]) {
      // Remove file extension
      return match[1].replace(/\.[^/.]+$/, '');
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
}

export default cloudinary;