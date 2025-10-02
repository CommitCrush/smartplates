'use client';

import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload } from 'lucide-react';

declare global {
  interface Window {
    cloudinary: any;
  }
}

interface CloudinaryWidgetUploadProps {
  onUpload: (result: { public_id: string; secure_url: string; url: string }) => void;
  onError?: (error: string) => void;
  uploadPreset?: string;
  cloudName?: string;
  folder?: string;
  buttonText?: string;
  buttonVariant?: 'default' | 'outline' | 'secondary';
  className?: string;
  disabled?: boolean;
}

export default function CloudinaryWidgetUpload({
  onUpload,
  onError,
  uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'smartplates_preset',
  cloudName,
  folder = 'smartplates/profiles',
  buttonText = 'Upload Image',
  buttonVariant = 'outline',
  className,
  disabled = false,
}: CloudinaryWidgetUploadProps) {
  const uploadWidgetRef = useRef<any>(null);

  useEffect(() => {
    // Initialize the widget when component mounts
    if (typeof window !== 'undefined' && window.cloudinary) {
      const uwConfig = {
        cloudName: cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
        uploadPreset: uploadPreset,
        folder: folder,
        cropping: true,
        croppingAspectRatio: 1, // Square for profile images
        croppingDefaultSelectionRatio: 1,
        croppingShowDimensions: true,
        croppingCoordinatesMode: 'custom',
        multiple: false,
        maxFiles: 1,
        maxFileSize: 5000000, // 5MB
        sources: ['local', 'url', 'camera'],
        styles: {
          palette: {
            window: '#FFFFFF',
            windowBorder: '#90A0B3',
            tabIcon: '#0078FF',
            menuIcons: '#5A616A',
            textDark: '#000000',
            textLight: '#FFFFFF',
            link: '#0078FF',
            action: '#FF620C',
            inactiveTabIcon: '#0E2F5A',
            error: '#F44235',
            inProgress: '#0078FF',
            complete: '#20B832',
            sourceBg: '#E4EBF1'
          },
          fonts: {
            default: null,
            "'Fira Sans', sans-serif": {
              url: 'https://fonts.googleapis.com/css?family=Fira+Sans',
              active: true
            }
          }
        }
      };

      uploadWidgetRef.current = window.cloudinary.createUploadWidget(
        uwConfig,
        (error: any, result: any) => {
          if (!error && result && result.event === 'success') {
            console.log('Upload successful:', result.info);
            onUpload({
              public_id: result.info.public_id,
              secure_url: result.info.secure_url,
              url: result.info.url,
            });
          } else if (error) {
            console.error('Upload error:', error);
            if (onError) {
              onError(error.message || 'Upload failed');
            }
          }
        }
      );
    }

    // Cleanup on unmount
    return () => {
      if (uploadWidgetRef.current) {
        uploadWidgetRef.current.destroy();
      }
    };
  }, [cloudName, uploadPreset, folder, onUpload, onError]);

  const openWidget = () => {
    if (uploadWidgetRef.current && !disabled) {
      uploadWidgetRef.current.open();
    }
  };

  return (
    <Button
      variant={buttonVariant}
      onClick={openWidget}
      disabled={disabled}
      className={className}
      type="button"
    >
      <Camera className="h-4 w-4 mr-2" />
      {buttonText}
    </Button>
  );
}