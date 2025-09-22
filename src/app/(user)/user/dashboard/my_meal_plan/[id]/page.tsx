/**
 * Meal Planning Page
 * 
 * Main page for weekly meal planning with drag & drop calendar
 * Uses mock recipe service until real recipe system is ready
 */

'use client';

import React, { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { Calendar, CalendarDays, Save, Download, ChevronLeft, ChevronRight, ChevronDown, Plus } from 'lucide-react';
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
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Layout from '@/components/layout/Layout';
import { WeeklyCalendar } from '@/components/meal-planning/calendar/WeeklyCalendar';
import { MonthlyCalendar } from '@/components/meal-planning/calendar/MonthlyCalendar';
import { QuickAddRecipeModal } from '@/components/meal-planning/modals/QuickAddRecipeModal';
import { SavePlanModal, type SaveOptions } from '@/components/meal-planning/modals/SavePlanModal';
import { getWeekStartDate, createEmptyMealPlan } from '@/types/meal-planning';
import type { IMealPlan, MealSlot, MealPlanningSlot } from '@/types/meal-planning';
// ...existing code...
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
  onEditMeal: (slot: MealPlanningSlot) => void;
  onRemoveMeal: (planId: string, day: number, mealType: string, index: number) => void;
}

const TodayView: React.FC<TodayViewProps> = ({ currentDate, mealPlans, onAddMeal, onEditMeal, onRemoveMeal }) => {
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

  // Meal type configurations with different colors and styles
  const mealTypeConfig = {
    breakfast: {
      emoji: '🍳',
      title: 'Breakfast',
      bgColor: 'bg-gradient-to-br from-orange-50 to-amber-50',
      borderColor: 'border-orange-200',
      cardBg: 'bg-white/80 backdrop-blur-sm',
      textColor: 'text-orange-800',
      buttonColor: 'bg-orange-500 hover:bg-orange-600'
    },
    lunch: {
      emoji: '🥗',
      title: 'Lunch', 
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      cardBg: 'bg-white/80 backdrop-blur-sm',
      textColor: 'text-green-800',
      buttonColor: 'bg-green-500 hover:bg-green-600'
    },
    dinner: {
      emoji: '🍽️',
      title: 'Dinner',
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50', 
      borderColor: 'border-blue-200',
      cardBg: 'bg-white/80 backdrop-blur-sm',
      textColor: 'text-blue-800',
      buttonColor: 'bg-blue-500 hover:bg-blue-600'
    },
    snacks: {
      emoji: '🍎',
      title: 'Snacks',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
      borderColor: 'border-purple-200', 
      cardBg: 'bg-white/80 backdrop-blur-sm',
      textColor: 'text-purple-800',
      buttonColor: 'bg-purple-500 hover:bg-purple-600'
    }
  };

  const renderMealCard = (meal: any, index: number, mealType: string, config: any) => (
    <div key={index} className={`${config.cardBg} border ${config.borderColor} rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200`}>
      {/* Meal Image Placeholder */}
      <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
        {meal.image ? (
          <img 
            src={meal.image} 
            alt={meal.recipeName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-4xl opacity-50">
            {config.emoji}
          </div>
        )}
      </div>
      
      {/* Recipe Name */}
      <h4 className={`font-semibold text-lg mb-2 ${config.textColor}`}>
        {meal.recipeName}
      </h4>
      
      {/* Meal Details */}
      <div className="text-sm text-gray-600 mb-3 space-y-1">
        <div className="flex items-center gap-2">
          <span>👥</span>
          <span>{meal.servings} servings</span>
        </div>
        <div className="flex items-center gap-2">
          <span>⏱️</span>
          <span>{meal.prepTime} min</span>
        </div>
        {meal.notes && (
          <div className="flex items-start gap-2">
            <span>📝</span>
            <span className="text-xs">{meal.notes}</span>
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Convert JavaScript day (0=Sunday) to meal planning day (0=Monday)
            const jsDay = currentDate.getDay();
            const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1; // Convert Sunday(0) to 6, Mon(1) to 0, etc.
            onEditMeal({
              dayOfWeek,
              mealType: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snacks',
              recipeId: meal.recipeId,
              recipeName: meal.recipeName,
              servings: meal.servings,
              prepTime: meal.prepTime,
              ingredients: meal.ingredients || [],
              tags: meal.tags || [],
              notes: meal.notes
            });
          }}
          className="flex-1 text-xs"
        >
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Convert JavaScript day (0=Sunday) to meal planning day (0=Monday)
            const jsDay = currentDate.getDay();
            const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1; // Convert Sunday(0) to 6, Mon(1) to 0, etc.
            onRemoveMeal(meal.planId, dayOfWeek, mealType, index);
          }}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          Delete
        </Button>
      </div>
    </div>
  );

  const renderMealColumn = (mealType: keyof typeof mealTypeConfig, meals: any[]) => {
    const config = mealTypeConfig[mealType];
    
    return (
      <div key={mealType} className={`${config.bgColor} ${config.borderColor} border-2 rounded-2xl p-4 min-h-[500px]`}>
        {/* Column Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">{config.emoji}</div>
          <h3 className={`text-xl font-bold ${config.textColor}`}>
            {config.title}
          </h3>
          <div className="text-sm text-gray-500">
            {meals.length} meal{meals.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Meals Grid */}
        <div className="space-y-4">
          {meals.length > 0 ? (
            <>
              {meals.map((meal, index) => renderMealCard(meal, index, mealType, config))}
              
              {/* Add More Button */}
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className={`border-dashed border-2 ${config.borderColor} ${config.textColor} hover:${config.bgColor} transition-colors`}
                  onClick={() => {
                    // Convert JavaScript day (0=Sunday) to meal planning day (0=Monday)
                    const jsDay = currentDate.getDay();
                    const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1; // Convert Sunday(0) to 6, Mon(1) to 0, etc.
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
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Another {config.title}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <div className="text-6xl opacity-30 mb-4">{config.emoji}</div>
                <p>No {mealType} planned</p>
              </div>
              <Button
                className={`${config.buttonColor} text-white`}
                onClick={() => {
                  // Convert JavaScript day (0=Sunday) to meal planning day (0=Monday)
                  const jsDay = currentDate.getDay();
                  const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1; // Convert Sunday(0) to 6, Mon(1) to 0, etc.
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
              >
                Add {config.title}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {currentDate.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </h2>
        <p className="text-gray-600">Your meal plan for today</p>
      </div>

      {/* Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderMealColumn('breakfast', mealsByType.breakfast)}
        {renderMealColumn('lunch', mealsByType.lunch)}
        {renderMealColumn('dinner', mealsByType.dinner)}
        {renderMealColumn('snacks', mealsByType.snacks)}
      </div>
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

  // Get or create meal plan for a specific week
  const getOrCreateMealPlan = (date: Date): IMealPlan => {
    const weekStart = getWeekStartDate(date);
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (globalMealPlans.has(weekKey)) {
      return globalMealPlans.get(weekKey)!;
    } else {
      console.log('Creating new meal plan for week:', weekKey);
      const newPlan = createEmptyMealPlan('current-user', weekStart);
      const updatedGlobalPlans = new Map(globalMealPlans);
      updatedGlobalPlans.set(weekKey, newPlan);
      setGlobalMealPlans(updatedGlobalPlans);
      return newPlan;
    }
  };

  // Update a specific meal plan and sync with global storage
  const updateMealPlan = (updatedPlan: IMealPlan) => {
    const weekKey = updatedPlan.weekStartDate.toISOString().split('T')[0];
    console.log('Updating meal plan for week:', weekKey, 'with', updatedPlan.days.reduce((total, day) => total + day.breakfast.length + day.lunch.length + day.dinner.length + day.snacks.length, 0), 'total meals');
    
    // Update global storage
    const updatedGlobalPlans = new Map(globalMealPlans);
    updatedGlobalPlans.set(weekKey, updatedPlan);
    setGlobalMealPlans(updatedGlobalPlans);
    
    // Update local state if this is the current week
    const currentWeekKey = getWeekStartDate(currentDate).toISOString().split('T')[0];
    if (weekKey === currentWeekKey) {
      setMealPlan(updatedPlan);
      setMealPlans([updatedPlan]);
    }
  };

  // Initialize meal plan on component mount and when date/view changes
  useEffect(() => {
    const weekStart = getWeekStartDate(currentDate);
    const weekKey = weekStart.toISOString().split('T')[0];
    
    // Always try to get existing meal plan first, or create if needed
    const currentPlan = getOrCreateMealPlan(currentDate);
    const currentMealPlanKey = mealPlan?.weekStartDate.toISOString().split('T')[0];
    
    if (currentMealPlanKey !== weekKey) {
      console.log('Loading/syncing meal plan for week:', weekKey, 'view mode:', viewMode, 'with', currentPlan.days.reduce((total, day) => total + day.breakfast.length + day.lunch.length + day.dinner.length + day.snacks.length, 0), 'meals');
      setMealPlan(currentPlan);
      setMealPlans([currentPlan]);
    }
  }, [currentDate, viewMode]); // Update when currentDate OR viewMode changes

  // Function to refresh meal plan data
  const refreshCurrentMealPlan = () => {
    const currentPlan = getOrCreateMealPlan(currentDate);
    const weekKey = getWeekStartDate(currentDate).toISOString().split('T')[0];
    console.log('Refreshing meal plan for week:', weekKey, 'with', currentPlan.days.reduce((total, day) => total + day.breakfast.length + day.lunch.length + day.dinner.length + day.snacks.length, 0), 'meals');
    setMealPlan(currentPlan);
    setMealPlans([currentPlan]);
  };

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
    // Normalize the date to avoid timezone issues
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    
    // Find which week this date belongs to and convert to dayOfWeek index
    const weekStart = getWeekStartDate(normalizedDate);
    const daysDiff = Math.floor((normalizedDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log('Adding meal for date:', normalizedDate.toDateString(), 'weekStart:', weekStart.toDateString(), 'daysDiff:', daysDiff);
    
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
      prepTime: 30,
      targetDate: normalizedDate // Store the actual target date
    };
    
    setSelectedSlot(slot);
    setShowQuickAdd(true);
  };

  const handleRemoveMeal = (planId: string, day: number, mealType: string, index: number) => {
    // Find the correct meal plan (could be from any week if called from monthly view)
    let targetPlan = mealPlan;
    
    // If no current meal plan or if removing from a different week, find the correct one
    if (!targetPlan) {
      console.warn('No meal plan available for removal');
      return;
    }

    const updatedPlan = { ...targetPlan };
    const targetDay = updatedPlan.days[day];
    
    if (targetDay) {
      const meals = targetDay[mealType as keyof typeof targetDay] as MealSlot[];
      meals.splice(index, 1);
      updatedPlan.updatedAt = new Date();
      
      console.log('Removing meal from day:', day, 'date:', targetDay.date.toDateString(), 'mealType:', mealType);
      
      // Update meal plan using centralized function
      updateMealPlan(updatedPlan);
    }
  };

  const handleQuickAddSubmit = async (recipeData: any) => {
    if (!selectedSlot || selectedSlot.dayOfWeek === undefined || !selectedSlot.mealType) return;

    try {
      console.log('handleQuickAddSubmit: Adding recipe from cache:', recipeData);
      
      // Map cached recipe data to MealSlot format
      const mealSlot = {
        recipeId: recipeData.id || recipeData.name,
        recipeName: recipeData.name || recipeData.title,
        servings: recipeData.servings || 2,
        prepTime: recipeData.cookingTime || recipeData.readyInMinutes || 30,
        cookingTime: recipeData.cookingTime || recipeData.readyInMinutes || 30,
        image: recipeData.image || '',
        ingredients: recipeData.extendedIngredients?.map((ing: any) => ing.original) || [],
        tags: recipeData.diets || [],
        notes: ''
      };
      
      // Determine which week's meal plan to update - use targetDate if available (from monthly calendar)
      const targetDate = selectedSlot.targetDate || currentDate;
      const targetWeekStart = getWeekStartDate(targetDate);
      const weekKey = targetWeekStart.toISOString().split('T')[0];
      
      console.log('handleQuickAddSubmit: Using targetDate:', targetDate.toDateString(), 'weekStart:', targetWeekStart.toDateString(), 'weekKey:', weekKey);
      console.log('handleQuickAddSubmit: selectedSlot.dayOfWeek:', selectedSlot.dayOfWeek, 'targetDate set by user:', selectedSlot.targetDate?.toDateString());
      
      // Get or create the meal plan for this week
      const targetPlan = getOrCreateMealPlan(targetDate);
      const updatedPlan = { ...targetPlan };
      const targetDay = updatedPlan.days[selectedSlot.dayOfWeek]; // Use array index
      
      console.log('Adding meal to day:', selectedSlot.dayOfWeek, 'date:', targetDay?.date.toDateString(), 'mealType:', selectedSlot.mealType);
      console.log('Week plan days:', updatedPlan.days.map((d, i) => `${i}: ${d.date.toDateString()}`));
      
      if (targetDay) {
        const meals = targetDay[selectedSlot.mealType as keyof typeof targetDay] as MealSlot[];
        meals.push(mealSlot);
        updatedPlan.updatedAt = new Date();
        
        // Update meal plan using centralized function
        updateMealPlan(updatedPlan);
        
        console.log('Meal added successfully to', targetDay.date.toDateString());
        console.log('Global meal plans now contain:', Array.from(globalMealPlans.keys()));
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

  // Calculate stats - always use all meal plans for consistent stats across views
  const calculateStats = () => {
    const allMealPlans = Array.from(globalMealPlans.values());
    
    if (allMealPlans.length === 0) {
      return { totalRecipes: 0, plannedDays: 0 };
    }
    
    const totalRecipes = allMealPlans.reduce((total, plan) => 
      total + plan.days.reduce((dayTotal, day) => 
        dayTotal + day.breakfast.length + day.lunch.length + day.dinner.length + day.snacks.length, 0
      ), 0
    );
    
    const plannedDays = allMealPlans.reduce((total, plan) => 
      total + plan.days.filter(day =>
        day.breakfast.length > 0 || day.lunch.length > 0 || day.dinner.length > 0 || day.snacks.length > 0
      ).length, 0
    );
    
    console.log('Stats calculated:', { totalRecipes, plannedDays, mealPlansCount: allMealPlans.length });
    
    return { totalRecipes, plannedDays };
  };

  const { totalRecipes, plannedDays } = calculateStats();

  return (
    <DndProvider backend={HTML5Backend}>
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
                <DropdownMenuItem onClick={() => { setViewMode('today'); refreshCurrentMealPlan(); }} className="hover:bg-gray-50">
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
                <DropdownMenuItem onClick={() => { setViewMode('weekly'); refreshCurrentMealPlan(); }} className="hover:bg-gray-50">
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
                <DropdownMenuItem onClick={() => { setViewMode('monthly'); refreshCurrentMealPlan(); }} className="hover:bg-gray-50">
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

            {/* Export/Download Buttons */}
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportMealPlan}
                className="flex items-center gap-2 bg-white hover:bg-gray-50"
                title="Take Screenshot"
              >
                <Download className="h-4 w-4" />
                Screenshot
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSaveModal(true)}
                className="flex items-center gap-2 bg-white hover:bg-gray-50"
                title="Save & Export Options"
              >
                <Save className="h-4 w-4" />
                Save Plan
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    if (!mealPlan) {
                      alert('No meal plan to download. Please add some meals first.');
                      return;
                    }
                    
                    // Simple text export as fallback
                    const mealPlanText = `Meal Plan - ${format(currentDate, 'MMMM do, yyyy')}\n\n` + 
                      mealPlan.days.map(day => {
                        const dateStr = format(new Date(day.date), 'EEEE, MMMM do');
                        const meals = [
                          `Breakfast: ${day.breakfast.map(m => m.recipeName || 'Unnamed Recipe').join(', ') || 'None'}`,
                          `Lunch: ${day.lunch.map(m => m.recipeName || 'Unnamed Recipe').join(', ') || 'None'}`,
                          `Dinner: ${day.dinner.map(m => m.recipeName || 'Unnamed Recipe').join(', ') || 'None'}`,
                          `Snacks: ${day.snacks.map(m => m.recipeName || 'Unnamed Recipe').join(', ') || 'None'}`
                        ].join('\n');
                        
                        return `${dateStr}\n${meals}\n${'='.repeat(50)}`;
                      }).join('\n\n');

                    // Create and download the file
                    const blob = new Blob([mealPlanText], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `meal-plan-${format(currentDate, 'yyyy-MM-dd')}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    console.log('Text download completed');
                  } catch (error) {
                    console.error('Download error:', error);
                    alert('Download failed. Please try again.');
                  }
                }}
                className="flex items-center gap-2 bg-white hover:bg-gray-50"
                title="Download as Text File"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
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
                onEditMeal={(slot) => {
                  setSelectedSlot(slot);
                  setShowQuickAdd(true);
                }}
                onRemoveMeal={handleRemoveMeal}
              />
            </div>
          )}
          
          {viewMode === 'weekly' && mealPlan && (
            <WeeklyCalendar
              mealPlan={mealPlan}
              mealPlans={Array.from(globalMealPlans.values())}
              currentDate={currentDate}
              onMealPlanChange={(updatedPlan) => {
                console.log('WeeklyCalendar onMealPlanChange called');
                updateMealPlan(updatedPlan);
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
                // Normalize the date to avoid timezone issues
                const normalizedDate = new Date(date);
                normalizedDate.setHours(0, 0, 0, 0);
                
                // Convert date to proper slot format for editing
                const weekStart = getWeekStartDate(normalizedDate);
                const daysDiff = Math.floor((normalizedDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
                
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
            onAddRecipe={(recipeId: string, recipeName: string, servings?: number, cookingTime?: number, image?: string) => {
              handleQuickAddSubmit({ id: recipeId, name: recipeName, servings, cookingTime, image });
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
    </DndProvider>
  );
}