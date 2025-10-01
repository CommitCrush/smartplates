/**
 * MealSlot Component
 * 
 * Individual meal slot component with drag & drop functionality
 * Displays recipe information and provides interaction options
 */

'use client';

import React, { useState } from 'react';
import { Clock, Users, X, Edit3, MoreVertical, Copy } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { MealSlot } from '@/types/meal-planning';
import { useDrag, useDrop } from 'react-dnd';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ========================================
// Types
// ========================================

interface MealSlotComponentProps {
  meal: MealSlot;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  dayIndex: number;
  mealIndex: number;
  onRemove?: () => void;
  onUpdate?: (updatedMeal: Partial<MealSlot>) => void;
  onEdit?: () => void;
  onShowRecipe?: (meal: MealSlot) => void;
  onCopyRecipe?: (meal: MealSlot) => void;
  isToday?: boolean;
  className?: string;
}

interface DragItem {
  type: string;
  meal: MealSlot;
  mealType: string;
  dayIndex: number;
  mealIndex: number;
}

// ========================================
// Main Component
// ========================================

export function MealSlotComponent({
  meal,
  mealType,
  dayIndex,
  mealIndex,
  onRemove,
  onUpdate,
  onEdit,
  onShowRecipe,
  onCopyRecipe,
  isToday = false,
  className
}: MealSlotComponentProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Drag & Drop functionality
  const [{ isDragging }, drag] = useDrag({
    type: 'meal',
    item: (): DragItem => {
      console.log('🏗️ Drag starting:', meal.recipeName, { mealType, dayIndex, mealIndex });
      return {
        type: 'meal',
        meal,
        mealType,
        dayIndex,
        mealIndex
      };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      console.log('🏁 Drag ended:', { item, dropResult, didDrop: monitor.didDrop() });
    }
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'meal',
    drop: (item: DragItem) => {
      // Handle meal reordering logic here
      console.log('Dropped meal:', item, 'onto:', { mealType, dayIndex, mealIndex });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Calculate total time
  const totalTime = (meal.cookingTime || 0) + (meal.prepTime || 0);

  // Handle servings update
  const handleServingsChange = (newServings: number) => {
    if (onUpdate && newServings > 0 && newServings <= 20) {
      onUpdate({ servings: newServings });
    }
  };

  const ref = React.useRef<HTMLDivElement>(null);
  
  // Ensure proper ref connection for React 19 compatibility
  React.useEffect(() => {
    if (ref.current) {
      drag(drop(ref.current));
    }
  }, [drag, drop]);

  return (
    <div>
      {/* Recipe Card - EVERYTHING INSIDE HERE INCLUDING TITLE */}
      <div
        ref={ref}
        className={cn(
          'relative group',
          'bg-white border border-gray-200 rounded-lg p-3',
          'hover:border-gray-300 hover:shadow-sm transition-all duration-200',
          onShowRecipe ? 'cursor-pointer hover:bg-gray-50' : 'cursor-move',
          isDragging && 'opacity-50 rotate-2 scale-105',
          isOver && 'ring-2 ring-primary ring-opacity-50',
          isToday && 'border-primary border-opacity-30',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => {
          // Don't trigger recipe modal if clicking on action buttons
          if ((e.target as HTMLElement).closest('button, [role="menuitem"]')) {
            return;
          }
          onShowRecipe?.(meal);
        }}
      >
        {/* Recipe Title - INSIDE the card */}
        <div className="flex items-start justify-between mb-2">
          <h5 className="font-semibold text-sm leading-tight text-gray-900 truncate pr-2">
            {meal.recipeName || 'Unnamed Recipe'}
          </h5>
          
          {/* Action Menu */}
          {isHovered && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Recipe
                  </DropdownMenuItem>
                )}
                {onCopyRecipe && (
                  <DropdownMenuItem onClick={() => onCopyRecipe(meal)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Recipe
                  </DropdownMenuItem>
                )}
                {onRemove && (
                  <DropdownMenuItem 
                    onClick={onRemove}
                    className="text-red-600 focus:text-red-600"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {/* Recipe Image & Source Info */}
        <div className="flex items-start gap-3 mb-2">
          {/* Enhanced Recipe Image */}
          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden shadow-sm">
            {meal.image ? (
              <Image 
                src={meal.image} 
                alt={meal.recipeName || 'Recipe image'}
                width={64}
                height={64}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                unoptimized={meal.image.startsWith('http')}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-slate-50 to-slate-100">
                {/* Meal type emoji based on mealType */}
                <span className="text-2xl">
                  {mealType === 'breakfast' && '🍳'}
                  {mealType === 'lunch' && '🥗'}
                  {mealType === 'dinner' && '🍽️'}
                  {mealType === 'snacks' && '🍎'}
                </span>
              </div>
            )}
          </div>

          {/* Recipe Source Info */}
          <div className="flex-1 min-w-0">
            {meal.recipeId && (
              <p className="text-xs text-gray-500 truncate">
                {meal.recipeId.includes('spoon') ? 'Spoonacular Recipe' : 'Custom Recipe'}
              </p>
            )}
          </div>
        </div>

        {/* Enhanced Recipe Details - INSIDE THE CARD */}
        <div className="meal-details-inside-card flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            {/* Cooking Time */}
            {totalTime > 0 && (
              <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-md">
                <Clock className="h-3 w-3" />
                <span className="font-medium">{totalTime}min</span>
              </div>
            )}

            {/* Servings - INSIDE CARD */}
            <div className="servings-inside-card flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-md">
              <Users className="h-3 w-3" />
              <span className="font-medium">{meal.servings || 1}</span>
              {onUpdate && (
                <div className="ml-1 space-x-1">
                  <button
                    onClick={() => handleServingsChange((meal.servings || 1) - 1)}
                    disabled={(meal.servings || 1) <= 1}
                    className="w-4 h-4 rounded-full bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs border border-gray-200 transition-colors"
                    title="Decrease servings"
                  >
                    −
                  </button>
                  <button
                    onClick={() => handleServingsChange((meal.servings || 1) + 1)}
                    disabled={(meal.servings || 1) >= 20}
                    className="w-4 h-4 rounded-full bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs border border-gray-200 transition-colors"
                    title="Increase servings"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recipe Type Badge */}
          {meal.recipeId && (
            <Badge 
              variant={meal.recipeId.includes('spoon') ? 'default' : 'secondary'} 
              className="text-xs px-2 py-0.5"
            >
              {meal.recipeId.includes('spoon') ? 'API' : 'Custom'}
            </Badge>
          )}
        </div>

        {/* Notes */}
        {meal.notes && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-600 italic">
              {meal.notes}
            </p>
          </div>
        )}

        {/* Drag Indicator */}
        {isDragging && (
          <div className="absolute inset-0 bg-primary bg-opacity-10 rounded-lg border-2 border-primary border-dashed flex items-center justify-center">
            <span className="text-xs text-primary font-medium">Moving...</span>
          </div>
        )}

        {/* Drop Indicator */}
        {isOver && (
          <div className="absolute inset-0 bg-green-500 bg-opacity-10 rounded-lg border-2 border-green-500 border-dashed flex items-center justify-center">
            <span className="text-xs text-green-600 font-medium">Drop here</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default MealSlotComponent;