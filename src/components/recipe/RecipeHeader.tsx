
/**
 * Recipe Header Component
 * 
 * Displays recipe title, image, and basic info.
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { Clock, Users } from 'lucide-react';
import { Recipe } from '@/types/recipe';
import { Card, CardContent } from '@/components/ui/card';

interface RecipeHeaderProps {
  recipe: Recipe;
}

export function RecipeHeader({ recipe }: RecipeHeaderProps) {
  // Helper: Handle Spoonacular images with direct loading
  function getRecipeImageConfig(url?: string) {
    if (!url || typeof url !== 'string') {
      return { src: '/placeholder-recipe.svg', useNextImage: true };
    }
    
    if (url.includes('spoonacular.com') || url.includes('img.spoonacular.com')) {
      return { src: url, useNextImage: false };
    }
    
    return { src: url, useNextImage: true };
  }

  const imageConfig = getRecipeImageConfig(recipe.image);

  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Recipe Image */}
        <div className="relative aspect-square md:aspect-[4/3]">
          {imageConfig.useNextImage ? (
            <Image
              src={imageConfig.src}
              alt={recipe.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <img
              src={imageConfig.src}
              alt={recipe.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
          )}
        </div>

        {/* Recipe Info */}
        <CardContent className="p-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
            </div>

            {/* Recipe Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Time</p>
                  <p className="font-semibold">{recipe.readyInMinutes} minutes</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Servings</p>
                  <p className="font-semibold">{recipe.servings}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Prep and Cook Time Details */}
          {(recipe.preparationMinutes || recipe.cookingMinutes) && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              {recipe.preparationMinutes && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Prep Time</p>
                  <p className="font-semibold">{recipe.preparationMinutes} min</p>
                </div>
              )}
              {recipe.cookingMinutes && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Cook Time</p>
                  <p className="font-semibold">{recipe.cookingMinutes} min</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
