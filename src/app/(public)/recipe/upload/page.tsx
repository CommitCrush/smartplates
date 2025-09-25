'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import { EnhancedRecipeUploadForm } from '@/components/forms/EnhancedRecipeUploadForm';
import type { EnhancedRecipeFormData } from '@/components/forms/EnhancedRecipeUploadForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Lock, Globe, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UploadRecipePage() {
  const { user, status } = useAuth();
  const loading = status === 'loading';
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/recipe/upload');
    }
  }, [user, loading, router]);

  // Handle form submission
  const handleSubmit = async (formData: EnhancedRecipeFormData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Create FormData for file uploads
      const uploadData = new FormData();
      
      // Add recipe data (images are already uploaded to Cloudinary)
      uploadData.append('recipeData', JSON.stringify({
        ...formData,
        tags: formData.customTags, // Convert customTags to tags for API compatibility
        userId: user.id,
        // Include Cloudinary image URLs
        imageUrls: formData.images.map(img => img.url)
      }));
      
      const response = await fetch('/api/recipes/upload', {
        method: 'POST',
        body: uploadData,
      });

      if (response.ok) {
        const result = await response.json();
        
        // Show success message
        alert('Rezept erfolgreich hochgeladen!');
        
        // Redirect based on recipe status
        if (formData.isPublic) {
          router.push(`/recipe/${result.recipe._id}?success=uploaded`);
        } else {
          router.push(`/user/my_added_recipes?success=uploaded`);
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Fehler beim Hochladen des Rezepts');
      }
    } catch (error) {
      console.error('Error uploading recipe:', error);
      alert(error instanceof Error ? error.message : 'Fehler beim Hochladen des Rezepts');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Lade...</p>
        </div>
      </div>
    );
  }

  // Show login required message
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <div className="mb-6">
            <Lock className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Anmeldung erforderlich</h2>
            <p className="text-gray-600 mb-6">
              Du musst angemeldet sein, um Rezepte hochzuladen.
            </p>
          </div>
          
          <div className="space-y-3">
            <Link href="/login?redirect=/recipe/upload" className="w-full">
              <Button className="w-full">Anmelden</Button>
            </Link>
            <Link href="/register?redirect=/recipe/upload" className="w-full">
              <Button variant="outline" className="w-full">Registrieren</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/recipe">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Zurück zur Rezept-Sammlung
              </Button>
            </Link>
          </div>
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Neues Rezept hochladen
            </h1>
            <p className="text-gray-600">
              Teile dein Lieblingsrezept mit der SmartPlates Community oder behalte es privat für dich.
            </p>
          </div>

          {/* Privacy Information */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Datenschutz-Optionen:</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span><strong>Öffentlich:</strong> Alle können dein Rezept sehen und bewerten</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span><strong>Community:</strong> Nur angemeldete Benutzer können es sehen</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span><strong>Privat:</strong> Nur du kannst dein Rezept sehen</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Enhanced Recipe Form */}
        <EnhancedRecipeUploadForm
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          user={user}
          submitButtonText="Rezept hochladen"
          validationRules={{
            requiredFields: ['title', 'description'],
            minIngredients: 2,
            minInstructions: 3,
            maxImages: 5,
            maxImageSize: 5 * 1024 * 1024 // 5MB
          }}
        />
      </div>
    </div>
  );
}