/**
 * DayColumn Component
 * 
 * Displays a single day's meals with drag & drop functionality
 * Includes breakfast, lunch, dinner, and snacks sections
 */

'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DayMeals, MealSlot } from '@/types/meal-planning';
import { MealSlotComponent } from './MealSlot';
import { useDrop } from 'react-dnd';

// ========================================
// Types
// ========================================

interface DayColumnProps {
  dayIndex: number;
  date: Date;
  meals?: DayMeals;
  onMealsChange?: (meals: DayMeals) => void;
  onAddRecipe?: (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => void;
  onCrossDayMealMove?: (
    draggedMeal: any,
    sourceDayIndex: number,
    sourceMealType: string,
    sourceMealIndex: number,
    targetDayIndex: number,
    targetMealType: string
  ) => void;
  onShowRecipe?: (meal: MealSlot, dayIndex: number, mealType: string) => void;
  onCopyRecipe?: (meal: MealSlot) => void;
  copiedRecipe?: MealSlot | null;
  isToday?: boolean;
  className?: string;
}

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

// ========================================
// Main Component
// ========================================

export function DayColumn({
  dayIndex,
  date,
  meals,
  onMealsChange,
  onAddRecipe,
  onCrossDayMealMove,
  onShowRecipe,
  onCopyRecipe,
  copiedRecipe,
  isToday = false,
  className
}: DayColumnProps) {
  // Default meals structure
  const defaultMeals: DayMeals = {
    date,
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
  };

  const dayMeals = meals || defaultMeals;

  // Handle adding a meal
  const handleAddMeal = (mealType: MealType) => {
    if (onAddRecipe) {
      onAddRecipe(dayIndex, mealType);
    }
  };

  // Handle removing a meal
  const handleRemoveMeal = (mealType: MealType, mealIndex: number) => {
    if (!onMealsChange) return;

    const updatedMeals = {
      ...dayMeals,
      [mealType]: dayMeals[mealType].filter((_, index) => index !== mealIndex)
    };

    onMealsChange(updatedMeals);
  };

  // Handle meal updates
  const handleMealUpdate = (mealType: MealType, mealIndex: number, updatedMeal: Partial<MealSlot>) => {
    if (!onMealsChange) return;

    const updatedMeals = {
      ...dayMeals,
      [mealType]: dayMeals[mealType].map((meal, index) => 
        index === mealIndex ? { ...meal, ...updatedMeal } : meal
      )
    };

    onMealsChange(updatedMeals);
  };

  // Handle drag and drop meal movement
  const handleMealMove = (
    draggedMeal: MealSlot,
    sourceMealType: MealType,
    sourceDayIndex: number,
    sourceMealIndex: number,
    targetMealType: MealType
  ) => {
    if (!onMealsChange) return;

    // Only handle moves within the same day for now
    if (sourceDayIndex === dayIndex) {
      const updatedMeals = { ...dayMeals };
      
      // Remove from source
      updatedMeals[sourceMealType] = updatedMeals[sourceMealType].filter((_, index) => index !== sourceMealIndex);
      
      // Add to target
      updatedMeals[targetMealType] = [...updatedMeals[targetMealType], draggedMeal];
      
      onMealsChange(updatedMeals);
    }
  };

  // Meal type configurations
  const mealTypes: { 
    key: MealType; 
    label: string; 
    icon: string; 
    color: string;
    bgColor: string;
  }[] = [
    { 
      key: 'breakfast', 
      label: 'Breakfast', 
      icon: '🌅', 
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100'
    },
    { 
      key: 'lunch', 
      label: 'Lunch', 
      icon: '☀️', 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 hover:bg-yellow-100'
    },
    { 
      key: 'dinner', 
      label: 'Dinner', 
      icon: '🌙', 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    },
    { 
      key: 'snacks', 
      label: 'Snacks', 
      icon: '🍎', 
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100'
    }
  ];

  // Create drop zone component for each meal type
  const MealDropZone = ({ mealType, children }: { mealType: MealType; children: React.ReactNode }) => {
    const [{ isOver }, drop] = useDrop({
      accept: 'meal',
      drop: (item: { meal: MealSlot; mealType: MealType; dayIndex: number; mealIndex: number }) => {
        console.log('📍 Drop detected:', { 
          draggedFrom: { dayIndex: item.dayIndex, mealType: item.mealType }, 
          droppedTo: { dayIndex, mealType },
          meal: item.meal.recipeName
        });
        
        // Check if it's a cross-day move
        if (item.dayIndex !== dayIndex && onCrossDayMealMove) {
          console.log('🔄 Cross-day move');
          onCrossDayMealMove(
            { meal: item.meal },
            item.dayIndex,
            item.mealType,
            item.mealIndex,
            dayIndex,
            mealType
          );
        } else {
          console.log('🔃 Same day move');
          // Same day move
          handleMealMove(item.meal, item.mealType, item.dayIndex, item.mealIndex, mealType);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });

    return (
      <div
        ref={drop as any}
        className={cn(
          'min-h-[60px] p-2 rounded-lg transition-colors border-2 border-dashed',
          isOver 
            ? 'border-primary-400 bg-primary-50' 
            : 'border-transparent'
        )}
      >
        {children}
      </div>
    );
  };

  return (
    <div className={cn('space-y-3', className)}>
      {mealTypes.map(({ key, label, icon, color, bgColor }) => {
        const mealList = dayMeals[key] || [];
        
        return (
          <div key={key} className="space-y-2">
            {/* Meal Type Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h4 className={cn('text-sm font-medium', color)}>
                  {label}
                </h4>
              </div>
              
              {/* Add Meal Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAddMeal(key)}
                className={cn(
                  'h-6 w-6 p-0 rounded-full transition-colors',
                  bgColor
                )}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {/* Meal Slots */}
            <MealDropZone mealType={key}>
              <div className="space-y-1.5">
                {mealList.length > 0 ? (
                  mealList.map((meal, mealIndex) => (
                    <MealSlotComponent
                      key={`${key}-${mealIndex}`}
                      meal={meal}
                      mealType={key}
                      dayIndex={dayIndex}
                      mealIndex={mealIndex}
                      onRemove={() => handleRemoveMeal(key, mealIndex)}
                      onUpdate={(updatedMeal) => handleMealUpdate(key, mealIndex, updatedMeal)}
                      onShowRecipe={(meal) => {
                        console.log('🔍 DayColumn: onShowRecipe called', { meal: meal.recipeName, dayIndex, mealType: key });
                        onShowRecipe?.(meal, dayIndex, key);
                      }}
                      onCopyRecipe={onCopyRecipe}
                      isToday={isToday}
                    />
                  ))
                ) : (
                  // Empty state
                  <div 
                    className={cn(
                      'border-2 border-dashed rounded-lg p-3',
                      'flex flex-col items-center justify-center text-center',
                      'transition-colors cursor-pointer group min-h-[50px]',
                      copiedRecipe 
                        ? 'border-green-300 bg-green-50 hover:border-green-400 hover:bg-green-100' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    )}
                    onClick={() => handleAddMeal(key)}
                  >
                    <Plus className={cn(
                      'h-4 w-4 mb-1 transition-colors',
                      copiedRecipe 
                        ? 'text-green-500 group-hover:text-green-600' 
                        : 'text-gray-400 group-hover:text-gray-500'
                    )} />
                    <span className={cn(
                      'text-xs transition-colors',
                      copiedRecipe 
                        ? 'text-green-600 group-hover:text-green-700' 
                        : 'text-gray-400 group-hover:text-gray-500'
                    )}>
                      {copiedRecipe 
                        ? `Paste "${copiedRecipe.recipeName || 'Recipe'}"` 
                        : `Add ${label.toLowerCase()}`}
                    </span>
                </div>
              )}
              </div>
            </MealDropZone>
          </div>
        );
      })}

      {/* Day Notes Section */}
      {dayMeals.dailyNotes && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <h4 className="text-xs font-medium text-gray-600 mb-1">Notes</h4>
          <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            {dayMeals.dailyNotes}
          </p>
        </div>
      )}
    </div>
  );
}

export default DayColumn;