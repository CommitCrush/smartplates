/**
 * Recipe Detail Modal Component
 * 
 * Shows complete recipe details when clicking on planned meals.
 * Displays image, ingredients, instructions, and meal information.
 */

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Clock, Users, ChefHat, X, Star, Tag, Utensils, Plus, Minus, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
// Note: ScrollArea component doesn't exist, using div with overflow-y-auto instead
import { cn } from '@/lib/utils';
import type { MealSlot } from '@/types/meal-planning';
import type { Recipe } from '@/types/recipe';

// ========================================
// Types
// ========================================

interface RecipeDetailModalProps {
  meal: MealSlot | null;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

// ========================================
// Mock Recipe Data for Fallback
// ========================================

const createMockRecipe = (meal: MealSlot): Recipe => ({
  _id: meal.recipeId || '1',
  title: meal.recipeName || 'Delicious Recipe',
  description: meal.notes || 'A wonderful meal that\'s perfect for any occasion.',
  image: meal.image || '/placeholder-recipe.svg',
  difficulty: 'medium' as const,
  servings: meal.servings || 4,
  prepTime: 15,
  cookTime: (meal.cookingTime || 30) - 15,
  totalTime: meal.cookingTime || 30,
  ingredients: [
    { name: 'Main ingredient', amount: 2, unit: 'cups' },
    { name: 'Seasoning', amount: 1, unit: 'tsp' },
    { name: 'Oil', amount: 2, unit: 'tbsp' },
    { name: 'Garlic', amount: 2, unit: 'cloves' }
  ],
  instructions: [
    { 
      stepNumber: 1, 
      instruction: 'Prepare all ingredients by washing and chopping as needed.',
      duration: 5 
    },
    { 
      stepNumber: 2, 
      instruction: 'Heat oil in a large pan over medium heat.',
      duration: 2 
    },
    { 
      stepNumber: 3, 
      instruction: 'Add main ingredients and cook until tender.',
      duration: 15 
    },
    { 
      stepNumber: 4, 
      instruction: 'Season with spices and serve hot.',
      duration: 3 
    }
  ],
  tags: ['healthy', 'quick', 'family-friendly'],
  rating: 4.5,
  category: 'Main Course',
  cuisine: 'International',
  authorName: 'SmartPlates',
  authorId: 'system',
  isPublic: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// ========================================
// Main Component
// ========================================

export function RecipeDetailModal({
  meal,
  isOpen,
  onClose,
  className
}: RecipeDetailModalProps) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentServings, setCurrentServings] = useState<number>(1);

  // Fetch recipe details when meal changes
  useEffect(() => {
    if (!meal || !isOpen) {
      setRecipe(null);
      return;
    }

    const fetchRecipeDetails = async () => {
      setIsLoading(true);
      
      try {
        // Try to fetch full recipe details from API
        if (meal.recipeId && meal.recipeId !== 'custom') {
          const response = await fetch(`/api/recipes/${meal.recipeId}`);
          if (response.ok) {
            const fetchedRecipe = await response.json();
            setRecipe(fetchedRecipe);
            setIsLoading(false);
            return;
          }
        }
        
        // Fallback to mock recipe from meal data
        const mockRecipe = createMockRecipe(meal);
        setRecipe(mockRecipe);
      } catch (error) {
        console.error('Error fetching recipe details:', error);
        // Create fallback recipe from meal data
        const mockRecipe = createMockRecipe(meal);
        setRecipe(mockRecipe);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [meal, isOpen]);

  // Update current servings when meal or recipe changes
  useEffect(() => {
    if (meal) {
      setCurrentServings(meal.servings || recipe?.servings || 1);
    }
  }, [meal, recipe]);

  // Calculate scaling factor for ingredients
  const originalServings = meal?.servings || recipe?.servings || 1;
  const scalingFactor = currentServings / originalServings;

  // Helper functions for serving size adjustment
  const increaseServings = () => {
    setCurrentServings(prev => Math.min(prev + 1, 20)); // Max 20 servings
  };

  const decreaseServings = () => {
    setCurrentServings(prev => Math.max(prev - 1, 1)); // Min 1 serving
  };

  // Scale ingredient amounts
  const scaleIngredientAmount = (amount: string | number | undefined): string => {
    if (!amount) return '';
    
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return amount.toString();
    
    const scaledAmount = numericAmount * scalingFactor;
    
    // Format the scaled amount nicely
    if (scaledAmount < 1) {
      return (Math.round(scaledAmount * 8) / 8).toString(); // Round to 1/8ths for small amounts
    } else if (scaledAmount < 10) {
      return (Math.round(scaledAmount * 4) / 4).toString(); // Round to 1/4ths
    } else {
      return Math.round(scaledAmount).toString(); // Round to whole numbers for large amounts
    }
  };

  if (!meal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-4xl max-h-[90vh] p-0", className)}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <DialogTitle className="text-2xl font-bold mb-2">
                  {recipe?.title || meal.recipeName || 'Recipe Details'}
                </DialogTitle>
                <DialogDescription className="text-base">
                  {recipe?.description || meal.notes || 'Planned meal details'}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Open recipe in new tab
                    const recipeId = meal.recipeId || 'custom';
                    const url = `/recipe/${recipeId}`;
                    window.open(url, '_blank');
                  }}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Full Recipe
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 px-6 overflow-y-auto max-h-96">
            {isLoading ? (
              <div className="space-y-4 py-6">
                <div className="h-64 bg-muted rounded-lg animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                </div>
              </div>
            ) : recipe ? (
              <div className="space-y-6 py-6">
                {/* Recipe Image and Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image */}
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                    <Image
                      src={recipe.image || meal.image || '/placeholder-recipe.svg'}
                      alt={recipe.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      unoptimized={(recipe.image || meal.image || '').includes('spoonacular.com')}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-recipe.svg';
                      }}
                    />
                    {recipe.rating && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-white/90 text-gray-900 backdrop-blur-sm flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {recipe.rating.toFixed(1)}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Recipe Meta Info */}
                  <div className="space-y-4">
                    {/* Tags */}
                    {recipe.tags && recipe.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {recipe.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Recipe Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                          <div className="text-sm font-medium">Total Time</div>
                          <div className="text-lg font-bold">{recipe.totalTime || meal.cookingTime || 30}min</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                          <div className="text-sm font-medium">Servings</div>
                          <div className="flex items-center justify-center space-x-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={decreaseServings}
                              disabled={currentServings <= 1}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="text-lg font-bold min-w-[2rem] text-center">
                              {currentServings}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={increaseServings}
                              disabled={currentServings >= 20}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          {scalingFactor !== 1 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Scaled from {originalServings} serving{originalServings !== 1 ? 's' : ''}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <ChefHat className="w-6 h-6 mx-auto mb-2 text-primary" />
                          <div className="text-sm font-medium">Difficulty</div>
                          <div className="text-sm font-semibold capitalize">{recipe.difficulty}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <Utensils className="w-6 h-6 mx-auto mb-2 text-primary" />
                          <div className="text-sm font-medium">Category</div>
                          <div className="text-sm font-semibold">{recipe.category || 'Main Course'}</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Meal Planning Info */}
                    <Card className="bg-primary/5">
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">Meal Planning Details</h4>
                        <div className="space-y-1 text-sm">
                          <div>Originally planned servings: <span className="font-medium">{meal.servings || 1}</span></div>
                          <div>Current serving size: <span className="font-medium text-primary">{currentServings}</span></div>
                          {meal.notes && (
                            <div>Notes: <span className="italic">{meal.notes}</span></div>
                          )}
                          {scalingFactor !== 1 && (
                            <div className="text-blue-600 font-medium mt-2">
                              🔄 Ingredients scaled by {scalingFactor.toFixed(2)}x
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Separator />

                {/* Ingredients and Instructions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Ingredients */}
                  <div className="lg:col-span-1">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Ingredients</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {scalingFactor !== 1 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                              <div className="text-sm font-medium text-blue-800 mb-1">
                                📊 Ingredients Scaled for {currentServings} Servings
                              </div>
                              <div className="text-xs text-blue-600">
                                Original recipe was for {originalServings} serving{originalServings !== 1 ? 's' : ''}
                              </div>
                            </div>
                          )}
                          {Array.isArray(recipe.ingredients) ? recipe.ingredients.map((ingredient, index) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                              <span className="text-sm">{ingredient.name}</span>
                              <span className="text-sm font-medium text-primary">
                                {scaleIngredientAmount(ingredient.amount || ingredient.quantity)} {ingredient.unit}
                                {scalingFactor !== 1 && (
                                  <span className="text-xs text-muted-foreground ml-1">
                                    (was {ingredient.amount || ingredient.quantity})
                                  </span>
                                )}
                              </span>
                            </div>
                          )) : (
                            <div className="text-sm text-muted-foreground italic">
                              Ingredients will be loaded when available
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Instructions */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Instructions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {Array.isArray(recipe.instructions) ? recipe.instructions.map((instruction, index) => (
                            <div key={index} className="flex gap-4">
                              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                                {instruction.stepNumber || index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm">{instruction.instruction}</p>
                                {instruction.duration && (
                                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    {instruction.duration} min
                                  </div>
                                )}
                              </div>
                            </div>
                          )) : (
                            <div className="text-sm text-muted-foreground italic">
                              Cooking instructions will be loaded when available
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <ChefHat className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Recipe Details Not Available</h3>
                <p className="text-muted-foreground mb-4">
                  We couldn&apos;t load the full recipe details for &quot;{meal.recipeName}&quot;.
                </p>
                <div className="text-sm text-muted-foreground">
                  <div>Planned for {meal.servings || 1} servings</div>
                  {meal.notes && <div className="mt-1 italic">&quot;{meal.notes}&quot;</div>}
                </div>
              </div>
            )}
          </div>


        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RecipeDetailModal;