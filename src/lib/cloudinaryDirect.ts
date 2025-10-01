/**
 * Direct-to-Cloudinary Upload Utilities
 * Generates signed URLs for direct client uploads to Cloudinary
 */

import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';

export interface SignedUploadData {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string;
  public_id: string;
  upload_url: string;
  transformation?: string;
}

export interface DirectUploadOptions {
  userId: string;
  uploadType: 'recipe' | 'profile' | 'general';
  relatedId?: string;
  maxFileSize?: number;
  allowedFormats?: string[];
}

/**
 * Generates a signed upload URL for direct client uploads to Cloudinary
 * This bypasses your server for file transfer, saving bandwidth
 */
export async function generateSignedUpload(
  options: DirectUploadOptions
): Promise<SignedUploadData> {
  const {
    userId,
    uploadType,
    relatedId,
    maxFileSize = 10485760, // 10MB default
    allowedFormats = ['jpg', 'jpeg', 'png', 'webp']
  } = options;

  // Generate unique public_id
  const timestamp = Math.round(Date.now() / 1000);
  const randomString = crypto.randomBytes(8).toString('hex');
  const folder = `smartplates/${uploadType}`;
  const public_id = `${folder}/${userId}_${relatedId || 'general'}_${timestamp}_${randomString}`;

  // Upload parameters for Cloudinary
  const uploadParams: Record<string, any> = {
    timestamp,
    folder,
    public_id,
    resource_type: 'image',
    allowed_formats: allowedFormats.join(','),
    bytes_step: maxFileSize,
    tags: [uploadType, userId, ...(relatedId ? [relatedId] : [])].join(',')
  };

  // Add transformations based on upload type
  switch (uploadType) {
    case 'recipe':
      uploadParams.transformation = 'c_limit,w_1200,h_800,q_auto,f_auto';
      break;
    case 'profile':
      uploadParams.transformation = 'c_fill,w_400,h_400,g_face,q_auto,f_auto';
      break;
    default:
      uploadParams.transformation = 'q_auto,f_auto';
  }

  // Generate signature
  const signature = cloudinary.utils.api_sign_request(
    uploadParams,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    api_key: process.env.CLOUDINARY_API_KEY!,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    folder,
    public_id,
    upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    transformation: uploadParams.transformation
  };
}

/**
 * Validates a completed Cloudinary upload response
 * Call this after the client receives the upload response from Cloudinary
 */
export function validateCloudinaryResponse(
  responseData: any,
  expectedSignature: string,
  expectedTimestamp: number
): boolean {
  try {
    // Verify the response contains expected fields
    if (!responseData.public_id || !responseData.secure_url) {
      return false;
    }

    // Verify timestamp is within reasonable range (10 minutes)
    const now = Math.round(Date.now() / 1000);
    if (Math.abs(now - expectedTimestamp) > 600) {
      return false;
    }

    // Additional validation could include signature verification
    // if Cloudinary includes it in the response

    return true;
  } catch {
    return false;
  }
}

/**
 * Client-side utility function to upload directly to Cloudinary
 * This would be used in your React components
 */
export const uploadDirectlyToCloudinary = async (
  file: File,
  signedData: SignedUploadData,
  onProgress?: (progress: number) => void
): Promise<any> => {
  const formData = new FormData();
  
  // Add Cloudinary required fields
  formData.append('file', file);
  formData.append('api_key', signedData.api_key);
  formData.append('timestamp', signedData.timestamp.toString());
  formData.append('signature', signedData.signature);
  formData.append('folder', signedData.folder);
  formData.append('public_id', signedData.public_id);
  
  if (signedData.transformation) {
    formData.append('transformation', signedData.transformation);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch {
          reject(new Error('Invalid response from Cloudinary'));
        }
      } else {
        reject(new Error(`Upload failed with status: ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('POST', signedData.upload_url);
    xhr.send(formData);
  });
};