/**
 * Recipe Detail Modal Component
 * 
 * Shows complete recipe details exactly like the recipe detail page but as a modal.
 * Uses the same components and layout as /recipe/[id] page.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { MealSlot } from '@/types/meal-planning';
import type { Recipe } from '@/types/recipe';
import { RecipeHeader } from '@/components/recipe/RecipeHeader';
import { RecipeIngredients } from '@/components/recipe/RecipeIngredients';
import { RecipeInstructions } from '@/components/recipe/RecipeInstructions';
import { RecipeNutrition } from '@/components/recipe/RecipeNutrition';

interface RecipeDetailModalProps {
  meal: MealSlot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayName?: string;
  mealType?: string;
}

export function RecipeDetailModal({ meal, open, onOpenChange, dayName, mealType }: RecipeDetailModalProps) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (meal?.recipeId && open) {
      fetchRecipeDetails(meal.recipeId);
    }
  }, [meal?.recipeId, open]);

  const fetchRecipeDetails = async (recipeId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/recipes/${recipeId}`);
      if (response.ok) {
        const data = await response.json();
        setRecipe(data);
      } else {
        console.error('Failed to fetch recipe details');
      }
    } catch (error) {
      console.error('Error fetching recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!meal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="flex-shrink-0 p-6 pb-4">
          <DialogTitle className="text-2xl font-bold">
            {recipe?.title || meal.recipeName || 'Recipe Details'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 px-6 pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Loading recipe details...</span>
            </div>
          ) : recipe ? (
            <div className="space-y-8">
              {/* Recipe Header - Same as detail page */}
              <RecipeHeader recipe={recipe} />

              {/* Main Content Grid - Same as detail page */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Ingredients */}
                <div className="lg:col-span-1">
                  <RecipeIngredients recipe={recipe} />
                </div>

                {/* Right Column - Instructions */}
                <div className="lg:col-span-2">
                  {recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 ? (
                    <RecipeInstructions instructions={recipe.analyzedInstructions[0].steps} />
                  ) : (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Instructions</h2>
                      <div className="prose prose-sm max-w-none">
                        {recipe.summary ? (
                          <div dangerouslySetInnerHTML={{ __html: recipe.summary }} />
                        ) : (
                          <p className="text-muted-foreground">No instructions available</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Nutrition Information - Same as detail page */}
              {recipe.nutrition && (
                <div className="mt-8">
                  <RecipeNutrition nutrition={recipe.nutrition} />
                </div>
              )}

              <div className="mt-8 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Meal Planning Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Day:</span> {dayName || 'Unknown'}
                  </div>
                  <div>
                    <span className="font-medium">Meal Type:</span> {mealType || 'Unknown'}
                  </div>
                  <div>
                    <span className="font-medium">Servings:</span> {meal.servings || recipe.servings || 4}
                  </div>
                  <div>
                    <span className="font-medium">Cooking Time:</span> {recipe.readyInMinutes || 30} minutes
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Recipe details could not be loaded.</p>
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Meal Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Recipe:</span> {meal.recipeName || meal.name}
                  </div>
                  <div>
                    <span className="font-medium">Day:</span> {dayName || 'Unknown'}
                  </div>
                  <div>
                    <span className="font-medium">Meal Type:</span> {mealType || 'Unknown'}
                  </div>
                  <div>
                    <span className="font-medium">Servings:</span> {meal.servings || 4}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
