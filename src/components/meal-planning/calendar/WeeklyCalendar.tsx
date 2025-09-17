/**
 * Weekly Calendar Component for Meal Planning
 * 
 * Features:
 * - 7-day weekly view (Monday to Sunday)
 * - Meal slots for breakfast, lunch, dinner, snacks
 * - Drag & Drop support
 * - Week navigation
 * - Responsive design
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getWeekStartDate, getWeekDates, formatWeekRange } from '@/types/meal-planning';
import { DayColumn } from './DayColumn';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { IMealPlan, DayMeals } from '@/types/meal-planning';

// ========================================
// Types
// ========================================

interface WeeklyCalendarProps {
  mealPlan?: IMealPlan;
  mealPlans?: IMealPlan[];
  currentDate?: Date;
  onMealPlanChange?: (mealPlan: IMealPlan) => void;
  onAddRecipe?: (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => void;
  onAddMeal?: (slot: any) => void;
  onRemoveMeal?: (planId: string, day: number, mealType: string, index: number) => void;
  className?: string;
}

// ========================================
// Main Component
// ========================================

export function WeeklyCalendar({ 
  mealPlan, 
  mealPlans = [],
  currentDate,
  onMealPlanChange, 
  onAddRecipe,
  onAddMeal,
  onRemoveMeal,
  className 
}: WeeklyCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => 
    getWeekStartDate(currentDate || new Date())
  );
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sync with parent currentDate prop
  useEffect(() => {
    if (currentDate) {
      const newWeekStart = getWeekStartDate(currentDate);
      setCurrentWeekStart(newWeekStart);
    }
  }, [currentDate]);

  // Update week dates when current week changes
  useEffect(() => {
    setWeekDates(getWeekDates(currentWeekStart));
  }, [currentWeekStart]);

  // Navigation handlers
  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(getWeekStartDate(new Date()));
  };

  // Get meals for a specific day - look across all meal plans for cross-week synchronization
  const getMealsForDay = (dayIndex: number): DayMeals | undefined => {
    if (!mealPlan || !mealPlan.days) return undefined;
    
    // First try to get from current meal plan
    const currentDayMeals = mealPlan.days[dayIndex];
    if (!currentDayMeals) return undefined;
    
    // Check if we have meals from other weeks that should be displayed in this view
    // by looking at the actual date and finding corresponding meals from globalMealPlans
    const targetDate = weekDates[dayIndex];
    if (!targetDate) return currentDayMeals;
    
    // Find the correct meal plan that contains this date
    const targetWeekStart = getWeekStartDate(targetDate);
    const targetWeekKey = targetWeekStart.toISOString().split('T')[0];
    
    // Look through all meal plans for the one that contains this date
    const matchingPlan = mealPlans.find(plan => {
      const planWeekKey = getWeekStartDate(plan.weekStartDate).toISOString().split('T')[0];
      return planWeekKey === targetWeekKey;
    });
    
    if (matchingPlan && matchingPlan.days) {
      // Find the day in the matching plan that corresponds to our target date
      const matchingDay = matchingPlan.days.find(day => {
        const dayDate = new Date(day.date);
        dayDate.setHours(0, 0, 0, 0);
        const normalizedTargetDate = new Date(targetDate);
        normalizedTargetDate.setHours(0, 0, 0, 0);
        return dayDate.getTime() === normalizedTargetDate.getTime();
      });
      
      if (matchingDay) {
        console.log('WeeklyCalendar: Found meals for', targetDate.toDateString(), 'from week', targetWeekStart.toDateString());
        return matchingDay;
      }
    }
    
    // Fallback to current day meals
    return currentDayMeals;
  };

  // Handle meal changes
  const handleMealChange = (dayIndex: number, meals: DayMeals) => {
    if (!mealPlan || !onMealPlanChange) return;

    const updatedMealPlan = {
      ...mealPlan,
      days: mealPlan.days.map((day, index) => 
        index === dayIndex ? meals : day
      ),
      updatedAt: new Date()
    };

    onMealPlanChange(updatedMealPlan);
  };

  // Handle adding a new meal
  const handleAddRecipe = (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => {
    if (onAddMeal) {
      const mealSlot = {
        dayOfWeek: dayIndex,
        mealType: mealType,
        recipeId: '',
        recipeName: '',
        servings: 2,
        prepTime: 30
      };
      onAddMeal(mealSlot);
    } else if (onAddRecipe) {
      onAddRecipe(dayIndex, mealType);
    }
  };

  // Handle cross-day meal movement
  const handleCrossDayMealMove = (
    draggedMeal: any,
    sourceDayIndex: number,
    sourceMealType: string,
    sourceMealIndex: number,
    targetDayIndex: number,
    targetMealType: string
  ) => {
    if (!mealPlan || !onMealPlanChange) return;

    const updatedMealPlan = { ...mealPlan };
    
    // Remove from source
    const sourceMealTypeKey = sourceMealType as keyof DayMeals;
    const targetMealTypeKey = targetMealType as keyof DayMeals;
    
    if (updatedMealPlan.days[sourceDayIndex] && updatedMealPlan.days[targetDayIndex]) {
      // Remove from source day
      const sourceDay = updatedMealPlan.days[sourceDayIndex];
      const sourceMeals = sourceDay[sourceMealTypeKey] as any[];
      updatedMealPlan.days[sourceDayIndex] = {
        ...sourceDay,
        [sourceMealTypeKey]: sourceMeals.filter((_, index) => index !== sourceMealIndex)
      };
      
      // Add to target day
      const targetDay = updatedMealPlan.days[targetDayIndex];
      const targetMeals = targetDay[targetMealTypeKey] as any[];
      updatedMealPlan.days[targetDayIndex] = {
        ...targetDay,
        [targetMealTypeKey]: [...targetMeals, draggedMeal.meal]
      };

      updatedMealPlan.updatedAt = new Date();
      onMealPlanChange(updatedMealPlan);
    }
  };

  // Week day names
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const shortDayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={cn('w-full space-y-4', className)}>
        {/* Simplified Header */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg sm:text-xl">
                Weekly Meal Plan
              </CardTitle>
            </div>
          </CardHeader>
        </Card>

        {/* Calendar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-3 sm:gap-4">
          {weekDates.map((date, dayIndex) => {
            const dayMeals = getMealsForDay(dayIndex);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <Card 
                key={dayIndex}
                className={cn(
                  'min-h-[400px] sm:min-h-[500px]',
                  isToday && 'ring-2 ring-primary ring-opacity-50'
                )}
              >
                <CardHeader className="pb-2 pt-3">
                  <div className="text-center">
                    {/* Day Name */}
                    <div className="font-semibold text-sm sm:text-base">
                      <span className="hidden sm:inline">{dayNames[dayIndex]}</span>
                      <span className="sm:hidden">{shortDayNames[dayIndex]}</span>
                    </div>
                    
                    {/* Date */}
                    <div className={cn(
                      'text-xl sm:text-2xl font-bold mt-1',
                      isToday ? 'text-primary' : 'text-muted-foreground'
                    )}>
                      {date.getDate()}
                    </div>
                    
                    {/* Month (only show if different from previous day or first day) */}
                    {(dayIndex === 0 || date.getMonth() !== weekDates[dayIndex - 1]?.getMonth()) && (
                      <div className="text-xs text-muted-foreground">
                        {date.toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 px-2 sm:px-4">
                  <DayColumn
                    dayIndex={dayIndex}
                    date={date}
                    meals={dayMeals}
                    onMealsChange={(meals: DayMeals) => handleMealChange(dayIndex, meals)}
                    onAddRecipe={handleAddRecipe}
                    onCrossDayMealMove={handleCrossDayMealMove}
                    isToday={isToday}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {!mealPlan && (
          <Card className="py-12">
            <CardContent className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Meal Plan Yet</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                Start planning your meals by creating a new meal plan for this week.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Meal Plan
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Mobile Week Summary */}
        <div className="lg:hidden">
          {mealPlan && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Week Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total Meals:</span>
                    <span className="ml-2">
                      {mealPlan.days?.reduce((total, day) => 
                        total + (day?.breakfast?.length || 0) + 
                        (day?.lunch?.length || 0) + 
                        (day?.dinner?.length || 0) + 
                        (day?.snacks?.length || 0), 0
                      ) || 0}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Days Planned:</span>
                    <span className="ml-2">
                      {mealPlan.days?.filter(day => 
                        (day?.breakfast?.length || 0) + 
                        (day?.lunch?.length || 0) + 
                        (day?.dinner?.length || 0) + 
                        (day?.snacks?.length || 0) > 0
                      ).length || 0}/7
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DndProvider>
  );
}

export default WeeklyCalendar;