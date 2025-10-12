/**
 * Recipe Ingredients Component
 * 
 * Displays recipe ingredients with quantities and units.
 * Includes serving size adjustment functionality.
 */

'use client';

import React from 'react';
import { Plus, Minus, Globe } from 'lucide-react';
import { Recipe } from '@/types/recipe';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type UnitSystem = 'us' | 'metric';

interface UnitConversion {
  [key: string]: {
    metric?: { unit: string; factor: number };
    us?: { unit: string; factor: number };
  };
}

const unitConversions: UnitConversion = {
  'cup': { metric: { unit: 'ml', factor: 236.588 } },
  'cups': { metric: { unit: 'ml', factor: 236.588 } },
  'fluid ounce': { metric: { unit: 'ml', factor: 29.5735 } },
  'fluid ounces': { metric: { unit: 'ml', factor: 29.5735 } },
  'fl oz': { metric: { unit: 'ml', factor: 29.5735 } },
  'tablespoon': { metric: { unit: 'ml', factor: 14.7868 } },
  'tablespoons': { metric: { unit: 'ml', factor: 14.7868 } },
  'tbsp': { metric: { unit: 'ml', factor: 14.7868 } },
  'teaspoon': { metric: { unit: 'ml', factor: 4.92892 } },
  'teaspoons': { metric: { unit: 'ml', factor: 4.92892 } },
  'tsp': { metric: { unit: 'ml', factor: 4.92892 } },
  'pint': { metric: { unit: 'ml', factor: 473.176 } },
  'pints': { metric: { unit: 'ml', factor: 473.176 } },
  'quart': { metric: { unit: 'l', factor: 0.946353 } },
  'quarts': { metric: { unit: 'l', factor: 0.946353 } },
  'gallon': { metric: { unit: 'l', factor: 3.78541 } },
  'gallons': { metric: { unit: 'l', factor: 3.78541 } },
  'ounce': { metric: { unit: 'g', factor: 28.3495 } },
  'ounces': { metric: { unit: 'g', factor: 28.3495 } },
  'oz': { metric: { unit: 'g', factor: 28.3495 } },
  'pound': { metric: { unit: 'g', factor: 453.592 } },
  'pounds': { metric: { unit: 'g', factor: 453.592 } },
  'lb': { metric: { unit: 'g', factor: 453.592 } },
  'lbs': { metric: { unit: 'g', factor: 453.592 } },
  'fahrenheit': { metric: { unit: '°C', factor: 1 } }, 
  'f': { metric: { unit: '°C', factor: 1 } },
};

interface RecipeIngredientsProps {
  recipe: Recipe;
  currentServings: number;
  setCurrentServings: (servings: number) => void;
}

export function RecipeIngredients({ recipe, currentServings, setCurrentServings }: RecipeIngredientsProps) {
  const [unitSystem, setUnitSystem] = React.useState<UnitSystem>('us');
  const ingredients = recipe.extendedIngredients || [];

  const adjustServings = (increment: boolean) => {
    const newServings = increment ? currentServings + 1 : Math.max(1, currentServings - 1);
    setCurrentServings(newServings);
  };

  const toggleUnitSystem = () => {
    setUnitSystem(prev => prev === 'us' ? 'metric' : 'us');
  };

  const convertUnit = (amount: number, originalUnit: string): { amount: number; unit: string } => {
    if (unitSystem === 'us') {
      return { amount, unit: originalUnit };
    }
    const unitKey = originalUnit.toLowerCase().trim();
    const conversion = unitConversions[unitKey];
    if (conversion && conversion.metric) {
      const convertedAmount = amount * conversion.metric.factor;
      let finalAmount = convertedAmount;
      let finalUnit = conversion.metric.unit;
      if (finalUnit === 'ml' && convertedAmount >= 1000) {
        finalAmount = convertedAmount / 1000;
        finalUnit = 'l';
      }
      if (finalUnit === 'g' && convertedAmount >= 1000) {
        finalAmount = convertedAmount / 1000;
        finalUnit = 'kg';
      }
      return { amount: Math.round(finalAmount * 100) / 100, unit: finalUnit };
    }
    return { amount, unit: originalUnit };
  };

  const getAdjustedQuantity = (originalQuantity: number) => {
    if (!originalQuantity || isNaN(originalQuantity)) return 0;
    const ratio = currentServings / recipe.servings;
    const adjusted = originalQuantity * ratio;
    if (adjusted < 1) return Math.round(adjusted * 100) / 100;
    if (adjusted < 10) return Math.round(adjusted * 10) / 10;
    return Math.round(adjusted);
  };

  const formatQuantity = (quantity: number) => {
    if (!quantity || quantity === 0) return '';
    if (unitSystem === 'us') {
      if (quantity === 0.25) return '¼';
      if (quantity === 0.33) return '⅓';
      if (quantity === 0.5) return '½';
      if (quantity === 0.67) return '⅔';
      if (quantity === 0.75) return '¾';
    }
    return quantity % 1 === 0 ? quantity.toString() : quantity.toString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Ingredients</CardTitle>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Servings:</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => adjustServings(false)} disabled={currentServings <= 1} className="h-8 w-8 p-0">
                <Minus className="h-4 w-4" />
              </Button>
              <span className="font-semibold min-w-[2rem] text-center">{currentServings}</span>
              <Button variant="outline" size="sm" onClick={() => adjustServings(true)} className="h-8 w-8 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <Button variant="outline" size="sm" onClick={toggleUnitSystem} className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="text-sm">{unitSystem === 'us' ? 'Switch to Metric (g, ml, l)' : 'Switch to US (cups, oz, lb)'}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {ingredients.map((ingredient, index) => {
            const adjustedAmount = getAdjustedQuantity(ingredient.amount);
            const converted = convertUnit(adjustedAmount, ingredient.unit);
            const formattedAmount = formatQuantity(converted.amount);
            const uniqueKey = `ingredient-${ingredient.id || 'no-id'}-${ingredient.name?.replace(/[^a-zA-Z0-9]/g, '') || 'unnamed'}-${index}`;
            return (
              <li key={uniqueKey} className="flex items-start gap-3 py-2 border-b border-border last:border-b-0">
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    {formattedAmount && <span className="font-medium text-primary">{formattedAmount}</span>}
                    {converted.unit && <span className="text-sm text-muted-foreground">{converted.unit}</span>}
                    <span className="font-medium">{ingredient.name}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
