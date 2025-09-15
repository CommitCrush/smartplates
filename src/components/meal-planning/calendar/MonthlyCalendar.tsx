/**
 * Monthly Calendar Component for Meal Planning
 * 
 * Features:
 * - Full month view with 28-31 days
 * - Compact meal display for each day
 * - Month navigation
 * - Click to expand day details
 * - Mobile responsive grid
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { IMealPlan, DayMeals, MealSlot } from '@/types/meal-planning';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// ========================================
// Types
// ========================================

interface MonthlyCalendarProps {
  currentDate?: Date;
  mealPlans?: IMealPlan[];
  onMealPlansChange?: (mealPlans: IMealPlan[]) => void;
  onAddRecipe?: (date: Date, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => void;
  className?: string;
}

interface DayData {
  date: Date;
  meals: DayMeals | null;
  isToday: boolean;
  isCurrentMonth: boolean;
  hasEvents: boolean;
}

// ========================================
// Utility Functions
// ========================================

function getMonthData(year: number, month: number): DayData[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  const today = new Date();
  
  // Start from Sunday of the week containing the first day
  startDate.setDate(firstDay.getDate() - firstDay.getDay());
  
  const days: DayData[] = [];
  const currentDate = new Date(startDate);
  
  // Generate 42 days (6 weeks)
  for (let i = 0; i < 42; i++) {
    const isCurrentMonth = currentDate.getMonth() === month;
    const isToday = 
      currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();
    
    days.push({
      date: new Date(currentDate),
      meals: null, // Will be populated from meal plans
      isToday,
      isCurrentMonth,
      hasEvents: false
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
}

function getMealCountForDay(meals: DayMeals): number {
  return (meals.breakfast?.length || 0) + 
         (meals.lunch?.length || 0) + 
         (meals.dinner?.length || 0) + 
         (meals.snacks?.length || 0);
}

function getMealTypesForDay(meals: DayMeals): string[] {
  const types: string[] = [];
  if (meals.breakfast?.length) types.push('🌅');
  if (meals.lunch?.length) types.push('☀️');
  if (meals.dinner?.length) types.push('🌙');
  if (meals.snacks?.length) types.push('🍎');
  return types;
}

// ========================================
// Day Cell Component
// ========================================

interface DayCellProps {
  dayData: DayData;
  onAddRecipe?: (date: Date, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => void;
  onDayClick?: (date: Date) => void;
}

function DayCell({ dayData, onAddRecipe, onDayClick }: DayCellProps) {
  const { date, meals, isToday, isCurrentMonth, hasEvents } = dayData;
  const mealCount = meals ? getMealCountForDay(meals) : 0;
  const mealTypes = meals ? getMealTypesForDay(meals) : [];
  
  return (
    <div
      className={cn(
        'group min-h-[120px] border border-gray-200 p-2 cursor-pointer',
        'transition-all duration-200 hover:bg-gray-50 hover:shadow-sm',
        !isCurrentMonth && 'bg-gray-50 text-gray-400',
        isToday && 'bg-primary/5 border-primary/20 hover:bg-primary/10',
        hasEvents && 'bg-blue-50 hover:bg-blue-100'
      )}
      onClick={() => onDayClick?.(date)}
    >
      {/* Date Header */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={cn(
            'text-sm font-medium',
            isToday && 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs'
          )}
        >
          {date.getDate()}
        </span>
        
        {/* Add Meal Button */}
        {isCurrentMonth && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/20"
            onClick={(e) => {
              e.stopPropagation();
              onAddRecipe?.(date, 'breakfast');
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Meal Indicators */}
      <div className="space-y-1">
        {mealCount > 0 ? (
          <>
            {/* Meal Type Icons */}
            <div className="flex items-center space-x-1">
              {mealTypes.map((emoji, index) => (
                <span key={index} className="text-xs">
                  {emoji}
                </span>
              ))}
              {mealCount > 4 && (
                <MoreHorizontal className="h-3 w-3 text-gray-400" />
              )}
            </div>
            
            {/* Meal Count Badge */}
            <Badge
              variant="secondary"
              className="text-xs px-1 py-0 h-4"
            >
              {mealCount} meal{mealCount > 1 ? 's' : ''}
            </Badge>
            
            {/* Preview of First Few Meals */}
            <div className="space-y-0.5">
              {meals?.breakfast?.slice(0, 1).map((meal, index) => (
                <div
                  key={`breakfast-${index}`}
                  className="text-xs text-gray-600 truncate bg-orange-100 px-1 rounded"
                >
                  {meal.recipeName}
                </div>
              ))}
              {meals?.lunch?.slice(0, 1).map((meal, index) => (
                <div
                  key={`lunch-${index}`}
                  className="text-xs text-gray-600 truncate bg-yellow-100 px-1 rounded"
                >
                  {meal.recipeName}
                </div>
              ))}
              {meals?.dinner?.slice(0, 1).map((meal, index) => (
                <div
                  key={`dinner-${index}`}
                  className="text-xs text-gray-600 truncate bg-blue-100 px-1 rounded"
                >
                  {meal.recipeName}
                </div>
              ))}
              {mealCount > 3 && (
                <div className="text-xs text-gray-400">
                  +{mealCount - 3} more...
                </div>
              )}
            </div>
          </>
        ) : (
          // Empty State
          <div className="text-xs text-gray-300 text-center mt-4">
            No meals planned
          </div>
        )}
      </div>
    </div>
  );
}

// ========================================
// Main Component
// ========================================

export function MonthlyCalendar({
  currentDate,
  mealPlans = [],
  onMealPlansChange,
  onAddRecipe,
  className
}: MonthlyCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(currentDate || new Date());

  // Sync with parent currentDate prop
  useEffect(() => {
    if (currentDate) {
      setCurrentMonth(currentDate);
    }
  }, [currentDate]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Generate month data
  const monthData = getMonthData(
    currentMonth.getFullYear(),
    currentMonth.getMonth()
  );
  
  // Create state for month data to force re-renders
  const [processedMonthData, setProcessedMonthData] = useState<DayData[]>(monthData);

  // Populate meal data from meal plans
  useEffect(() => {
    console.log('MonthlyCalendar: Processing meal plans', { 
      mealPlansCount: mealPlans.length, 
      monthDataCount: monthData.length,
      currentMonth: currentMonth.toDateString()
    });
    
    // Create a new copy of month data
    const updatedMonthData = monthData.map(dayData => ({
      ...dayData,
      meals: null,
      hasEvents: false
    }));
    
    // Process each meal plan
    mealPlans.forEach(plan => {
      console.log('Processing plan with weekStart:', plan.weekStartDate.toDateString());
      
      plan.days.forEach(planDay => {
        const planDayStr = planDay.date.toDateString();
        console.log('Checking plan day:', planDayStr);
        
        // Find matching day in month data
        const monthDayIndex = updatedMonthData.findIndex(monthDay => 
          monthDay.date.toDateString() === planDayStr
        );
        
        if (monthDayIndex !== -1) {
          const mealCount = getMealCountForDay(planDay);
          if (mealCount > 0) {
            console.log('MonthlyCalendar: Found meals for', planDayStr, { mealCount });
            updatedMonthData[monthDayIndex] = {
              ...updatedMonthData[monthDayIndex],
              meals: planDay as DayMeals,
              hasEvents: true
            };
          }
        }
      });
    });
    
    const daysWithMeals = updatedMonthData.filter(day => day.hasEvents).length;
    console.log('MonthlyCalendar: Days with meals:', daysWithMeals);
    
    // Update state to trigger re-render
    setProcessedMonthData(updatedMonthData);
  }, [mealPlans, currentMonth]);

  // Navigation handlers
  const handlePreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    // Could open a detailed day view modal here
    console.log('Day clicked:', date);
  };

  // Format month title
  const monthTitle = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <DndProvider backend={HTML5Backend}>
      <Card className={cn('w-full', className)}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {monthTitle}
            </CardTitle>
            
            {/* Navigation Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
            {/* Week Day Headers */}
            {weekDays.map(day => (
              <div
                key={day}
                className="bg-gray-100 p-3 text-center text-sm font-medium text-gray-700 border-b border-gray-200"
              >
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {processedMonthData.map((dayData, index) => (
              <DayCell
                key={index}
                dayData={dayData}
                onAddRecipe={onAddRecipe}
                onDayClick={handleDayClick}
              />
            ))}
          </div>
          
          {/* Month Summary */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Total planned meals this month: {
                  processedMonthData.reduce((total, day) => 
                    total + (day.meals ? getMealCountForDay(day.meals) : 0), 0
                  )
                }
              </span>
              <span>
                Days with meals: {
                  processedMonthData.filter(day => day.hasEvents && day.isCurrentMonth).length
                } / {processedMonthData.filter(day => day.isCurrentMonth).length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </DndProvider>
  );
}

export default MonthlyCalendar;