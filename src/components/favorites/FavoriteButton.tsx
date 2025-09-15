/**
 * Favorite Button Component
 * 
 * Heart button to favorite/unfavorite recipes.
 */

'use client';

import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  recipeId: string;
  isFavorited?: boolean;
  onFavoriteChange?: (isFavorited: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FavoriteButton({ 
  recipeId,
  isFavorited = false,
  onFavoriteChange,
  size = 'md',
  className 
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(isFavorited);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const handleToggleFavorite = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/users/favorites`, {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update favorite');
      }

      const newFavoriteState = !isFavorite;
      setIsFavorite(newFavoriteState);
      
      if (onFavoriteChange) {
        onFavoriteChange(newFavoriteState);
      }

      toast({
        title: newFavoriteState ? "Added to Favorites" : "Removed from Favorites",
        description: newFavoriteState 
          ? "Recipe saved to your favorites." 
          : "Recipe removed from your favorites.",
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={cn(
        sizeClasses[size],
        "p-0 rounded-full",
        isFavorite && "bg-red-50 border-red-200 hover:bg-red-100 dark:bg-red-950/20 dark:border-red-800",
        className
      )}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart 
        className={cn(
          iconSizes[size],
          "transition-colors",
          isFavorite 
            ? "fill-red-500 text-red-500" 
            : "text-muted-foreground"
        )} 
      />
    </Button>
  );
}
