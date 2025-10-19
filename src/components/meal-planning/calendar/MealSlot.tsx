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
  const [isDragStarted, setIsDragStarted] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });

    // Drag & Drop functionality - TEMPORARILY DISABLED FOR TESTING
  const [{ isDragging }, drag] = useDrag({
    type: 'meal',
    item: { meal, mealType, dayIndex, mealIndex },
    canDrag: true, // Enable drag functionality
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (monitor.didDrop()) {
        console.log('�️ Drag ending:', item, { result: monitor.getDropResult() });
      }
    }
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'meal',
    canDrop: (item: DragItem) => {
      // Don't allow dropping on same position
      return !(item.dayIndex === dayIndex && item.mealIndex === mealIndex && item.mealType === mealType);
    },
    drop: (item: DragItem) => {
      // Handle meal reordering logic here
      console.log('Dropped meal:', item, 'onto:', { mealType, dayIndex, mealIndex });
      return { targetMealType: mealType, targetDayIndex: dayIndex, targetMealIndex: mealIndex };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Calculate total time
  const totalTime = (meal.cookingTime || 0) && (meal.prepTime || 0);

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
    <div
      ref={ref}
      className={cn(
        'relative bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2.5',
        'hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all duration-200',
        onShowRecipe ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700' : 'cursor-default',
        isDragging && 'opacity-50 rotate-2 scale-105',
        isOver && 'ring-2 ring-primary ring-opacity-50',
        isToday && 'border-primary border-opacity-30',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        console.log('🍽️ MealSlot: Direct onClick called', { 
          meal: meal.recipeName, 
          hasOnShowRecipe: !!onShowRecipe,
          target: e.target 
        });
        
        // Don't trigger recipe modal if clicking on action buttons
        if ((e.target as HTMLElement).closest('button, [role="menuitem"]')) {
          console.log('🍽️ MealSlot: Click ignored - clicked on action button');
          return;
        }
        
        if (onShowRecipe) {
          console.log('🍽️ MealSlot: Calling onShowRecipe');
          onShowRecipe(meal);
        } else {
          console.log('🍽️ MealSlot: No onShowRecipe function provided');
        }
      }}
    >
      {/* Optimized Card Layout for Weekly View */}
      <div className="space-y-2">
        {/* Top Row: Image and Title */}
        <div className="flex items-start gap-2">
          {/* Recipe Image - Responsive */}
          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-md overflow-hidden shadow-sm">
            {meal.image ? (
              <Image 
                src={meal.image} 
                alt={meal.recipeName || 'Recipe image'}
                width={48}
                height={48}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                unoptimized={meal.image.startsWith('http')}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-700 dark:to-gray-800">
                <span className="text-sm sm:text-lg">
                  {mealType === 'breakfast' && '🍳'}
                  {mealType === 'lunch' && '🥗'}
                  {mealType === 'dinner' && '🍽️'}
                  {mealType === 'snacks' && '🍎'}
                </span>
              </div>
            )}
          </div>

          {/* Title and Action Buttons */}
          <div className="flex-1 flex items-start justify-between min-w-0">
            <h5 className="font-semibold text-xs sm:text-sm leading-tight text-gray-900 dark:text-gray-100 truncate pr-1">
              {meal.recipeName || 'Unnamed Recipe'}
            </h5>
            
            {/* Action Buttons - Mobile Optimized */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              {/* Edit Button - Weekly View */}
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                  title="Edit recipe"
                >
                  <Edit3 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-600 dark:text-blue-400" />
                </Button>
              )}
              
              {/* Copy Button */}
              {onCopyRecipe && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopyRecipe(meal);
                  }}
                  className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
                  title="Copy recipe"
                >
                  <Copy className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600 dark:text-green-400" />
                </Button>
              )}
              
              {/* Delete Button - Weekly View */}
              {onRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                  title="Remove recipe"
                >
                  <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-600 dark:text-red-400" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row: Time and Servings - Mobile Optimized */}
        <div className="flex items-center justify-between">
          {/* Time and Servings - Responsive */}
          <div className="flex items-center space-x-1 sm:space-x-2 text-xs">
            {/* Cooking Time */}
            {totalTime > 0 && (
              <div className="flex items-center space-x-1 bg-gray-50 dark:bg-gray-700 px-1 sm:px-1.5 py-0.5 rounded">
                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-500 dark:text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300 text-xs">{totalTime}min</span>
              </div>
            )}

            {/* Servings - Responsive Editable */}
            <div className="flex items-center space-x-1 bg-blue-50 dark:bg-gray-700 px-1 sm:px-1.5 py-0.5 rounded">
              <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-blue-700 dark:text-blue-300 text-xs">{meal.servings || 1}</span>
              {onUpdate && (
                <div className="ml-0.5 sm:ml-1 flex space-x-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleServingsChange((meal.servings || 1) - 1);
                    }}
                    disabled={(meal.servings || 1) <= 1}
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-white dark:bg-[#a8b89c] hover:bg-blue-100 dark:hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs border border-blue-200 dark:border-blue-700 transition-colors"
                    title="Decrease servings"
                  >
                    <span className="text-xs leading-none">−</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleServingsChange((meal.servings || 1) + 1);
                    }}
                    disabled={(meal.servings || 1) >= 20}
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-white dark:bg-[#a8b89c] hover:bg-blue-100 dark:hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs border border-blue-200 dark:border-blue-700 transition-colors"
                    title="Increase servings"
                  >
                    <span className="text-xs leading-none">+</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notes - Compact */}
            {/* Notes - Compact */}
      {meal.notes && (
        <div className="mt-2 pt-1.5 border-t border-[#EFF4E6] dark:border-[#74765D]">
          <p className="text-xs text-[#7D966D] dark:text-[#C1D3AF] italic truncate">
            {meal.notes}
          </p>
        </div>
      )}

      {/* Drag Indicator */}
      {isDragging && (
        <div className="absolute inset-0 bg-[#F96850] dark:bg-[#F16B59] bg-opacity-10 rounded-lg border-2 border-[#F96850] dark:border-[#F16B59] border-dashed flex items-center justify-center">
          <span className="text-xs text-[#F96850] dark:text-[#F16B59] font-medium">Moving...</span>
        </div>
      )}

      {/* Drop Indicator */}
      {isOver && (
        <div className="absolute inset-0 bg-[#AAC91] dark:bg-[#C1D3AF] bg-opacity-10 rounded-lg border-2 border-[#AAC91] dark:border-[#C1D3AF] border-dashed flex items-center justify-center">
          <span className="text-xs text-[#7D966D] dark:text-[#373739] font-medium">Drop here</span>
        </div>
      )}
    </div>
  );
}

export default MealSlotComponent;