/**
 * Favorites List Component
 * 
 * Displays user's favorite recipes in a grid.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Grid, List } from 'lucide-react';
import { RecipeGrid } from '../recipe/RecipeGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Recipe, RecipeCard as RecipeCardData } from '@/types/recipe';
import { cn } from '@/lib/utils';

interface FavoritesListProps {
  userId?: string;
  className?: string;
}

export function FavoritesList({ userId, className }: FavoritesListProps) {
  const [favorites, setFavorites] = useState<(RecipeCardData | Recipe)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchFavorites();
  }, [userId]);

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users/favorites');
      if (response.ok) {
        const favoritesData = await response.json();
        setFavorites(favoritesData);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteRemoved = (recipeId: string) => {
    setFavorites(prev => 
      prev.filter(recipe => 
        ('_id' in recipe ? recipe._id?.toString() : '') !== recipeId
      )
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              My Favorite Recipes ({favorites.length})
            </CardTitle>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Favorites Grid/List */}
      {viewMode === 'grid' ? (
        <RecipeGrid
          recipes={favorites}
          isLoading={isLoading}
          emptyMessage="You haven't favorited any recipes yet. Start exploring and save your favorite recipes!"
          showAuthor={true}
        />
      ) : (
        /* List View */
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-muted rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-1/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No Favorites Yet
              </h3>
              <p className="text-muted-foreground">
                You haven't favorited any recipes yet. Start exploring and save your favorite recipes!
              </p>
            </div>
          ) : (
            favorites.map((recipe) => {
              const recipeKey = ('_id' in recipe ? recipe._id?.toString() : '') || `recipe-${Math.random()}`;
              
              return (
                <Card key={recipeKey} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Recipe Image */}
                      <div className="w-20 h-20 rounded overflow-hidden bg-muted flex-shrink-0">
                        {recipe.image && (
                          <img 
                            src={recipe.image} 
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      
                      {/* Recipe Info */}
                      <div className="flex-1 space-y-1">
                        <h3 className="font-medium text-lg line-clamp-1">
                          {recipe.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {recipe.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{recipe.difficulty}</span>
                          <span>{recipe.servings} servings</span>
                          {('totalTime' in recipe) && (
                            <span>{recipe.totalTime} min</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Remove from Favorites */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFavoriteRemoved(recipeKey)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
