/**
 * Admin Upload Recipe Page
 *
 * Allows admins to upload new recipes to SmartPlates
 */

'use client';

import RecipeUploadPage from '@/components/forms/RecipeUploadPage';

export default function AdminUploadRecipePage() {
  return (
    <RecipeUploadPage
      isUser={false}
      title="Upload New Recipe"
      description="Add a new recipe to the SmartPlates collection. This recipe will be available to all users."
      submitButtonText="Upload Recipe"
    />
  );
}
