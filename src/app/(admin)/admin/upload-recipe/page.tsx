/**
 * Admin Upload Recipe Page
 *
 * Allows admins to upload new recipes to SmartPlates
 */

'use client';

import { useAuth } from '@/context/authContext';
import { EnhancedRecipeUploadForm, type EnhancedRecipeFormData } from '@/components/forms/EnhancedRecipeUploadForm';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function AdminUploadRecipePage() {
  const { user, status } = useAuth();
  const loading = status === 'loading';
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  const handleRecipeUpload = async (recipeData: EnhancedRecipeFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/recipes/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...recipeData,
          authorId: user?.id,
          isAdminUpload: true,
        }),
      });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Recipe uploaded successfully' });
      } else {
        throw new Error('Error uploading recipe');
      }
    } catch (_error) {
      setMessage({ type: 'error', text: 'Error uploading recipe' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold">Upload New Recipe</h3>
          <p className="text-muted-foreground">
            Add a new recipe to the SmartPlates collection. This recipe will be available to all users.
          </p>
        </div>
        <EnhancedRecipeUploadForm
          onSubmit={handleRecipeUpload}
          isLoading={isLoading}
          user={user}
          submitButtonText="Upload Recipe"
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
