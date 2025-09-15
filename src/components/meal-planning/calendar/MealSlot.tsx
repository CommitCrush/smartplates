/**
 * MealSlot Component
 * 
 * Individual meal slot component with drag & drop functionality
 * Displays recipe information and provides interaction options
 */

'use client';

import React, { useState } from 'react';
import { Clock, Users, X, Edit3, MoreVertical } from 'lucide-react';
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
  isToday = false,
  className
}: MealSlotComponentProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Drag & Drop functionality
  const [{ isDragging }, drag] = useDrag({
    type: 'meal',
    item: (): DragItem => ({
      type: 'meal',
      meal,
      mealType,
      dayIndex,
      mealIndex
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
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
  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={cn(
        'relative group',
        'bg-white border border-gray-200 rounded-lg p-3',
        'hover:border-gray-300 hover:shadow-sm transition-all duration-200',
        'cursor-move',
        isDragging && 'opacity-50 rotate-2 scale-105',
        isOver && 'ring-2 ring-primary ring-opacity-50',
        isToday && 'border-primary border-opacity-30',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Recipe Name */}
      <div className="flex items-start justify-between mb-2">
        <h5 className="font-medium text-sm leading-tight pr-2 flex-1">
          {meal.recipeName || 'Unnamed Recipe'}
        </h5>
        
        {/* Action Menu */}
        {isHovered && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
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

      {/* Recipe Details */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          {/* Cooking Time */}
          {totalTime > 0 && (
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{totalTime}min</span>
            </div>
          )}

          {/* Servings */}
          <div className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>{meal.servings || 1}</span>
            {onUpdate && (
              <div className="ml-1 space-x-1">
                <button
                  onClick={() => handleServingsChange((meal.servings || 1) - 1)}
                  disabled={(meal.servings || 1) <= 1}
                  className="w-4 h-4 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center text-xs"
                >
                  −
                </button>
                <button
                  onClick={() => handleServingsChange((meal.servings || 1) + 1)}
                  disabled={(meal.servings || 1) >= 20}
                  className="w-4 h-4 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center text-xs"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recipe ID Badge (for development) */}
        {meal.recipeId && (
          <Badge variant="secondary" className="text-xs px-1 py-0">
            {meal.recipeId.split('-')[0]}
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
  );
}

export default MealSlotComponent;