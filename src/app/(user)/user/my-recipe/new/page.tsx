/**
 * User Upload Recipe Page
 *
 * Allows users to upload new recipes to SmartPlates
 */

'use client';

import RecipeUploadPage from '@/components/forms/RecipeUploadPage';

export default function UserUploadRecipePage() {
  return (
    <RecipeUploadPage
      isUser={true}
      title="Upload New Recipe"
      description="Add a new recipe to your personal collection."
      submitButtonText="Upload Recipe"
    />
  );
}
