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
import { Clock, ChefHat, Star } from 'lucide-react';
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
  // Helper: Handle Spoonacular images with direct loading (bypassing Next.js Image proxy)
  function getRecipeImage(url?: string) {
    if (!url || typeof url !== 'string') {
      return { src: '/placeholder-recipe.svg', useNextImage: true };
    }
    
    if (url.includes('spoonacular.com') || url.includes('img.spoonacular.com')) {
      return { src: url, useNextImage: false }; // Direct HTML img tag
    }
    
    if (!/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url)) {
      return { src: '/placeholder-recipe.svg', useNextImage: true };
    }
    
    return { src: url, useNextImage: true };
  }

  const imageConfig = getRecipeImage(recipe.image);

  // Calculate total time
  const totalTime = (() => {
    if ('totalTime' in recipe) return recipe.totalTime;
    const fullRecipe = recipe as Recipe;
    if (fullRecipe.readyInMinutes) return fullRecipe.readyInMinutes;
    if (fullRecipe.preparationMinutes && fullRecipe.cookingMinutes) {
      return fullRecipe.preparationMinutes + fullRecipe.cookingMinutes;
    }
    return 0;
  })();

  const recipeId = (recipe as any)._id || (recipe as any).id;
  const href = `/recipe/${recipeId}`;

  return (
    <Card className={cn(
      "group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
      className
    )}>
      <Link href={href}>
        {/* Recipe Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {imageConfig.useNextImage ? (
            <Image
              src={imageConfig.src}
              alt={recipe.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={(e) => { e.currentTarget.src = '/placeholder-recipe.svg'; }}
            />
          ) : (
            <img
              src={imageConfig.src}
              alt={recipe.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => { e.currentTarget.src = '/placeholder-recipe.svg'; }}
              loading={priority ? "eager" : "lazy"}
            />
          )}
          
          {/* Difficulty Badge */}
          {('difficulty' in recipe) && recipe.difficulty && (
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="bg-white/90 text-gray-900 backdrop-blur-sm">
                {recipe.difficulty}
              </Badge>
            </div>
          )}

          {/* Rating Badge */}
          {recipe.rating && recipe.rating > 0 && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-white/90 text-gray-900 backdrop-blur-sm flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {recipe.rating.toFixed(1)}
              </Badge>
            </div>
          )}
        </div>

        {/* Card Content */}
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {recipe.title}
          </h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {recipe.description || ('summary' in recipe ? recipe.summary?.replace(/<[^>]*>/g, '') : '') || 'No description available'}
          </p>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              {totalTime > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{totalTime}min</span>
                </div>
              )}
            </div>
            {('difficulty' in recipe) && recipe.difficulty && (
              <div className="flex items-center gap-1">
                <ChefHat className="w-4 h-4" />
              </div>
            )}
          </div>
        </CardContent>

        {/* Card Footer */}
        <CardFooter className="p-4 pt-0">
          <div className="flex items-center justify-between w-full">
            {showAuthor && 'authorName' in recipe && recipe.authorName && (
              <span className="text-sm text-muted-foreground">
                by {recipe.authorName}
              </span>
            )}
            <div className="flex gap-1 flex-wrap">
              {('tags' in recipe && recipe.tags) && (
                <>
                  {recipe.tags.slice(0, 2).map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {recipe.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{recipe.tags.length - 2}
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
