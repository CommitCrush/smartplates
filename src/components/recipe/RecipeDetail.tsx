
/**
 * Recipe Detail Component
 * 
 * Complete recipe display with all information.
 * Includes ingredients, instructions, nutrition, and interaction features.
 */

'use client';

import React, { useRef } from 'react';
import { Recipe } from '@/types/recipe';
import { RecipeHeader } from './RecipeHeader';
import { RecipeIngredients } from './RecipeIngredients';
import { RecipeInstructions } from './RecipeInstructions';
import { RecipeNutrition } from './RecipeNutrition';
import { RecipeActions } from './RecipeActions';

interface RecipeDetailProps {
  recipe: Recipe;
}

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  const recipeContentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="max-w-6xl mx-auto flex items-start space-x-4">
      {/* Main Recipe Content */}
      <div className="flex-1 max-w-4xl" ref={recipeContentRef}>
        <div className="space-y-8">
          <RecipeHeader recipe={recipe} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-1">
              <RecipeIngredients recipe={recipe} />
            </div>
            <div className="lg:col-span-2">
              <RecipeInstructions
                instructions={recipe.analyzedInstructions?.[0]?.steps || []}
              />
            </div>
          </div>

          {recipe.nutrition && (
            <div className="mt-8">
              <RecipeNutrition nutrition={recipe.nutrition} />
            </div>
          )}
        </div>
      </div>

      {/* Sticky Action Icons */}
      <div className="sticky top-28">
        <RecipeActions recipe={recipe} contentRef={recipeContentRef} />
      </div>
    </div>
  );
}

export default RecipeDetail;
