'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Users, ChefHat, Heart, Star, BookmarkPlus } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Recipe } from '@/types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  onLike?: (recipeId: string) => void;
  onSave?: (recipeId: string) => void;
  showAuthor?: boolean;
  className?: string;
}

export function RecipeCard({ 
  recipe, 
  onLike, 
  onSave, 
  showAuthor = true, 
  className 
}: RecipeCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await onLike?.(recipe.id);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error liking recipe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await onSave?.(recipe.id);
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error saving recipe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'breakfast': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'lunch': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'dinner': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'snack': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'dessert': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card className={cn(
      'group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
      className
    )}>
      <Link href={`/recipe/${recipe.id}`} className="block">
        <CardHeader className="p-0 relative">
          {/* Recipe Image */}
          <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
            {recipe.image ? (
              <Image
                src={recipe.image}
                alt={recipe.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
                <ChefHat className="h-12 w-12" />
              </div>
            )}
            
            {/* Actions Overlay */}
            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleLike}
                disabled={isLoading}
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white dark:bg-gray-900/90 dark:hover:bg-gray-900"
              >
                <Heart 
                  className={cn(
                    'h-4 w-4',
                    isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400'
                  )} 
                />
              </Button>
              
              <Button
                size="sm"
                variant="secondary"
                onClick={handleSave}
                disabled={isLoading}
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white dark:bg-gray-900/90 dark:hover:bg-gray-900"
              >
                <BookmarkPlus 
                  className={cn(
                    'h-4 w-4',
                    isSaved ? 'fill-blue-500 text-blue-500' : 'text-gray-600 dark:text-gray-400'
                  )} 
                />
              </Button>
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge className={getCategoryColor(recipe.category)}>
                {recipe.category}
              </Badge>
              <Badge className={getDifficultyColor(recipe.difficulty)}>
                {recipe.difficulty}
              </Badge>
            </div>

            {/* Rating */}
            {recipe.rating > 0 && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 dark:bg-gray-900/90 rounded-full px-2 py-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {recipe.rating.toFixed(1)}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  ({recipe.ratingsCount})
                </span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {recipe.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {recipe.description}
          </p>

          {/* Recipe Meta */}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{recipe.totalTime}m</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{recipe.servings}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{recipe.likesCount}</span>
            </div>
          </div>

          {/* Dietary Restrictions & Tags */}
          {(recipe.dietaryRestrictions.length > 0 || recipe.tags.length > 0) && (
            <div className="flex flex-wrap gap-1 mb-3">
              {recipe.dietaryRestrictions.slice(0, 2).map((restriction) => (
                <Badge 
                  key={restriction} 
                  variant="outline" 
                  className="text-xs py-0 px-2"
                >
                  {restriction}
                </Badge>
              ))}
              {recipe.tags.slice(0, 2).map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="text-xs py-0 px-2"
                >
                  {tag}
                </Badge>
              ))}
              {(recipe.dietaryRestrictions.length + recipe.tags.length) > 4 && (
                <Badge variant="outline" className="text-xs py-0 px-2">
                  +{(recipe.dietaryRestrictions.length + recipe.tags.length) - 4}
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        {showAuthor && (
          <CardFooter className="px-4 py-3 border-t bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {recipe.authorName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {recipe.authorName}
                </span>
              </div>
              <time className="text-xs text-gray-500 dark:text-gray-500">
                {new Date(recipe.createdAt).toLocaleDateString()}
              </time>
            </div>
          </CardFooter>
        )}
      </Link>
    </Card>
  );
}