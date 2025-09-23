/**
 * Monthly Calendar Component for Meal Planning
 * 
 * Features:
 * - Full month view with 28-31 dayinterface DayCellProps {
  dayData: DayData;
  onAddRecipe?: (date: Date, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => void;
  onEditMeal?: (meal: MealSlot, date: Date, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => void;
  onRemoveMeal?: (planId: string, day: number, mealType: string, index: number) => void;
  onDayClick?: (date: Date) => void;
  selectedDate?: Date | null;
}

function DayCell({ dayData, onAddRecipe, onEditMeal, onRemoveMeal, onDayClick, selectedDate }: DayCellProps) {mpact meal display for each day
 * - Month navigation
 * - Click to expand day details
 * - Mobile responsive grid
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus, MoreHorizontal, Search, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { IMealPlan, DayMeals, MealSlot } from '@/types/meal-planning';
import { getWeekStartDate } from '@/types/meal-planning';


// ========================================
// Types
// ========================================

interface MonthlyCalendarProps {
  currentDate?: Date;
  mealPlans?: IMealPlan[];
  onMealPlansChange?: (mealPlans: IMealPlan[]) => void;
  onAddRecipe?: (date: Date, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => void;
  onRemoveMeal?: (planId: string, day: number, mealType: string, index: number) => void;
  onEditMeal?: (meal: MealSlot, date: Date, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => void;
  onShowRecipe?: (meal: MealSlot) => void;
  onCopyRecipe?: (meal: MealSlot) => void;
  copiedRecipe?: MealSlot | null;
  onClearCopiedRecipe?: () => void;
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
  onEditMeal?: (meal: MealSlot, date: Date, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => void;
  onRemoveMeal?: (planId: string, day: number, mealType: string, index: number) => void;
  onShowRecipe?: (meal: MealSlot) => void;
  onCopyRecipe?: (meal: MealSlot) => void;
  onDayClick?: (date: Date) => void;
  selectedDate?: Date | null;
}

function DayCell({ dayData, onAddRecipe, onEditMeal, onRemoveMeal, onShowRecipe, onCopyRecipe, onDayClick, selectedDate }: DayCellProps) {
  const { date, meals, isToday, isCurrentMonth, hasEvents } = dayData;
  const mealCount = meals ? getMealCountForDay(meals) : 0;
  const mealTypes = meals ? getMealTypesForDay(meals) : [];
  const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
  
  return (
    <div
      className={cn(
        'group min-h-[120px] border border-gray-200 p-2 cursor-pointer',
        'transition-all duration-200 hover:bg-gray-50 hover:shadow-sm',
        !isCurrentMonth && 'bg-gray-50 text-gray-400',
        isToday && 'bg-primary/5 border-primary/20 hover:bg-primary/10',
        hasEvents && 'bg-blue-50 hover:bg-blue-100',
        isSelected && 'ring-2 ring-primary ring-opacity-50 bg-primary/10'
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
                  className="group flex items-center gap-1 text-xs text-gray-600 bg-orange-100 px-1 py-0.5 rounded cursor-pointer hover:bg-orange-200 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onShowRecipe) {
                      onShowRecipe(meal);
                    } else {
                      onEditMeal?.(meal, date, 'breakfast');
                    }
                  }}
                >
                  <div className="w-4 h-4 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {meal.image ? (
                      <img src={meal.image} alt={meal.recipeName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs">🍳</span>
                    )}
                  </div>
                  <span className="truncate flex-1">{meal.recipeName}</span>
                  {onCopyRecipe && (
                    <button
                      className="opacity-0 group-hover:opacity-100 w-3 h-3 flex items-center justify-center text-green-500 hover:text-green-700 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopyRecipe(meal);
                      }}
                      title="Copy recipe"
                    >
                      <Copy className="w-2 h-2" />
                    </button>
                  )}
                  <button
                    className="opacity-0 group-hover:opacity-100 w-3 h-3 flex items-center justify-center text-red-500 hover:text-red-700 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Find the meal plan and remove the meal
                      const weekStart = getWeekStartDate(date);
                      const daysDiff = Math.floor((date.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
                      onRemoveMeal?.('', daysDiff, 'breakfast', index);
                    }}
                    title="Delete meal"
                  >
                    ×
                  </button>
                </div>
              ))}
              {meals?.lunch?.slice(0, 1).map((meal, index) => (
                <div
                  key={`lunch-${index}`}
                  className="group flex items-center gap-1 text-xs text-gray-600 bg-yellow-100 px-1 py-0.5 rounded cursor-pointer hover:bg-yellow-200 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onShowRecipe) {
                      onShowRecipe(meal);
                    } else {
                      onEditMeal?.(meal, date, 'lunch');
                    }
                  }}
                >
                  <div className="w-4 h-4 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {meal.image ? (
                      <img src={meal.image} alt={meal.recipeName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs">🥗</span>
                    )}
                  </div>
                  <span className="truncate flex-1">{meal.recipeName}</span>
                  {onCopyRecipe && (
                    <button
                      className="opacity-0 group-hover:opacity-100 w-3 h-3 flex items-center justify-center text-green-500 hover:text-green-700 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopyRecipe(meal);
                      }}
                      title="Copy recipe"
                    >
                      <Copy className="w-2 h-2" />
                    </button>
                  )}
                  <button
                    className="opacity-0 group-hover:opacity-100 w-3 h-3 flex items-center justify-center text-red-500 hover:text-red-700 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      const weekStart = getWeekStartDate(date);
                      const daysDiff = Math.floor((date.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
                      onRemoveMeal?.('', daysDiff, 'lunch', index);
                    }}
                    title="Delete meal"
                  >
                    ×
                  </button>
                </div>
              ))}
              {meals?.dinner?.slice(0, 1).map((meal, index) => (
                <div
                  key={`dinner-${index}`}
                  className="group flex items-center gap-1 text-xs text-gray-600 bg-blue-100 px-1 py-0.5 rounded cursor-pointer hover:bg-blue-200 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onShowRecipe) {
                      onShowRecipe(meal);
                    } else {
                      onEditMeal?.(meal, date, 'dinner');
                    }
                  }}
                >
                  <div className="w-4 h-4 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {meal.image ? (
                      <img src={meal.image} alt={meal.recipeName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs">🍽️</span>
                    )}
                  </div>
                  <span className="truncate flex-1">{meal.recipeName}</span>
                  {onCopyRecipe && (
                    <button
                      className="opacity-0 group-hover:opacity-100 w-3 h-3 flex items-center justify-center text-green-500 hover:text-green-700 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopyRecipe(meal);
                      }}
                      title="Copy recipe"
                    >
                      <Copy className="w-2 h-2" />
                    </button>
                  )}
                  <button
                    className="opacity-0 group-hover:opacity-100 w-3 h-3 flex items-center justify-center text-red-500 hover:text-red-700 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      const weekStart = getWeekStartDate(date);
                      const daysDiff = Math.floor((date.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
                      onRemoveMeal?.('', daysDiff, 'dinner', index);
                    }}
                    title="Delete meal"
                  >
                    ×
                  </button>
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
  onRemoveMeal,
  onEditMeal,
  onShowRecipe,
  onCopyRecipe,
  copiedRecipe,
  onClearCopiedRecipe,
  className
}: MonthlyCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(currentDate || new Date());
  const [dateSearchValue, setDateSearchValue] = useState<string>('');

  // Sync with parent currentDate prop
  useEffect(() => {
    if (currentDate) {
      setCurrentMonth(currentDate);
    }
  }, [currentDate]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Handle copying recipe
  const handleCopyRecipe = (meal: MealSlot) => {
    if (onCopyRecipe) {
      onCopyRecipe(meal);
    }
  };
  
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
      meals: null as DayMeals | null,
      hasEvents: false
    }));
    
    // Process each meal plan
    mealPlans.forEach((plan, planIndex) => {
      console.log(`Processing plan ${planIndex} with weekStart:`, plan.weekStartDate.toDateString());
      
      plan.days.forEach((planDay, dayIndex) => {
        // Normalize dates to avoid timezone issues
        const planDate = new Date(planDay.date);
        planDate.setHours(0, 0, 0, 0);
        const planDayStr = planDate.toDateString();
        
        console.log(`Plan ${planIndex}, Day ${dayIndex}: ${planDayStr}`);
        
        // Find matching day in month data with normalized comparison
        const monthDayIndex = updatedMonthData.findIndex((monthDay, index) => {
          const monthDate = new Date(monthDay.date);
          monthDate.setHours(0, 0, 0, 0);
          const monthDayStr = monthDate.toDateString();
          const matches = monthDayStr === planDayStr;
          
          if (matches) {
            console.log(`✓ Match found: Month[${index}] ${monthDayStr} = Plan[${planIndex}][${dayIndex}] ${planDayStr}`);
          }
          
          return matches;
        });
        
        if (monthDayIndex !== -1) {
          const mealCount = getMealCountForDay(planDay);
          if (mealCount > 0) {
            console.log(`MonthlyCalendar: Adding ${mealCount} meals to month day ${monthDayIndex} (${planDayStr})`);
            
            // Check if this day already has meals (merge instead of replace)
            if (updatedMonthData[monthDayIndex].meals) {
              console.log('WARNING: Day already has meals, merging...');
              const existingMeals = updatedMonthData[monthDayIndex].meals!;
              updatedMonthData[monthDayIndex] = {
                ...updatedMonthData[monthDayIndex],
                meals: {
                  date: planDay.date,
                  breakfast: [...existingMeals.breakfast, ...planDay.breakfast],
                  lunch: [...existingMeals.lunch, ...planDay.lunch],
                  dinner: [...existingMeals.dinner, ...planDay.dinner],
                  snacks: [...existingMeals.snacks, ...planDay.snacks]
                },
                hasEvents: true
              };
            } else {
              updatedMonthData[monthDayIndex] = {
                ...updatedMonthData[monthDayIndex],
                meals: planDay,
                hasEvents: true
              };
            }
          }
        } else {
          console.warn(`MonthlyCalendar: Could not find matching day for ${planDayStr} in month data`);
          console.warn('Available month dates:', updatedMonthData.slice(0, 5).map(d => d.date.toDateString()), '...');
        }
      });
    });
    
    const daysWithMeals = updatedMonthData.filter(day => day.hasEvents).length;
    console.log('MonthlyCalendar: Days with meals:', daysWithMeals);
    console.log('MonthlyCalendar: Processed month data summary:', 
      updatedMonthData.filter(day => day.hasEvents).map(day => ({
        date: day.date.toDateString(),
        mealCount: day.meals ? getMealCountForDay(day.meals) : 0
      }))
    );
    
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

  // Date search functionality
  const handleDateSearch = (value: string) => {
    setDateSearchValue(value);
    
    if (!value) return;
    
    // Parse different date formats
    let targetDate: Date | null = null;
    
    // Try YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      targetDate = new Date(value);
    }
    // Try DD/MM/YYYY format
    else if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [day, month, year] = value.split('/');
      targetDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    // Try MM/DD/YYYY format
    else if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [month, day, year] = value.split('/');
      targetDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    // Try DD.MM.YYYY format
    else if (/^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
      const [day, month, year] = value.split('.');
      targetDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    // Try partial year-month: YYYY-MM
    else if (/^\d{4}-\d{2}$/.test(value)) {
      const [year, month] = value.split('-');
      targetDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    }
    
    // Navigate to the month containing the target date
    if (targetDate && !isNaN(targetDate.getTime())) {
      setCurrentMonth(new Date(targetDate.getFullYear(), targetDate.getMonth(), 1));
      setSelectedDate(targetDate);
    }
  };

  // Handle Enter key press for date search
  const handleDateSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleDateSearch(dateSearchValue);
    }
  };

  // Format month title
  const monthTitle = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex flex-col space-y-4">
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
          
          {/* Date Search */}
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Jump to date (YYYY-MM-DD, DD/MM/YYYY...)"
                value={dateSearchValue}
                onChange={(e) => setDateSearchValue(e.target.value)}
                onKeyPress={handleDateSearchKeyPress}
                onBlur={() => handleDateSearch(dateSearchValue)}
                className="pl-10"
              />
            </div>
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
              onEditMeal={onEditMeal}
              onRemoveMeal={onRemoveMeal}
              onShowRecipe={onShowRecipe}
              onCopyRecipe={handleCopyRecipe}
              onDayClick={handleDayClick}
              selectedDate={selectedDate}
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
  );
}

export default MonthlyCalendar;