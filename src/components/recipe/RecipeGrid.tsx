/**
 * Recipe Grid Component
 * 
 * Displays a responsive grid of recipe cards.
 * Handles loading states and empty states.
 */

'use client';

import React from 'react';
import { RecipeCard } from './RecipeCard';
import { RecipeCardSkeleton } from './RecipeCardSkeleton';
import { Recipe, RecipeCard as RecipeCardData } from '@/types/recipe';
import { cn } from '@/lib/utils';

interface RecipeGridProps {
  recipes: (RecipeCardData | Recipe)[];
  isLoading?: boolean;
  className?: string;
  showAuthor?: boolean;
  emptyMessage?: string;
  loadingCount?: number; // Number of skeleton cards to show
}

export function RecipeGrid({ 
  recipes, 
  isLoading = false,
  className,
  showAuthor = true,
  emptyMessage = "No recipes found. Try adjusting your search or filters.",
  loadingCount = 6
}: RecipeGridProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
        className
      )}>
        {Array.from({ length: loadingCount }).map((_, index) => (
          <RecipeCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Empty state
  if (!recipes || recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 mb-4 text-muted-foreground">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="w-full h-full"
          >
            <path d="M3 7V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v2" />
            <path d="M3 7l9 6 9-6" />
            <path d="M3 7v10c0 1.1.9 2 2 2h14c1.1 0 2 .9 2 2V7" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          No Recipes Found
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          {emptyMessage}
        </p>
      </div>
    );
  }

  // Recipes grid
  return (
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
      className
    )}>
      {recipes.map((recipe, index) => {
        // Handle both RecipeCard and Recipe types for the key with type guard
        const recipeKey = ('_id' in recipe ? recipe._id?.toString() : '') || `recipe-${index}`;
        
        return (
          <RecipeCard
            key={recipeKey}
            recipe={recipe}
            showAuthor={showAuthor}
            priority={index < 3} // First 3 images get priority loading
          />
        );
      })}
    </div>
  );
}
