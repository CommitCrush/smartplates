/**
 * Recipe Ingredients Component
 * 
 * Displays recipe ingredients with quantities and units.
 * Includes serving size adjustment functionality.
 */

'use client';

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { RecipeIngredient } from '@/types/recipe';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RecipeIngredientsProps {
  ingredients: RecipeIngredient[];
  servings: number;
}

export function RecipeIngredients({ ingredients, servings: originalServings }: RecipeIngredientsProps) {
  const [currentServings, setCurrentServings] = useState(originalServings);

  const adjustServings = (increment: boolean) => {
    const newServings = increment ? currentServings + 1 : Math.max(1, currentServings - 1);
    setCurrentServings(newServings);
  };

  const getAdjustedQuantity = (originalQuantity: number) => {
    const ratio = currentServings / originalServings;
    const adjusted = originalQuantity * ratio;
    
    // Round to reasonable precision
    if (adjusted < 1) {
      return Math.round(adjusted * 100) / 100;
    } else if (adjusted < 10) {
      return Math.round(adjusted * 10) / 10;
    } else {
      return Math.round(adjusted);
    }
  };

  const formatQuantity = (quantity: number) => {
    // Convert decimals to fractions for common cooking measurements
    if (quantity === 0.25) return '¼';
    if (quantity === 0.33) return '⅓';
    if (quantity === 0.5) return '½';
    if (quantity === 0.67) return '⅔';
    if (quantity === 0.75) return '¾';
    
    // For other quantities, show as decimal if needed
    return quantity % 1 === 0 ? quantity.toString() : quantity.toString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Ingredients</CardTitle>
          
          {/* Serving Size Adjuster */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Servings:</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustServings(false)}
                disabled={currentServings <= 1}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="font-semibold min-w-[2rem] text-center">
                {currentServings}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustServings(true)}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ul className="space-y-3">
          {ingredients.map((ingredient, index) => (
            <li key={index} className="flex items-start gap-3 py-2 border-b border-border last:border-b-0">
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-primary">
                    {formatQuantity(getAdjustedQuantity((ingredient as any).quantity))}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {(ingredient as any).unit}
                  </span>
                  <span className="font-medium">
                    {(ingredient as any).name}
                  </span>
                </div>
                {ingredient.notes && (
                  <p className="text-sm text-muted-foreground mt-1 italic">
                    {ingredient.notes}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* Serving size change notice */}
        {currentServings !== originalServings && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Ingredients adjusted for {currentServings} servings 
              (original recipe serves {originalServings})
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
