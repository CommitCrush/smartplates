/**
 * Recipe Card Component
 * 
 * Displays recipe information in a card format for recipe listings.
 * Builds on existing Card component from ui/card.tsx
 */

'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Users, ChefHat, Star } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Recipe, RecipeCard as RecipeCardData } from '@/types/recipe';

interface RecipeCardProps {
  recipe: RecipeCardData | Recipe;
  className?: string;
  showAuthor?: boolean;
  priority?: boolean; // For image loading priority
}

export function RecipeCard({ 
  recipe, 
  className, 
  showAuthor = true,
  priority = false 
}: RecipeCardProps) {
  // Helper: check if image URL is valid (has extension and not empty)
  function getRecipeImage(url?: string) {
    if (!url || typeof url !== 'string') return '/placeholder-recipe.jpg';
    // Spoonacular images should end with .jpg, .png, .webp, etc.
    if (!/\.(jpg|jpeg|png|webp|gif)$/i.test(url)) return '/placeholder-recipe.jpg';
    return url;
  }
  // Calculate total time - handle both RecipeCard and Recipe types
  const totalTime = (() => {
    if ('totalTime' in recipe) {
      return recipe.totalTime;
    }
    // For full Recipe objects
    const fullRecipe = recipe as Recipe;
    if (fullRecipe.prepTime && fullRecipe.cookTime) {
      return fullRecipe.prepTime + fullRecipe.cookTime;
    }
    return 0;
  })();

  // Get recipe ID - handle both types with proper type guards
  const recipeId = ('_id' in recipe ? recipe._id?.toString() : '') || '';

  return (
    <Card className={cn(
      "group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
      className
    )}>
      <Link href={`/recipe/${recipeId}`}>
        {/* Recipe Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={getRecipeImage(recipe.image)}
            alt={recipe.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={e => {
              // fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              if (target.src !== '/placeholder-recipe.jpg') target.src = '/placeholder-recipe.jpg';
            }}
          />
          
          {/* Difficulty Badge */}
          <div className="absolute top-3 left-3">
            <Badge 
              variant="secondary" 
              className="bg-white/90 text-gray-900 backdrop-blur-sm"
            >
              {recipe.difficulty}
            </Badge>
          </div>

          {/* Rating Badge */}
          {recipe.rating && recipe.rating > 0 && (
            <div className="absolute top-3 right-3">
              <Badge 
                variant="secondary" 
                className="bg-white/90 text-gray-900 backdrop-blur-sm flex items-center gap-1"
              >
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {recipe.rating.toFixed(1)}
              </Badge>
            </div>
          )}
        </div>

        {/* Card Content */}
        <CardContent className="p-4">
          {/* Recipe Title */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {recipe.title}
          </h3>

          {/* Recipe Description */}
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {recipe.description}
          </p>

          {/* Recipe Meta Information */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              {/* Cooking Time */}
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{totalTime}min</span>
              </div>
              
              {/* Servings */}
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{recipe.servings}</span>
              </div>
            </div>

            {/* Difficulty Icon */}
            <div className="flex items-center gap-1">
              <ChefHat className="w-4 h-4" />
            </div>
          </div>
        </CardContent>

        {/* Card Footer */}
        <CardFooter className="p-4 pt-0">
          <div className="flex items-center justify-between w-full">
            {/* Author */}
            {showAuthor && 'authorName' in recipe && (
              <span className="text-sm text-muted-foreground">
                by {recipe.authorName}
              </span>
            )}

            {/* Tags */}
            <div className="flex gap-1 flex-wrap">
              {(recipe.tags?.slice(0, 2) ?? []).map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="text-xs"
                >
                  {tag}
                </Badge>
              ))}
              {recipe.tags && recipe.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{recipe.tags.length - 2}
                </Badge>
              )}
            </div>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}