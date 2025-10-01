/**
 * New Recipe Upload Page
 * 
 * Page for users to upload new recipes with comprehensive form
 */

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import EnhancedRecipeUploadForm from '@/components/forms/EnhancedRecipeUploadForm';

export default function NewRecipePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Upload New Recipe
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Share your culinary creation with the SmartPlates community.
        </p>
      </div>

      <EnhancedRecipeUploadForm 
        user={session.user}
        onSubmit={async (data) => {
          try {
            // Handle recipe upload
            console.log('Recipe data:', data);
            router.push('/user/my_added_recipes');
          } catch (error) {
            console.error('Failed to upload recipe:', error);
          }
        }}
      />
    </div>
  );
}