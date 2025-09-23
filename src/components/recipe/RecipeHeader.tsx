/**
 * Recipe Header Component
 * 
 * Displays recipe title, image, basic info, and action buttons.
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { Clock, Users, ChefHat, Tag } from 'lucide-react';
import { Recipe } from '@/types/recipe';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface RecipeHeaderProps {
  recipe: Recipe;
}

export function RecipeHeader({ recipe }: RecipeHeaderProps) {
  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Recipe Image */}
        <div className="relative aspect-square md:aspect-[4/3]">
          <Image
            src={recipe.image || '/images/placeholder-recipe.jpg'}
            alt={recipe.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Recipe Info */}
        <CardContent className="p-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Title and Description */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
              <p className="text-muted-foreground text-lg">{recipe.description}</p>
            </div>

            {/* Recipe Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Time</p>
                  <p className="font-semibold">{recipe.totalTime} minutes</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Servings</p>
                  <p className="font-semibold">{recipe.servings}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Difficulty</p>
                  <Badge variant="outline" className="font-semibold">
                    {recipe.difficulty}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Meal Type</p>
                  <Badge variant="secondary" className="font-semibold">
                    {recipe.mealType}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Prep and Cook Time Details */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Prep Time</p>
              <p className="font-semibold">{recipe.prepTime}min</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Cook Time</p>
              <p className="font-semibold">{recipe.cookTime}min</p>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
