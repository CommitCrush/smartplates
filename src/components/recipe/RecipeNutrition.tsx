/**
 * Recipe Nutrition Component
 * 
 * Displays nutritional information for the recipe.
 */

'use client';

import React from 'react';
import { Activity, Zap, Beef, Wheat, Droplet } from 'lucide-react';
import { RecipeNutrition as NutritionType } from '@/types/recipe';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecipeNutritionProps {
  nutrition: NutritionType;
}

export function RecipeNutrition({ nutrition }: RecipeNutritionProps) {
  const nutritionItems = [
    {
      label: 'Calories',
      value: nutrition.calories,
      unit: 'kcal',
      icon: Zap,
      color: 'text-orange-600'
    },
    {
      label: 'Protein',
      value: nutrition.protein,
      unit: 'g',
      icon: Beef,
      color: 'text-red-600'
    },
    {
      label: 'Carbs',
      value: nutrition.carbs,
      unit: 'g',
      icon: Wheat,
      color: 'text-yellow-600'
    },
    {
      label: 'Fat',
      value: nutrition.fat,
      unit: 'g',
      icon: Droplet,
      color: 'text-blue-600'
    },
    {
      label: 'Fiber',
      value: nutrition.fiber,
      unit: 'g',
      icon: Activity,
      color: 'text-green-600'
    }
  ].filter(item => item.value !== undefined && item.value !== null);

  if (nutritionItems.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Nutrition Facts
        </CardTitle>
        <p className="text-sm text-muted-foreground">Per serving</p>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {nutritionItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="text-center p-4 bg-muted/30 rounded-lg">
                <Icon className={`h-6 w-6 mx-auto mb-2 ${item.color}`} />
                <p className="text-2xl font-bold">
                  {item.value}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {item.unit}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground mt-4 text-center">
          * Nutritional values are approximate and may vary based on ingredients and preparation methods.
        </p>
      </CardContent>
    </Card>
  );
}
