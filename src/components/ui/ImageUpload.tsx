/**
 * Image Upload Component with Cloudinary Integration
 * 
 * Reusable component for uploading images with drag & drop, progress tracking, and preview
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface ImageUploadProps {
  onUpload: (image: UploadedImage) => void;
  onError?: (error: string) => void;
  uploadType?: 'recipe' | 'profile' | 'general';
  recipeId?: string;
  maxSize?: number; // in MB
  allowedTypes?: string[];
  className?: string;
  showPreview?: boolean;
  multiple?: boolean;
  currentImage?: string;
  useDirectUpload?: boolean; // Enable direct-to-Cloudinary uploads
}

export default function ImageUpload({
  onUpload,
  onError,
  uploadType = 'general',
  recipeId,
  maxSize = 10,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className,
  showPreview = true,
  multiple = false,
  currentImage,
  useDirectUpload = false,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
    }

    if (file.size > maxSize * 1024 * 1024) {
      return `File size too large. Maximum size: ${maxSize}MB`;
    }

    return null;
  };

  const uploadDirectToCloudinary = async (file: File) => {
    try {
      // Get signed upload URL from server
      const params = new URLSearchParams({
        request_type: 'signed_upload',
        type: uploadType,
        ...(recipeId && { relatedId: recipeId })
      });

      const signedResponse = await fetch(`/api/upload?${params}`);
      const signedResult = await signedResponse.json();

      if (!signedResponse.ok || !signedResult.success) {
        throw new Error(signedResult.message || 'Failed to get signed upload URL');
      }

      const signedData = signedResult.data;

      // Upload directly to Cloudinary with progress tracking
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signedData.api_key);
      formData.append('timestamp', signedData.timestamp.toString());
      formData.append('signature', signedData.signature);
      formData.append('folder', signedData.folder);
      formData.append('public_id', signedData.public_id);
      
      if (signedData.transformation) {
        formData.append('transformation', signedData.transformation);
      }

      return new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setUploadProgress(progress);
          }
        });

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
    } catch (error) {
      throw error;
    }
  };

  const uploadFile = async (file: File) => {
    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      let uploadResult;

      if (useDirectUpload) {
        // Direct-to-Cloudinary upload (saves bandwidth)
        uploadResult = await uploadDirectToCloudinary(file);
        
        // Transform Cloudinary response to match our interface
        const transformedResult = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
          bytes: uploadResult.bytes
        };

        setPreviewUrl(transformedResult.url);
        onUpload(transformedResult);
      } else {
        // Traditional upload through our API
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', uploadType);
        
        if (recipeId) {
          formData.append('recipeId', recipeId);
        }

        // Simulate progress for traditional upload
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 200);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        const result = await response.json();

        if (!response.ok) {
          // Handle structured error responses
          if (result.code === 'RATE_LIMIT_EXCEEDED') {
            const retryAfter = result.retryAfter || 60;
            throw new Error(`Rate limit exceeded. Please try again in ${retryAfter} seconds.`);
          } else if (result.code === 'FILE_TOO_LARGE') {
            throw new Error('File size too large. Maximum size is 10MB.');
          } else if (result.code === 'INVALID_FILE_TYPE') {
            throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
          } else {
            throw new Error(result.message || 'Upload failed');
          }
        }
        
        if (result.success && result.data) {
          setPreviewUrl(result.data.url);
          onUpload(result.data);
        } else {
          throw new Error('Invalid response from server');
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0]; // For now, handle single file
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      if (onError) {
        onError(validationError);
      }
      return;
    }

    uploadFile(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const removeImage = () => {
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <Card
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          {
            'border-primary bg-primary/5': isDragging,
            'border-red-300 bg-red-50': error,
            'border-green-300 bg-green-50': previewUrl && !isUploading && !error,
            'border-gray-300 hover:border-gray-400': !isDragging && !error && !previewUrl,
          }
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="p-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept={allowedTypes.join(',')}
            onChange={handleInputChange}
            className="hidden"
            multiple={multiple}
          />

          {isUploading ? (
            <div className="space-y-4">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-r-transparent rounded-full mx-auto" />
              <div>
                <p className="text-sm font-medium">Uploading...</p>
                <Progress value={uploadProgress} className="mt-2" />
              </div>
            </div>
          ) : previewUrl && showPreview ? (
            <div className="space-y-4">
              <div className="relative inline-block">
                <Image
                  src={previewUrl}
                  alt="Upload preview"
                  width={200}
                  height={150}
                  className="rounded-lg object-cover mx-auto"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-center text-green-600">
                <Check className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Image uploaded successfully</span>
              </div>
            </div>
          ) : error ? (
            <div className="space-y-2">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
              <Button variant="outline" size="sm" onClick={() => setError(null)}>
                Try Again
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                {isDragging ? (
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                ) : (
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {isDragging ? 'Drop your image here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} up to {maxSize}MB
                </p>
              </div>

              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Instructions */}
      {!previewUrl && !error && !isUploading && (
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Maximum file size: {maxSize}MB</p>
          <p>• Supported formats: {allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}</p>
          <p>• Images will be automatically optimized for web</p>
        </div>
      )}
    </div>
  );
}