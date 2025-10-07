/**
 * Recipe Detail Component
 * 
 * Complete recipe display with all information.
 * Includes ingredients, instructions, nutrition, and interaction features.
 */

'use client';

import React from 'react';
import { Recipe } from '@/types/recipe';
import { RecipeHeader } from './RecipeHeader';
import { RecipeIngredients } from './RecipeIngredients';
import { RecipeInstructions } from './RecipeInstructions';
import { RecipeNutrition } from './RecipeNutrition';

interface RecipeDetailProps {
  recipe: Recipe;
}

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Recipe Header */}
      <RecipeHeader recipe={recipe} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ingredients */}
        <div className="lg:col-span-1">
          <RecipeIngredients 
            recipe={recipe}
          />
        </div>

        {/* Instructions */}
        <div className="lg:col-span-2">
          <RecipeInstructions 
            instructions={recipe.analyzedInstructions?.[0]?.steps || []} 
          />
        </div>
      </div>

      {/* Nutrition Information */}
      {recipe.nutrition && (
        <RecipeNutrition nutrition={recipe.nutrition} />
      )}
    </div>
  );
}

export default RecipeDetail;
