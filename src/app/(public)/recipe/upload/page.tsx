'use client';

import { RecipeForm } from '@/components/forms/RecipeForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UploadRecipePage() {
  // Handle form submission
  const handleSubmit = async (formData: {
    title: string;
    description: string;
    category: string;
    difficulty: string;
    prepTime: number;
    cookTime: number;
    servings: number;
    ingredients: Array<{ id: string; name: string; amount: number; unit: string }>;
    instructions: Array<{ id: string; stepNumber: number; instruction: string }>;
    tags: string[];
    imageUrl?: string;
  }) => {
    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Rezept erfolgreich erstellt!');
        // Redirect to recipe collection
        window.location.href = '/recipe';
      } else {
        alert('Fehler beim Erstellen des Rezepts');
      }
    } catch (error) {
      console.error('Error submitting recipe:', error);
      alert('Fehler beim Erstellen des Rezepts');
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Neues Rezept hochladen</h1>
          <p className="text-gray-600 mt-2">
            Teile dein Lieblingsrezept mit der SmartPlates Community
          </p>
        </div>

        {/* Recipe Form */}
        <RecipeForm
          onSubmit={handleSubmit}
          submitButtonText="Rezept veröffentlichen"
          validationRules={{
            requiredFields: ['title', 'description'],
            minIngredients: 2,
            minInstructions: 3
          }}
        />
      </div>
    </div>
  );
}