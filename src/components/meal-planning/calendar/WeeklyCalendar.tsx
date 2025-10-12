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

import React, { useState, useEffect, useCallback } from 'react';
// DragDropContext removed - using react-dnd instead
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { DayColumn } from './DayColumn';
// MealPlanningToolbar removed - not used in this component
import { RecipeDetailModal } from '../modals/RecipeDetailModal';
import { MealPlanService } from '@/services/mealPlanService';
import { useAuth } from '@/context/authContext';
import type { 
  IMealPlan, 
  MealSlot, 
  DayMeals
} from '@/types/meal-planning';
import { 
  getWeekStartDate,
  getWeekDates,
  formatWeekRange
} from '@/types/meal-planning';

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
  onEditMeal?: (slot: any) => void; // Add edit meal handler
  onRemoveMeal?: (planId: string, day: number, mealType: string, index: number) => void;
  onShowRecipe?: (meal: MealSlot) => void;
  onCopyRecipe?: (meal: MealSlot) => void;
  copiedRecipe?: MealSlot | null;
  onClearCopiedRecipe?: () => void;
  hideSearch?: boolean;
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
  onEditMeal,
  onRemoveMeal,
  onShowRecipe,
  onCopyRecipe,
  copiedRecipe,
  onClearCopiedRecipe,
  hideSearch = false,
  className 
}: WeeklyCalendarProps) {
  // Get user context for MongoDB operations
  const { user, status } = useAuth();
  const authLoading = status === 'loading';
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => 
    getWeekStartDate(currentDate || new Date())
  );
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [, setIsLoading] = useState(false);
  const [dateSearchValue, setDateSearchValue] = useState<string>('');
  const [selectedMeal, setSelectedMeal] = useState<MealSlot | null>(null);
  const [selectedMealContext, setSelectedMealContext] = useState<{dayName: string, mealType: string} | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  
  // MongoDB integration state
  const [currentMealPlan, setCurrentMealPlan] = useState<IMealPlan | null>(mealPlan || null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Handle showing recipe details
  const handleShowRecipe = (meal: MealSlot, dayIndex: number, mealType: string) => {
    console.log('📅 WeeklyCalendar: handleShowRecipe called', { meal: meal.recipeName, dayIndex, mealType });
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = weekDates[dayIndex] ? dayNames[weekDates[dayIndex].getDay()] : 'Unknown';
    setSelectedMeal(meal);
    setSelectedMealContext({ dayName, mealType });
    setShowRecipeModal(true);
  };

  // Handle copying recipe - delegate to parent
  const handleCopyRecipe = (meal: MealSlot) => {
    if (onCopyRecipe) {
      onCopyRecipe(meal);
    }
  };

  // MongoDB integration functions
  const saveMealPlan = useCallback(async (updatedPlan: IMealPlan) => {
    if (!user || !updatedPlan._id) return;
    
    setSaveStatus('saving');
    try {
      await MealPlanService.debouncedSave(updatedPlan);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save meal plan:', error);
      setSaveStatus('error');
    }
  }, [user]);

  const updateMealPlan = useCallback((updater: (plan: IMealPlan) => IMealPlan) => {
    // Use the most current meal plan (prefer currentMealPlan, fallback to mealPlan prop)
    const sourcePlan = currentMealPlan || mealPlan;
    if (!sourcePlan) {
      console.warn('📅 WeeklyCalendar: No meal plan available for update');
      return;
    }
    
    const updatedPlan = updater(sourcePlan);
    console.log('📅 WeeklyCalendar: Updating meal plan', {
      source: sourcePlan === currentMealPlan ? 'currentMealPlan' : 'mealPlan prop',
      updated: updatedPlan
    });
    
    setCurrentMealPlan(updatedPlan);
    onMealPlanChange?.(updatedPlan);
    saveMealPlan(updatedPlan);
  }, [currentMealPlan, mealPlan, onMealPlanChange, saveMealPlan]);

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

  // Use meal plan from parent props instead of creating independently
  useEffect(() => {
    if (mealPlan) {
      console.log('📅 WeeklyCalendar: Syncing meal plan from props', mealPlan);
      setCurrentMealPlan(mealPlan);
    }
  }, [mealPlan]);

  // Re-sync when week changes to ensure proper data loading
  useEffect(() => {
    if (mealPlan && weekDates.length > 0) {
      console.log('📅 WeeklyCalendar: Week changed, re-syncing meal plan', {
        weekStart: currentWeekStart.toDateString(),
        mealPlanWeek: mealPlan.weekStartDate
      });
      setCurrentMealPlan(mealPlan);
    }
  }, [currentWeekStart, weekDates, mealPlan]);

  // Navigation handlers - Enhanced to communicate with parent
  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
    
    // Communicate navigation to parent if possible
    if (onMealPlanChange && mealPlan) {
      console.log('📅 WeeklyCalendar: Previous week navigation, triggering parent refresh');
      // Just trigger a refresh by updating the meal plan's lastViewed date
      const refreshedPlan = { ...mealPlan, lastViewed: new Date() };
      onMealPlanChange(refreshedPlan);
    }
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
    
    // Communicate navigation to parent if possible
    if (onMealPlanChange && mealPlan) {
      console.log('📅 WeeklyCalendar: Next week navigation, triggering parent refresh');
      // Just trigger a refresh by updating the meal plan's lastViewed date  
      const refreshedPlan = { ...mealPlan, lastViewed: new Date() };
      onMealPlanChange(refreshedPlan);
    }
  };

  const goToCurrentWeek = () => {
    const currentWeek = getWeekStartDate(new Date());
    setCurrentWeekStart(currentWeek);
    
    // Communicate navigation to parent if possible
    if (onMealPlanChange && mealPlan) {
      console.log('📅 WeeklyCalendar: Current week navigation, triggering parent refresh');
      // Just trigger a refresh by updating the meal plan's lastViewed date
      const refreshedPlan = { ...mealPlan, lastViewed: new Date() };
      onMealPlanChange(refreshedPlan);
    }
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
    
    // Navigate to the week containing the target date
    if (targetDate && !isNaN(targetDate.getTime())) {
      const weekStart = getWeekStartDate(targetDate);
      setCurrentWeekStart(weekStart);
    }
  };

  // Handle Enter key press for date search
  const handleDateSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleDateSearch(dateSearchValue);
    }
  };

  // Get meals for a specific day - MongoDB integrated version
  const getMealsForDay = (dayIndex: number): DayMeals | undefined => {
    const targetDate = weekDates[dayIndex];
    if (!targetDate) return undefined;

    // Priority 1: Current MongoDB meal plan (most reliable)
    if (currentMealPlan && currentMealPlan.days && currentMealPlan.days[dayIndex]) {
      console.log('📅 WeeklyCalendar: Using currentMealPlan for day', dayIndex, currentMealPlan.days[dayIndex]);
      return currentMealPlan.days[dayIndex];
    }
    
    // Priority 2: Props meal plan (for external control)
    if (mealPlan && mealPlan.days && mealPlan.days[dayIndex]) {
      console.log('📅 WeeklyCalendar: Using props mealPlan for day', dayIndex, mealPlan.days[dayIndex]);
      return mealPlan.days[dayIndex];
    }
    
    // Priority 3: Cross-week synchronization from meal plans array
    const targetWeekStart = getWeekStartDate(targetDate);
    const targetWeekKey = targetWeekStart.toISOString().split('T')[0];
    
    // Look through all meal plans for cross-week functionality
    const matchingPlan = mealPlans.find(plan => {
      const planWeekKey = getWeekStartDate(plan.weekStartDate).toISOString().split('T')[0];
      return planWeekKey === targetWeekKey;
    });
    
    if (matchingPlan && matchingPlan.days) {
      const matchingDay = matchingPlan.days.find(day => {
        const dayDate = new Date(day.date);
        dayDate.setHours(0, 0, 0, 0);
        const normalizedTargetDate = new Date(targetDate);
        normalizedTargetDate.setHours(0, 0, 0, 0);
        return dayDate.getTime() === normalizedTargetDate.getTime();
      });
      
      if (matchingDay) {
        console.log('📅 WeeklyCalendar: Cross-week meals found for', targetDate.toDateString(), matchingDay);
        return matchingDay;
      }
    }
    
    console.log('📅 WeeklyCalendar: No meals found for day', dayIndex, targetDate.toDateString());
    return undefined;
  };

  // Handle meal changes - MongoDB integrated version
  const handleMealChange = (dayIndex: number, meals: DayMeals) => {
    const sourcePlan = currentMealPlan || mealPlan;
    if (!sourcePlan) {
      console.warn('📅 WeeklyCalendar: No meal plan available for meal change');
      return;
    }

    console.log('📅 WeeklyCalendar: Handling meal change for day', dayIndex, meals);
    
    updateMealPlan(plan => ({
      ...plan,
      days: plan.days.map((day, index) => 
        index === dayIndex ? meals : day
      ),
      updatedAt: new Date()
    }));
  };

  // Handle adding a new meal - Enhanced with edit capability
  const handleAddRecipe = (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => {
    // If there's a copied recipe, paste it instead of opening add dialog
    if (copiedRecipe) {
      handlePasteRecipe(dayIndex, mealType);
      return;
    }

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

  // Handle editing existing meal
  const handleEditMeal = (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks', meal: MealSlot, mealIndex: number) => {
    console.log('📝 WeeklyCalendar: Edit meal requested for:', meal.recipeName);
    
    if (onEditMeal) {
      const editSlot = {
        dayOfWeek: dayIndex,
        mealType: mealType,
        recipeId: meal.recipeId || '',
        recipeName: meal.recipeName || '',
        servings: meal.servings || 2,
        prepTime: meal.prepTime || 30,
        cookingTime: meal.cookingTime || 0,
        notes: meal.notes || '',
        ingredients: meal.ingredients || [],
        tags: meal.tags || [],
        image: meal.image || '',
        existingMealIndex: mealIndex // Include index for updating existing meal
      };
      onEditMeal(editSlot);
    } else if (onAddMeal) {
      // Fallback to add meal with existing data
      const editSlot = {
        dayOfWeek: dayIndex,
        mealType: mealType,
        recipeId: meal.recipeId || '',
        recipeName: meal.recipeName || '',
        servings: meal.servings || 2,
        prepTime: meal.prepTime || 30,
        existingMealIndex: mealIndex
      };
      onAddMeal(editSlot);
    }
  };

  // Handle pasting copied recipe
  const handlePasteRecipe = (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => {
    const sourcePlan = currentMealPlan || mealPlan;
    if (!copiedRecipe || !sourcePlan) {
      console.warn('📅 WeeklyCalendar: Cannot paste recipe - missing copied recipe or meal plan');
      return;
    }

    console.log('📅 WeeklyCalendar: Pasting recipe', copiedRecipe.recipeName, 'to day', dayIndex, mealType);

    // Create a new meal based on the copied recipe
    const newMeal: MealSlot = {
      ...copiedRecipe,
    };

    // Update the meal plan using the updateMealPlan function
    updateMealPlan(plan => {
      const updatedPlan = { ...plan };
      if (!updatedPlan.days[dayIndex]) {
        updatedPlan.days[dayIndex] = {
          date: weekDates[dayIndex],
          breakfast: [],
          lunch: [],
          dinner: [],
          snacks: []
        };
      }

      updatedPlan.days[dayIndex][mealType].push(newMeal);
      updatedPlan.updatedAt = new Date();
      
      return updatedPlan;
    });

    // Clear copied recipe after pasting
    if (onClearCopiedRecipe) {
      onClearCopiedRecipe();
    }
    console.log('📅 WeeklyCalendar: Recipe pasted successfully:', newMeal.recipeName);
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
    const sourcePlan = currentMealPlan || mealPlan;
    if (!sourcePlan || !onMealPlanChange) {
      console.warn('📅 WeeklyCalendar: Cannot move meal - missing meal plan');
      return;
    }

    console.log('📅 WeeklyCalendar: Moving meal cross-day', {
      meal: draggedMeal,
      from: `day${sourceDayIndex}-${sourceMealType}`,
      to: `day${targetDayIndex}-${targetMealType}`
    });

    updateMealPlan(plan => {
      const updatedPlan = { ...plan };
      
      // Remove from source
      const sourceMealTypeKey = sourceMealType as keyof DayMeals;
      const targetMealTypeKey = targetMealType as keyof DayMeals;
      
      if (updatedPlan.days[sourceDayIndex] && updatedPlan.days[targetDayIndex]) {
        // Remove from source day
        const sourceDay = updatedPlan.days[sourceDayIndex];
        const sourceMeals = sourceDay[sourceMealTypeKey] as any[];
        updatedPlan.days[sourceDayIndex] = {
          ...sourceDay,
          [sourceMealTypeKey]: sourceMeals.filter((_, index) => index !== sourceMealIndex)
        };
        
        // Add to target day
        const targetDay = updatedPlan.days[targetDayIndex];
        const targetMeals = targetDay[targetMealTypeKey] as any[];
        updatedPlan.days[targetDayIndex] = {
          ...targetDay,
          [targetMealTypeKey]: [...targetMeals, draggedMeal.meal]
        };
      }

      updatedPlan.updatedAt = new Date();
      return updatedPlan;
    });
  };

  // Week day names
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const shortDayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
      <div id="weekly-calendar" className={cn('w-full space-y-4', className)}>
        {/* Header */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-2 justify-center flex-1">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg sm:text-xl text-center">
                  Weekly Meal Plan
                </CardTitle>
              </div>
            </div>
            
            {/* Week Range Display */}
            <div className="text-sm text-muted-foreground mt-2 flex items-center justify-center">
              {formatWeekRange(currentWeekStart)}
              
              {/* Save status indicator */}
              {saveStatus !== 'idle' && (
                <span className={cn(
                  'ml-2 px-2 py-1 text-xs rounded-full',
                  {
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': saveStatus === 'saving',
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': saveStatus === 'saved',
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': saveStatus === 'error',
                  }
                )}>
                  {saveStatus === 'saving' && 'Saving...'}
                  {saveStatus === 'saved' && 'Saved'}
                  {saveStatus === 'error' && 'Save failed'}
                </span>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Calendar Grid */}
        <div id="calendar-container" className="grid grid-cols-1 lg:grid-cols-7 gap-2 sm:gap-3 lg:gap-4">
          {weekDates.map((date, dayIndex) => {
            const dayMeals = getMealsForDay(dayIndex);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <Card 
                key={dayIndex}
                className={cn(
                  'min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]',
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
                    onEditMeal={(meal: MealSlot, mealIndex: number, mealType: string) => 
                      handleEditMeal(dayIndex, mealType as 'breakfast' | 'lunch' | 'dinner' | 'snacks', meal, mealIndex)
                    }
                    onCrossDayMealMove={handleCrossDayMealMove}
                    onShowRecipe={handleShowRecipe}
                    onCopyRecipe={handleCopyRecipe}
                    copiedRecipe={copiedRecipe}
                    isToday={isToday}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {!mealPlan && (
          <Card className="py-12 bg-[#EFF4E6] dark:bg-[#74765D] border-[#AAC91] dark:border-[#C1D3AF]">
            <CardContent className="text-center">
              <Calendar className="h-12 w-12 text-[#7D966D] dark:text-[#C1D3AF] mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-[#7D966D] dark:text-[#C1D3AF]">No Meal Plan Yet</h3>
              <p className="text-[#7D966D] dark:text-[#C1D3AF] mb-4 max-w-md mx-auto">
                Start planning your meals by creating a new meal plan for this week.
              </p>
              <Button className="bg-[#F96850] hover:bg-[#F96850]/90 dark:bg-[#F16B59] dark:hover:bg-[#F16B59]/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Meal Plan
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Mobile Week Summary */}
        <div className="lg:hidden">
          {mealPlan && (
            <Card className="bg-[#EFF4E6] dark:bg-[#74765D] border-[#AAC91] dark:border-[#C1D3AF]">
              <CardHeader>
                <CardTitle className="text-base text-[#7D966D] dark:text-[#C1D3AF]">Week Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm text-[#7D966D] dark:text-[#C1D3AF]">
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

        {/* Recipe Detail Modal */}
        <RecipeDetailModal
          meal={selectedMeal}
          open={showRecipeModal}
          onOpenChange={setShowRecipeModal}
          dayName={selectedMealContext?.dayName}
          mealType={selectedMealContext?.mealType}
        />
      </div>
  );
}

export default WeeklyCalendar;