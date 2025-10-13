/**
 * Community Recipe Detail Component
 * 
 * Displays community-created recipes with full Spoonacular-compatible functionality.
 * Includes serving adjustment, action buttons (PDF, Print, Grocery), and same layout.
 */

'use client';

import React, { useRef, useState } from 'react';
import { Recipe } from '@/types/recipe';
import { CommunityRecipeDetailProps, CommunityRecipe } from '@/types/components';
import { RecipeHeader } from './RecipeHeader';
import { RecipeIngredients } from './RecipeIngredients';
import { RecipeInstructions } from './RecipeInstructions';
import { RecipeNutrition } from './RecipeNutrition';
import { RecipeActions } from './RecipeActions';

export function CommunityRecipeDetail({ recipe }: CommunityRecipeDetailProps) {
  const recipeContentRef = useRef<HTMLDivElement>(null);
  const [currentServings, setCurrentServings] = useState<number>(recipe.servings || 1);
  
  // Transform community recipe data to match Spoonacular format
  const normalizedRecipe: Recipe = {
    ...recipe,
    // Keep original ingredients field for fallback
    ingredients: recipe.ingredients,
    
    // Ensure ingredients are in extendedIngredients format
    extendedIngredients: recipe.ingredients?.map((ingredient, index) => {
      if (typeof ingredient === 'string') {
        // Try to parse string ingredients like "1 cup flour"
        const parts = ingredient.split(' ');
        const amount = parseFloat(parts[0]) || 1;
        const unit = parts[1] || '';
        const name = parts.slice(2).join(' ') || ingredient;
        
        return {
          id: index,
          name: name,
          amount: amount,
          unit: unit,
          original: ingredient,
        };
      }
      return {
        id: ingredient.id || index,
        name: ingredient.name,
        amount: typeof ingredient.amount === 'string' ? parseFloat(ingredient.amount) || 1 : (ingredient.amount || 1),
        unit: ingredient.unit || '',
        original: `${ingredient.amount || 1} ${ingredient.unit || ''} ${ingredient.name}`.trim(),
      };
    }) || [],
    
    // Ensure instructions are in analyzedInstructions format
    analyzedInstructions: [{
      name: '',
      steps: recipe.instructions?.map((instruction, index) => {
        if (typeof instruction === 'string') {
          return {
            number: index + 1,
            step: instruction,
          };
        }
        return {
          number: instruction.stepNumber || index + 1,
          step: instruction.instruction,
        };
      }) || [],
    }],
    
    // Ensure timing information
    readyInMinutes: recipe.readyInMinutes || 30,
    preparationMinutes: recipe.preparationMinutes || 15,
    cookingMinutes: recipe.cookingMinutes || 15,
    
    // Ensure source is marked as community
    source: recipe.source || 'community',
  };

  return (
    <div className="max-w-6xl mx-auto flex items-start space-x-4">
      {/* Main Recipe Content */}
      <div className="flex-1 max-w-4xl" ref={recipeContentRef}>
        <div className="space-y-8">
          <RecipeHeader recipe={normalizedRecipe} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-1">
              <RecipeIngredients 
                recipe={normalizedRecipe} 
                currentServings={currentServings} 
                setCurrentServings={setCurrentServings} 
              />
            </div>
            <div className="lg:col-span-2">
              <RecipeInstructions 
                instructions={normalizedRecipe.analyzedInstructions?.[0]?.steps || []}
              />
            </div>
          </div>

          {normalizedRecipe.nutrition && (
            <div className="mt-8">
              <RecipeNutrition nutrition={normalizedRecipe.nutrition} />
            </div>
          )}
        </div>
      </div>

      {/* Sticky Action Icons - same as Spoonacular recipes */}
      <div className="sticky top-28">
        <RecipeActions 
          recipe={normalizedRecipe} 
          contentRef={recipeContentRef} 
          currentServings={currentServings} 
        />
      </div>
    </div>
  );
}

export default CommunityRecipeDetail;