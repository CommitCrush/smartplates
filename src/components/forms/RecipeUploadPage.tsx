/**
 * Shared Recipe Upload Page Component
 *
 * Reusable component for both admin and user recipe uploads
 */

'use client';

import { useAuth } from '@/context/authContext';
import { EnhancedRecipeUploadForm, type EnhancedRecipeFormData } from '@/components/forms/EnhancedRecipeUploadForm';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface RecipeUploadPageProps {
  isUser?: boolean;
  title?: string;
  description?: string;
  submitButtonText?: string;
}

export default function RecipeUploadPage({
  isUser = false,
  title = "Upload New Recipe",
  description = "Add a new recipe to your collection.",
  submitButtonText = "Upload Recipe"
}: RecipeUploadPageProps) {
  const { user, status } = useAuth();
  const loading = status === 'loading';
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (loading || !user || (!isUser && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!isUser ? 'Loading Admin Panel...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  const handleRecipeUpload = async (recipeData: EnhancedRecipeFormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      console.log(`Starting recipe upload for ${isUser ? 'user' : 'admin'}`);

      // Create FormData for multipart upload
      const formData = new FormData();

      // Add recipe data as JSON string (images are already uploaded to Cloudinary)
      const recipeDataToSend = {
        ...recipeData,
        authorId: user?.id,
        isUserUpload: isUser,
        // Include the already uploaded Cloudinary image URLs
        imageUrls: recipeData.images.map(img => img.url),
        cloudinaryImages: recipeData.images, // Include full Cloudinary metadata
      };

      formData.append('recipeData', JSON.stringify(recipeDataToSend));

      console.log('Sending FormData to API');

      const response = await fetch('/api/recipes/upload', {
        method: 'POST',
        body: formData, // No Content-Type header for FormData
      });

      const result = await response.json();
      console.log('API response:', result);

      if (response.ok && result.success) {
        setMessage({
          type: 'success',
          text: result.message || 'Recipe uploaded successfully'
        });
        // Don't reset form here - it will be reset by onSuccess callback
      } else {
        throw new Error(result.message || 'Error uploading recipe');
      }
    } catch (error) {
      console.error('Recipe upload error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error uploading recipe'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold">{title}</h3>
          <p className="text-muted-foreground">
            {description}
          </p>
        </div>
        <EnhancedRecipeUploadForm
          onSubmit={handleRecipeUpload}
          onSuccess={() => {
            // Form will be automatically reset
            console.log('Recipe uploaded successfully, form reset');
          }}
          isLoading={isLoading}
          user={user}
          submitButtonText={submitButtonText}
        />
        {message && (
          <div className={cn(
            "mt-6 p-4 rounded-lg flex items-center gap-3",
            message.type === 'success'
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          )}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <span>{message.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}