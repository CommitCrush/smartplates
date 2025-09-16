/**
 * Meal Planning Page
 * 
 * Main page for weekly meal planning with drag & drop calendar
 * Uses mock recipe service until real recipe system is ready
 */

'use client';

import React, { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { Calendar, CalendarDays, Save, Download, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Layout from '@/components/layout/Layout';
import { WeeklyCalendar } from '@/components/meal-planning/calendar/WeeklyCalendar';
import { MonthlyCalendar } from '@/components/meal-planning/calendar/MonthlyCalendar';
import { QuickAddRecipeModal } from '@/components/meal-planning/modals/QuickAddRecipeModal';
import { SavePlanModal, type SaveOptions } from '@/components/meal-planning/modals/SavePlanModal';
import { getWeekStartDate, createEmptyMealPlan } from '@/types/meal-planning';
import type { IMealPlan, MealSlot, MealPlanningSlot } from '@/types/meal-planning';
import { mockRecipeToMealSlot, MockRecipeService } from '@/services/mockRecipeService';
import { MealPlanPDFService } from '@/services/pdfDownloadService';
import { 
  captureWeeklyCalendarScreenshot, 
  captureMonthlyCalendarScreenshot, 
  captureTodayViewScreenshot 
} from '@/services/screenshotService';
import { exportToGoogleCalendar, downloadICSFile } from '@/services/googleCalendarService';

// ========================================
// Today View Component
// ========================================

interface TodayViewProps {
  currentDate: Date;
  mealPlans: IMealPlan[];
  onAddMeal: (slot: MealPlanningSlot) => void;
  onRemoveMeal: (planId: string, day: number, mealType: string, index: number) => void;
}

const TodayView: React.FC<TodayViewProps> = ({ currentDate, mealPlans, onAddMeal, onRemoveMeal }) => {
  // Find today's meals across all meal plans
  const todayMeals = mealPlans.flatMap(plan => 
    plan.days
      .filter(day => {
        return day.date.toDateString() === currentDate.toDateString();
      })
      .flatMap(day => [
        ...day.breakfast.map(meal => ({ ...meal, mealType: 'breakfast', planId: plan._id || '' })),
        ...day.lunch.map(meal => ({ ...meal, mealType: 'lunch', planId: plan._id || '' })),
        ...day.dinner.map(meal => ({ ...meal, mealType: 'dinner', planId: plan._id || '' })),
        ...day.snacks.map(meal => ({ ...meal, mealType: 'snacks', planId: plan._id || '' })),
      ])
  );

  const mealsByType = {
    breakfast: todayMeals.filter(meal => meal.mealType === 'breakfast'),
    lunch: todayMeals.filter(meal => meal.mealType === 'lunch'),
    dinner: todayMeals.filter(meal => meal.mealType === 'dinner'),
    snacks: todayMeals.filter(meal => meal.mealType === 'snacks'),
  };

  const renderMealSection = (mealType: string, meals: any[], emoji: string) => (
    <Card key={mealType} className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <span>{emoji}</span>
          {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {meals.length > 0 ? (
          <div className="space-y-2">
            {meals.map((meal, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{meal.recipeName}</div>
                  <div className="text-sm text-gray-500">
                    {meal.servings} servings • {meal.prepTime} min
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const dayOfWeek = currentDate.getDay();
                    onRemoveMeal(meal.planId, dayOfWeek, mealType, index);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>No {mealType} planned for today</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const dayOfWeek = currentDate.getDay();
                onAddMeal({
                  dayOfWeek,
                  mealType: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snacks',
                  recipeId: '',
                  recipeName: '',
                  servings: 2,
                  prepTime: 30,
                  ingredients: [],
                  tags: []
                });
              }}
              className="mt-2"
            >
              Add {mealType}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">
          {currentDate.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </h2>
        <p className="text-gray-600">Your meals for today</p>
      </div>

      {renderMealSection('breakfast', mealsByType.breakfast, '🍳')}
      {renderMealSection('lunch', mealsByType.lunch, '🥗')}
      {renderMealSection('dinner', mealsByType.dinner, '🍽️')}
      {renderMealSection('snacks', mealsByType.snacks, '🍎')}
    </div>
  );
};

// ========================================
// Main Meal Planning Component
// ========================================

type ViewMode = 'today' | 'weekly' | 'monthly';

export default function MealPlanningPage() {
  // State management
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mealPlans, setMealPlans] = useState<IMealPlan[]>([]);
  const [mealPlan, setMealPlan] = useState<IMealPlan | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<MealPlanningSlot | null>(null);

  // Central meal plan storage - persists across navigation
  const [globalMealPlans, setGlobalMealPlans] = useState<Map<string, IMealPlan>>(new Map());

  // Initialize meal plan on component mount
  useEffect(() => {
    const initializeMealPlan = () => {
      const weekStart = getWeekStartDate(currentDate);
      const weekKey = weekStart.toISOString().split('T')[0]; // Use date as key
      
      // Check if we already have a meal plan for this week
      if (globalMealPlans.has(weekKey)) {
        const existingPlan = globalMealPlans.get(weekKey)!;
        setMealPlan(existingPlan);
        setMealPlans([existingPlan]);
      } else {
        // Create new meal plan only if it doesn't exist
        const newPlan = createEmptyMealPlan('current-user', weekStart);
        const updatedGlobalPlans = new Map(globalMealPlans);
        updatedGlobalPlans.set(weekKey, newPlan);
        setGlobalMealPlans(updatedGlobalPlans);
        setMealPlan(newPlan);
        setMealPlans([newPlan]);
      }
    };

    initializeMealPlan();
  }, [currentDate]); // Update when currentDate changes

  // Navigation handlers
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'today') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === 'weekly') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (viewMode === 'monthly') {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
    // Meal plan will be updated by useEffect
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'today') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === 'weekly') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (viewMode === 'monthly') {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
    // Meal plan will be updated by useEffect
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    
    // Update meal plan for current week
    const weekStart = getWeekStartDate(today);
    const newPlan = createEmptyMealPlan('current-user', weekStart);
    setMealPlan(newPlan);
    setMealPlans([newPlan]);
  };

  // Get formatted date range text
  const getDateRangeText = () => {
    if (viewMode === 'today') {
      return currentDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } else if (viewMode === 'weekly') {
      const weekStart = getWeekStartDate(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else if (viewMode === 'monthly') {
      return currentDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
    }
    return '';
  };

  // Meal management handlers
  const handleAddMeal = (slot: MealPlanningSlot) => {
    setSelectedSlot(slot);
    setShowQuickAdd(true);
  };

  // Handle adding meal from MonthlyCalendar (date-based)
  const handleAddMealFromDate = (date: Date, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => {
    // Find which week this date belongs to and convert to dayOfWeek index
    const weekStart = getWeekStartDate(date);
    const daysDiff = Math.floor((date.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
    
    // Ensure we have a meal plan for this week
    const weekKey = weekStart.toISOString().split('T')[0];
    if (!globalMealPlans.has(weekKey)) {
      const newPlan = createEmptyMealPlan('current-user', weekStart);
      const updatedGlobalPlans = new Map(globalMealPlans);
      updatedGlobalPlans.set(weekKey, newPlan);
      setGlobalMealPlans(updatedGlobalPlans);
    }

    const slot: MealPlanningSlot = {
      dayOfWeek: daysDiff, // 0-6 (Monday to Sunday)
      mealType: mealType,
      recipeId: '',
      recipeName: '',
      servings: 2,
      prepTime: 30
    };
    
    setSelectedSlot(slot);
    setShowQuickAdd(true);
  };

  const handleRemoveMeal = (planId: string, day: number, mealType: string, index: number) => {
    if (!mealPlan) return;

    const updatedPlan = { ...mealPlan };
    const targetDay = updatedPlan.days[day]; // Use array index instead of searching
    
    if (targetDay) {
      const meals = targetDay[mealType as keyof typeof targetDay] as MealSlot[];
      meals.splice(index, 1);
      updatedPlan.updatedAt = new Date();
      
      // Update both local state and global storage
      setMealPlan(updatedPlan);
      setMealPlans([updatedPlan]);
      
      const weekKey = updatedPlan.weekStartDate.toISOString().split('T')[0];
      const updatedGlobalPlans = new Map(globalMealPlans);
      updatedGlobalPlans.set(weekKey, updatedPlan);
      setGlobalMealPlans(updatedGlobalPlans);
    }
  };

    const handleQuickAddSubmit = async (recipeData: any) => {
    if (!selectedSlot || selectedSlot.dayOfWeek === undefined || !selectedSlot.mealType) return;

    try {
      const mealSlot = mockRecipeToMealSlot(recipeData);
      
      // Determine which week's meal plan to update
      const targetWeekStart = getWeekStartDate(currentDate);
      const weekKey = targetWeekStart.toISOString().split('T')[0];
      
      // Get the correct meal plan (current or from global storage)
      let targetPlan = mealPlan;
      if (!targetPlan || targetPlan.weekStartDate.toISOString().split('T')[0] !== weekKey) {
        targetPlan = globalMealPlans.get(weekKey) || null;
        if (!targetPlan) {
          targetPlan = createEmptyMealPlan('current-user', targetWeekStart);
        }
      }
      
      const updatedPlan = { ...targetPlan };
      const targetDay = updatedPlan.days[selectedSlot.dayOfWeek]; // Use array index
      
      if (targetDay) {
        const meals = targetDay[selectedSlot.mealType as keyof typeof targetDay] as MealSlot[];
        meals.push(mealSlot);
        updatedPlan.updatedAt = new Date();
        
        // Update both local state and global storage
        setMealPlan(updatedPlan);
        setMealPlans([updatedPlan]);
        
        const updatedGlobalPlans = new Map(globalMealPlans);
        updatedGlobalPlans.set(weekKey, updatedPlan);
        setGlobalMealPlans(updatedGlobalPlans);
      }
      
      setShowQuickAdd(false);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Error adding meal:', error);
    }
  };

  // Export handlers
  const handleExportMealPlan = async () => {
    try {
      if (viewMode === 'today') {
        await captureTodayViewScreenshot();
      } else if (viewMode === 'weekly') {
        await captureWeeklyCalendarScreenshot();
      } else if (viewMode === 'monthly') {
        await captureMonthlyCalendarScreenshot();
      }
    } catch (error) {
      console.error('Screenshot failed:', error);
    }
  };

  const handleSavePlan = async (options: SaveOptions) => {
    setIsSaving(true);
    try {
      if (options.saveToGoogleCalendar && mealPlan) {
        await exportToGoogleCalendar(mealPlan);
      }
      if (options.includeShoppingList && mealPlan) {
        // Shopping list generation logic here
        console.log('Generating shopping list...');
      }
      
      setShowSaveModal(false);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate stats
  const totalRecipes = mealPlan?.days?.reduce((total, day) => 
    total + day.breakfast.length + day.lunch.length + day.dinner.length + day.snacks.length, 0
  ) || 0;

  const plannedDays = mealPlan?.days?.filter(day =>
    day.breakfast.length > 0 || day.lunch.length > 0 || day.dinner.length > 0 || day.snacks.length > 0
  ).length || 0;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Meal Planning</h1>
            <p className="text-gray-600">Plan your weekly meals and create shopping lists</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportMealPlan}
              disabled={!mealPlan && !mealPlans.length}
            >
              <Download className="h-4 w-4 mr-2" />
              Screenshot
            </Button>
            <Button
              onClick={() => setShowSaveModal(true)}
              disabled={(!mealPlan && !mealPlans.length) || isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Plan'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Recipes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalRecipes}
                  </p>
                </div>
                <CalendarDays className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Planned Days</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {plannedDays}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Shopping List</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(mealPlan?.shoppingListGenerated) ? 'Yes' : 'No'}
                  </p>
                </div>
                <Save className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Section - Moved below stats */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {/* Previous Navigation Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                className="h-10 w-10 p-0 bg-white hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* View Mode Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex-1 justify-between bg-white hover:bg-gray-50 border-blue-200"
                  >
                    <div className="flex items-center justify-center gap-1 flex-1">
                      {viewMode === 'today' && '📅'}
                      {viewMode === 'weekly' && '📆'}
                      {viewMode === 'monthly' && '🗓️'}
                      <div className="text-center">
                        <div className="font-medium text-sm">
                          {viewMode === 'today' && 'Today'}
                          {viewMode === 'weekly' && 'This Week'}
                          {viewMode === 'monthly' && 'This Month'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getDateRangeText()}
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-white">
                {/* Current View Options */}
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Current View
                </div>
                <DropdownMenuItem 
                  onClick={handleToday}
                  disabled={currentDate.toDateString() === new Date().toDateString()}
                  className="hover:bg-gray-50"
                >
                  🎯 Go to Today
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Today Navigation */}
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Daily View
                </div>
                <DropdownMenuItem onClick={() => setViewMode('today')} className="hover:bg-gray-50">
                  📅 Today
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    setViewMode('today');
                    handleNext();
                  }} 
                  className="hover:bg-gray-50 text-sm pl-6"
                >
                  → Tomorrow
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    setViewMode('today');
                    handlePrevious();
                  }} 
                  className="hover:bg-gray-50 text-sm pl-6"
                >
                  ← Yesterday
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Week Navigation */}
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Weekly View
                </div>
                <DropdownMenuItem onClick={() => setViewMode('weekly')} className="hover:bg-gray-50">
                  📆 This Week
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    setViewMode('weekly');
                    handleNext();
                  }} 
                  className="hover:bg-gray-50 text-sm pl-6"
                >
                  → Next Week
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    setViewMode('weekly');
                    handlePrevious();
                  }} 
                  className="hover:bg-gray-50 text-sm pl-6"
                >
                  ← Last Week
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Month Navigation */}
                <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Monthly View
                </div>
                <DropdownMenuItem onClick={() => setViewMode('monthly')} className="hover:bg-gray-50">
                  🗓️ This Month
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    setViewMode('monthly');
                    handleNext();
                  }} 
                  className="hover:bg-gray-50 text-sm pl-6"
                >
                  → Next Month
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    setViewMode('monthly');
                    handlePrevious();
                  }} 
                  className="hover:bg-gray-50 text-sm pl-6"
                >
                  ← Last Month
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Next Navigation Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              className="h-10 w-10 p-0 bg-white hover:bg-gray-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          </CardContent>
        </Card>

        {/* Calendar Views */}
        <div className="bg-white rounded-lg border shadow-sm">
          {viewMode === 'today' && (
            <div className="p-6">
              <TodayView
                currentDate={currentDate}
                mealPlans={Array.from(globalMealPlans.values())}
                onAddMeal={handleAddMeal}
                onRemoveMeal={handleRemoveMeal}
              />
            </div>
          )}
          
          {viewMode === 'weekly' && mealPlan && (
            <WeeklyCalendar
              mealPlan={mealPlan}
              currentDate={currentDate}
              onMealPlanChange={(updatedPlan) => {
                setMealPlan(updatedPlan);
                setMealPlans([updatedPlan]);
                
                // Update global storage
                const weekKey = updatedPlan.weekStartDate.toISOString().split('T')[0];
                const updatedGlobalPlans = new Map(globalMealPlans);
                updatedGlobalPlans.set(weekKey, updatedPlan);
                setGlobalMealPlans(updatedGlobalPlans);
              }}
              onAddMeal={handleAddMeal}
              onRemoveMeal={handleRemoveMeal}
            />
          )}
          
          {viewMode === 'monthly' && (
            <MonthlyCalendar
              currentDate={currentDate}
              mealPlans={Array.from(globalMealPlans.values())}
              onAddRecipe={handleAddMealFromDate}
              onRemoveMeal={handleRemoveMeal}
              onEditMeal={(meal: MealSlot, date: Date, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => {
                // Convert date to proper slot format for editing
                const weekStart = getWeekStartDate(date);
                const daysDiff = Math.floor((date.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
                
                const slot: MealPlanningSlot = {
                  dayOfWeek: daysDiff,
                  mealType: mealType,
                  recipeId: meal.recipeId,
                  recipeName: meal.recipeName,
                  servings: meal.servings,
                  prepTime: meal.prepTime,
                  notes: meal.notes
                };
                
                setSelectedSlot(slot);
                setShowQuickAdd(true);
              }}
            />
          )}
        </div>

        {/* Modals */}
        {showQuickAdd && selectedSlot && (
          <QuickAddRecipeModal
            isOpen={showQuickAdd}
            onClose={() => {
              setShowQuickAdd(false);
              setSelectedSlot(null);
            }}
            onAddRecipe={(recipeId: string, recipeName: string, servings?: number) => {
              handleQuickAddSubmit({ id: recipeId, name: recipeName, servings });
            }}
            mealType={selectedSlot.mealType}
            dayName={selectedSlot.dayOfWeek !== undefined ? format(addDays(currentDate, selectedSlot.dayOfWeek), 'EEEE') : undefined}
          />
        )}

        {showSaveModal && (
          <SavePlanModal
            isOpen={showSaveModal}
            onClose={() => setShowSaveModal(false)}
            onSave={handleSavePlan}
          />
        )}
      </div>
    </Layout>
  );
}