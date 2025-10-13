/**
 * Community Recipe Detail Component
 * 
 * Specialized component for displaying community-created recipes (admin/user).
 * Handles different data format from Spoonacular recipes.
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Users, 
  ChefHat, 
  ArrowLeft, 
  Share2,
  Calendar,
  User
} from 'lucide-react';
import { Recipe } from '@/types/recipe';
import { 
  CommunityRecipeDetailProps, 
  CommunityRecipe 
} from '@/types/components';
import { cn } from '@/lib/utils';

export function CommunityRecipeDetail({ recipe }: CommunityRecipeDetailProps) {
  const router = useRouter();
  const communityRecipe = recipe as CommunityRecipe;

  const handleShare = async (): Promise<void> => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: communityRecipe.title,
          text: communityRecipe.description,
          url: window.location.href,
        });
      } catch (error: unknown) {
        console.log('Error sharing:', error);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/recipe')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Recipes
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            Community Recipe
          </Badge>
        </div>
      </div>

      {/* Recipe Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recipe Image */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
              {communityRecipe.image && communityRecipe.image !== '/placeholder-recipe.svg' ? (
                <Image
                  src={communityRecipe.image}
                  alt={communityRecipe.title}
                  fill
                  className="object-cover"
                  priority
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-recipe.svg';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                  <div className="text-center">
                    <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">Recipe Image</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Recipe Info */}
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{communityRecipe.title}</h1>
                {communityRecipe.description && (
                  <p className="text-muted-foreground text-lg">{communityRecipe.description}</p>
                )}
              </div>
              
              {/* Recipe Meta */}
              <div className="grid grid-cols-2 gap-4">
                {(communityRecipe.preparationMinutes || communityRecipe.cookingMinutes || communityRecipe.readyInMinutes) && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Total Time</p>
                      <p className="text-sm text-muted-foreground">
                        {communityRecipe.readyInMinutes || ((communityRecipe.preparationMinutes || 0) + (communityRecipe.cookingMinutes || 0))} minutes
                      </p>
                    </div>
                  </div>
                )}
                
                {communityRecipe.servings && (
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Servings</p>
                      <p className="text-sm text-muted-foreground">{communityRecipe.servings}</p>
                    </div>
                  </div>
                )}
                
                {communityRecipe.difficulty && (
                  <div className="flex items-center gap-2">
                    <ChefHat className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Difficulty</p>
                      <p className="text-sm text-muted-foreground capitalize">{communityRecipe.difficulty}</p>
                    </div>
                  </div>
                )}
                
                {(communityRecipe.authorName || communityRecipe.author) && (
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Created By</p>
                      <p className="text-sm text-muted-foreground">
                        {communityRecipe.authorName || communityRecipe.author}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Categories and Tags */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {communityRecipe.category && (
                    <Badge variant="secondary" className="capitalize">
                      {communityRecipe.category}
                    </Badge>
                  )}
                  
                  {communityRecipe.source && (
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "capitalize",
                        communityRecipe.source === 'admin_upload' && "bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-100",
                        communityRecipe.source === 'user_upload' && "bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-100"
                      )}
                    >
                      {communityRecipe.source === 'admin_upload' ? 'Admin Created' : 
                       communityRecipe.source === 'user_upload' ? 'User Created' : 
                       communityRecipe.source?.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
                
                {communityRecipe.tags && communityRecipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {communityRecipe.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Creation Date */}
              {communityRecipe.createdAt && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Created: {new Date(communityRecipe.createdAt).toLocaleDateString('de-DE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipe Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingredients - Community Format */}
        <Card>
          <CardHeader>
            <CardTitle>Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            {communityRecipe.ingredients && communityRecipe.ingredients.length > 0 ? (
              <ul className="space-y-3">
                {communityRecipe.ingredients.map((ingredient, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">
                      {typeof ingredient === 'string' 
                        ? ingredient 
                        : `${ingredient.amount || ''} ${ingredient.unit || ''} ${ingredient.name || ''}`.trim()
                      }
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No ingredients listed.</p>
            )}
          </CardContent>
        </Card>

        {/* Instructions - Community Format */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            {communityRecipe.instructions && communityRecipe.instructions.length > 0 ? (
              <ol className="space-y-4">
                {communityRecipe.instructions.map((instruction, index: number) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-relaxed">
                      {typeof instruction === 'string' 
                        ? instruction 
                        : instruction?.instruction || (instruction as any)?.step || ''}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-muted-foreground">No instructions provided.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Nutrition Info (if available) */}
      {communityRecipe.nutrition && Object.keys(communityRecipe.nutrition).length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Nutrition Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(communityRecipe.nutrition).map(([key, value]: [string, any]) => (
                <div key={key} className="text-center">
                  <p className="font-medium capitalize">{key}</p>
                  <p className="text-2xl font-bold text-primary">{value}</p>
                  <p className="text-xs text-muted-foreground">
                    {key === 'calories' ? 'kcal' : 
                     ['protein', 'carbs', 'fat'].includes(key) ? 'g' : ''}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default CommunityRecipeDetail;