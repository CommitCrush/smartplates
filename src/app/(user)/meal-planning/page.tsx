/**
 * Meal Planning Page
 * 
 * Main page for weekly meal planning with drag & drop calendar
 * Uses mock recipe service until real recipe system is ready
 */

'use client';

import React, { useState, useEffect } from 'react';
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
import type { IMealPlan, MealSlot } from '@/types/meal-planning';
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
  onAddRecipe?: (date: Date, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => void;
}

function TodayView({ currentDate, mealPlans, onAddRecipe }: TodayViewProps) {
  // Find meals for the current date
  const todayMeals = mealPlans
    .flatMap(plan => plan.days)
    .find(day => day.date.toDateString() === currentDate.toDateString());

  const mealTypes = [
    { key: 'breakfast' as const, label: 'Breakfast', emoji: '🌅', color: 'bg-orange-50 hover:bg-orange-100 border-orange-200' },
    { key: 'lunch' as const, label: 'Lunch', emoji: '☀️', color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200' },
    { key: 'dinner' as const, label: 'Dinner', emoji: '🌙', color: 'bg-blue-50 hover:bg-blue-100 border-blue-200' },
    { key: 'snacks' as const, label: 'Snacks', emoji: '🍎', color: 'bg-green-50 hover:bg-green-100 border-green-200' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Meal Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mealTypes.map(({ key, label, emoji, color }) => {
              const meals = todayMeals?.[key] || [];
              
              return (
                <Card key={key} className={`${color} border-2 transition-colors`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="text-xl">{emoji}</span>
                        {label}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {meals.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {meals.length > 0 ? (
                      meals.map((meal, index) => (
                        <div
                          key={index}
                          className="p-3 bg-white rounded-lg shadow-sm border"
                        >
                          <h4 className="font-medium text-sm mb-1">
                            {meal.recipeName}
                          </h4>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{meal.servings} servings</span>
                            {meal.cookingTime && (
                              <span>{meal.cookingTime + (meal.prepTime || 0)} min</span>
                            )}
                          </div>
                          {meal.notes && (
                            <p className="text-xs text-gray-600 mt-1 italic">
                              {meal.notes}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-400">
                        <p className="text-sm mb-3">No {label.toLowerCase()} planned</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAddRecipe?.(currentDate, key)}
                          className="bg-white hover:bg-gray-50"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Add {label}
                        </Button>
                      </div>
                    )}
                    
                    {meals.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAddRecipe?.(currentDate, key)}
                        className="w-full bg-white hover:bg-gray-50"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Add Another
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* Daily Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Daily Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Total Meals:</span>{' '}
                {(todayMeals?.breakfast?.length || 0) + 
                 (todayMeals?.lunch?.length || 0) + 
                 (todayMeals?.dinner?.length || 0) + 
                 (todayMeals?.snacks?.length || 0)}
              </div>
              <div>
                <span className="font-medium">Breakfast:</span>{' '}
                {todayMeals?.breakfast?.length || 0}
              </div>
              <div>
                <span className="font-medium">Lunch:</span>{' '}
                {todayMeals?.lunch?.length || 0}
              </div>
              <div>
                <span className="font-medium">Dinner:</span>{' '}
                {todayMeals?.dinner?.length || 0}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ========================================
// Main Component
// ========================================

type ViewMode = 'today' | 'weekly' | 'monthly';

export default function MealPlanningPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mealPlan, setMealPlan] = useState<IMealPlan | undefined>();
  const [mealPlans, setMealPlans] = useState<IMealPlan[]>([]);
  const [isAddRecipeModalOpen, setIsAddRecipeModalOpen] = useState(false);
  const [selectedMealSlot, setSelectedMealSlot] = useState<{
    dayIndex?: number;
    date?: Date;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
    dayName: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // TODO: Re-add toast notifications when ToastProvider is set up

  // Initialize with current week meal plan
  useEffect(() => {
    initializeMealPlan();
  }, []);

  // Sync current meal plan with meal plans array for monthly view
  useEffect(() => {
    if (mealPlan) {
      setMealPlans(prev => {
        const existingIndex = prev.findIndex(plan => 
          plan.weekStartDate.getTime() === mealPlan.weekStartDate.getTime()
        );
        
        if (existingIndex >= 0) {
          return prev.map((plan, index) => 
            index === existingIndex ? mealPlan : plan
          );
        } else {
          return [...prev, mealPlan];
        }
      });
    }
  }, [mealPlan]);

  const initializeMealPlan = async () => {
    setIsLoading(true);
    try {
      // Create a mock meal plan for the current week
      const currentWeekStart = getWeekStartDate(new Date());
      const mockMealPlan = createEmptyMealPlan('mock-user-1', currentWeekStart);

      // Add some sample meals for demonstration
      await addSampleMeals(mockMealPlan);

      setMealPlan(mockMealPlan);
      
      console.log("Meal Plan Loaded: Your weekly meal plan is ready for planning!");
    } catch (error) {
      console.error('Failed to initialize meal plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add some sample meals for demo purposes
  const addSampleMeals = async (plan: IMealPlan) => {
    try {
      const recipes = await MockRecipeService.getAllRecipes();
      
      // Add breakfast to Monday
      const pancakes = recipes.find(r => r.id === 'breakfast-1');
      if (pancakes && plan.days[0]) {
        plan.days[0].breakfast.push(mockRecipeToMealSlot(pancakes, 2));
      }

      // Add lunch to Tuesday  
      const quinoaBowl = recipes.find(r => r.id === 'lunch-2');
      if (quinoaBowl && plan.days[1]) {
        plan.days[1].lunch.push(mockRecipeToMealSlot(quinoaBowl, 1));
      }

      // Add dinner to Wednesday
      const carbonara = recipes.find(r => r.id === 'dinner-1');
      if (carbonara && plan.days[2]) {
        plan.days[2].dinner.push(mockRecipeToMealSlot(carbonara, 4));
      }
    } catch (error) {
      console.error('Failed to add sample meals:', error);
    }
  };

  // Handle meal plan changes
  const handleMealPlanChange = (updatedMealPlan: IMealPlan) => {
    setMealPlan(updatedMealPlan);
  };

  // Update meal plan for the current week when date changes
  useEffect(() => {
    if (viewMode === 'weekly') {
      const weekStart = getWeekStartDate(currentDate);
      const existingPlan = mealPlans.find(plan => 
        plan.weekStartDate.getTime() === weekStart.getTime()
      );
      
      if (existingPlan) {
        setMealPlan(existingPlan);
      } else {
        // Create new meal plan for this week
        const newMealPlan = createEmptyMealPlan('mock-user-1', weekStart);
        setMealPlan(newMealPlan);
      }
    }
  }, [currentDate, viewMode, mealPlans]);

  // Handle opening add recipe modal for weekly view
  const handleAddRecipe = (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    setSelectedMealSlot({
      dayIndex,
      mealType,
      dayName: dayNames[dayIndex]
    });
    setIsAddRecipeModalOpen(true);
  };

  // Handle opening add recipe modal for monthly view
  const handleAddRecipeForDate = (date: Date, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => {
    setSelectedMealSlot({
      date,
      mealType,
      dayName: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    });
    setIsAddRecipeModalOpen(true);
  };

  // Handle adding recipe from modal
  const handleAddRecipeFromModal = async (recipeId: string, recipeName: string, servings: number = 1) => {
    if (!selectedMealSlot) return;

    try {
      const recipe = await MockRecipeService.getRecipeById(recipeId);
      if (!recipe) {
        console.log("Error: Recipe not found");
        return;
      }

      const newMeal: MealSlot = mockRecipeToMealSlot(recipe, servings);
      
      if (viewMode === 'weekly' && mealPlan && selectedMealSlot.dayIndex !== undefined) {
        // Weekly view - update current meal plan
        const updatedMealPlan = { ...mealPlan };
        const dayMeals = updatedMealPlan.days[selectedMealSlot.dayIndex];
        
        if (dayMeals) {
          dayMeals[selectedMealSlot.mealType].push(newMeal);
          setMealPlan(updatedMealPlan);
          
          // Also update mealPlans array for cross-view consistency
          setMealPlans(prev => {
            const existingIndex = prev.findIndex(plan => 
              plan.weekStartDate.getTime() === updatedMealPlan.weekStartDate.getTime()
            );
            if (existingIndex >= 0) {
              return prev.map((plan, index) => 
                index === existingIndex ? updatedMealPlan : plan
              );
            } else {
              return [...prev, updatedMealPlan];
            }
          });
        }
      } else if ((viewMode === 'monthly' || viewMode === 'today') && selectedMealSlot.date) {
        // Monthly view - find or create meal plan for the selected date
        const targetDate = selectedMealSlot.date;
        const weekStart = getWeekStartDate(targetDate);
        
        let targetMealPlan = mealPlans.find(plan => 
          plan.weekStartDate.getTime() === weekStart.getTime()
        );
        
        if (!targetMealPlan) {
          // Create new meal plan for this week
          targetMealPlan = {
            userId: 'mock-user-1',
            weekStartDate: weekStart,
            weekEndDate: new Date(weekStart.getTime() + (6 * 24 * 60 * 60 * 1000)),
            title: `Meal Plan - Week of ${weekStart.toLocaleDateString()}`,
            days: [],
            shoppingListGenerated: false,
            isTemplate: false,
            tags: [],
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          // Create 7 days with empty meals
          for (let i = 0; i < 7; i++) {
            const dayDate = new Date(weekStart.getTime() + (i * 24 * 60 * 60 * 1000));
            targetMealPlan.days.push({
              date: dayDate,
              breakfast: [],
              lunch: [],
              dinner: [],
              snacks: []
            });
          }
        }
        
        // Find the specific day and add the meal
        const dayMeals = targetMealPlan.days.find(day => 
          day.date.toDateString() === targetDate.toDateString()
        );
        
        if (dayMeals) {
          dayMeals[selectedMealSlot.mealType].push(newMeal);
          
          // Update meal plans array
          setMealPlans(prev => {
            const existing = prev.find(plan => 
              plan.weekStartDate.getTime() === weekStart.getTime()
            );
            if (existing) {
              return prev.map(plan => 
                plan.weekStartDate.getTime() === weekStart.getTime() ? targetMealPlan! : plan
              );
            } else {
              return [...prev, targetMealPlan!];
            }
          });
          
          // Also update current mealPlan if it's the same week as the current view
          if (mealPlan && mealPlan.weekStartDate.getTime() === weekStart.getTime()) {
            setMealPlan(targetMealPlan!);
          }
        }
      }
      
      console.log(`Recipe Added: ${recipeName} added to ${selectedMealSlot.mealType} on ${selectedMealSlot.dayName}`);
    } catch (error) {
      console.error('Failed to add recipe:', error);
    }

    setIsAddRecipeModalOpen(false);
    setSelectedMealSlot(null);
  };

  // Handle saving meal plan with options
  const handleSaveMealPlan = async (options: SaveOptions) => {
    if (!mealPlan) return;

    setIsSaving(true);
    
    try {
      // Save locally if requested
      if (options.saveLocally) {
        // In a real app, this would save to the API
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("Meal Plan Saved: Saved to app database successfully!");
      }

      // Save to Google Calendar if requested
      if (options.saveToGoogleCalendar && mealPlan) {
        const calendarResult = await exportToGoogleCalendar(mealPlan);
        if (calendarResult.success) {
          console.log("Google Calendar: " + calendarResult.message);
          
          // Also provide ICS download as backup
          downloadICSFile(mealPlan);
          console.log("ICS file downloaded as backup for calendar import");
        } else {
          console.error("Google Calendar export failed:", calendarResult.message);
          
          // Fallback: download ICS file
          downloadICSFile(mealPlan);
          console.log("Fallback: ICS file downloaded for manual calendar import");
        }
      }

      // Generate shopping list if requested
      if (options.includeShoppingList) {
        // In a real app, this would generate a shopping list
        console.log("Shopping List: Generated from meal plan successfully!");
      }
      
      console.log(`Meal Plan "${options.mealPlanTitle || 'Untitled'}" saved successfully!`);
    } catch (error) {
      console.error('Failed to save meal plan:', error);
      throw error; // Re-throw to let modal handle the error
    } finally {
      setIsSaving(false);
    }
  };

  // Handle exporting meal plan as screenshot
  const handleExportMealPlan = async () => {
    try {
      let result;
      
      switch (viewMode) {
        case 'today':
          result = await captureTodayViewScreenshot({
            filename: `today-meal-plan-${currentDate.toISOString().split('T')[0]}.png`
          });
          break;
        case 'weekly':
          result = await captureWeeklyCalendarScreenshot('.weekly-calendar-container', {
            filename: `weekly-meal-plan-${currentDate.toISOString().split('T')[0]}.png`
          });
          break;
        case 'monthly':
          result = await captureMonthlyCalendarScreenshot({
            filename: `monthly-meal-plan-${currentDate.toISOString().split('T')[0]}.png`
          });
          break;
        default:
          result = await captureWeeklyCalendarScreenshot('.meal-planning-container');
      }

      if (result.success) {
        console.log(`Screenshot downloaded: ${result.filename}`);
      } else {
        console.error('Screenshot failed:', result.error);
        
        // Fallback to PDF if screenshot fails
        if (mealPlan) {
          await MealPlanPDFService.downloadWeeklyMealPlan(mealPlan, true);
          console.log("Fallback: PDF download completed (screenshot failed)");
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Navigation functions
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'today':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'monthly':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
    }
    
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'today':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'monthly':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
    }
    
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getDateRangeText = () => {
    switch (viewMode) {
      case 'today':
        return currentDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        });
      case 'weekly':
        const weekStart = new Date(currentDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start on Sunday
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'monthly':
        return currentDate.toLocaleDateString('en-US', { 
          month: 'long', 
          year: 'numeric' 
        });
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
              <h2 className="text-xl font-semibold mb-2">Loading Meal Plan</h2>
              <p className="text-muted-foreground">Setting up your weekly planning...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="meal-planning-container container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Meal Planning
              </h1>
              <Badge variant="outline" className="text-sm font-normal">
                {getDateRangeText()}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Plan your {viewMode === 'today' ? 'daily' : viewMode} meals with drag & drop simplicity
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Unified Navigation Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-48 justify-between bg-white border-gray-300">
                  <div className="flex items-center gap-2">
                    <ChevronLeft 
                      className="h-4 w-4 cursor-pointer hover:text-primary" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevious();
                      }}
                    />
                    <div className="flex-1 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {viewMode === 'today' && '📅'}
                        {viewMode === 'weekly' && '📆'}
                        {viewMode === 'monthly' && '🗓️'}
                        <span className="font-medium text-sm">
                          {viewMode === 'today' && 'Today'}
                          {viewMode === 'weekly' && 'This Week'}
                          {viewMode === 'monthly' && 'This Month'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {getDateRangeText()}
                      </div>
                    </div>
                    <ChevronRight 
                      className="h-4 w-4 cursor-pointer hover:text-primary" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                      }}
                    />
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
                  � Today
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
                  � This Week
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

            {/* Action Buttons */}
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
        </div>

        {/* Stats Cards */}
        {mealPlan && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {mealPlan.days?.reduce((total, day) => 
                    total + (day?.breakfast?.length || 0) + 
                    (day?.lunch?.length || 0) + 
                    (day?.dinner?.length || 0) + 
                    (day?.snacks?.length || 0), 0
                  ) || 0}
                </div>
                <p className="text-xs text-muted-foreground">Total Meals</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {mealPlan.days?.filter(day => 
                    (day?.breakfast?.length || 0) + 
                    (day?.lunch?.length || 0) + 
                    (day?.dinner?.length || 0) + 
                    (day?.snacks?.length || 0) > 0
                  ).length || 0}/7
                </div>
                <p className="text-xs text-muted-foreground">Days Planned</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {mealPlan.shoppingListGenerated ? 'Yes' : 'No'}
                </div>
                <p className="text-xs text-muted-foreground">Shopping List</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">Mock</div>
                <p className="text-xs text-muted-foreground">Data Mode</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Calendar Views */}
        {viewMode === 'today' ? (
          <div className="today-view-container">
            <TodayView
              currentDate={currentDate}
              mealPlans={mealPlans}
              onAddRecipe={handleAddRecipeForDate}
            />
          </div>
        ) : viewMode === 'weekly' ? (
          <div className="weekly-calendar-container">
            <WeeklyCalendar
              mealPlan={mealPlan}
              onMealPlanChange={(updatedPlan) => {
                handleMealPlanChange(updatedPlan);
                // Also sync with mealPlans array for cross-view consistency
                setMealPlans(prev => {
                  const existingIndex = prev.findIndex(plan => 
                    plan.weekStartDate.getTime() === updatedPlan.weekStartDate.getTime()
                  );
                  if (existingIndex >= 0) {
                    return prev.map((plan, index) => 
                      index === existingIndex ? updatedPlan : plan
                    );
                  } else {
                    return [...prev, updatedPlan];
                  }
                });
              }}
              onAddRecipe={handleAddRecipe}
            />
          </div>
        ) : (
          <div className="monthly-calendar-container">
            <MonthlyCalendar
              currentDate={currentDate}
              mealPlans={mealPlans}
              onMealPlansChange={setMealPlans}
              onAddRecipe={handleAddRecipeForDate}
            />
          </div>
        )}

        {/* Quick Add Recipe Modal */}
        <QuickAddRecipeModal
          isOpen={isAddRecipeModalOpen}
          onClose={() => {
            setIsAddRecipeModalOpen(false);
            setSelectedMealSlot(null);
          }}
          onAddRecipe={handleAddRecipeFromModal}
          mealType={selectedMealSlot?.mealType || 'breakfast'}
          dayName={selectedMealSlot?.dayName || 'today'}
        />

        {/* Help Text */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How to Use</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• <strong>View Selector:</strong> Choose between Today, This Week, or This Month views</p>
            <p>• <strong>Navigation:</strong> Use arrow buttons and "Today" button to navigate between time periods</p>
            <p>• <strong>Add Recipes:</strong> Click the + button in any meal slot to search and add recipes with advanced filters</p>
            <p>• <strong>Drag & Drop:</strong> Drag meals between different days and meal types (weekly view)</p>
            <p>• <strong>PDF Export:</strong> Download complete meal plans with ingredients as formatted PDF</p>
            <p>• <strong>Save Options:</strong> Save to app, sync with Google Calendar, or generate shopping lists</p>
            <p>• <strong>Dietary Filters:</strong> Filter recipes by diet type, allergies, cooking time, and difficulty</p>
            <p>• <strong>Mock Data:</strong> Currently using sample recipes - will integrate with real recipe system later</p>
          </CardContent>
        </Card>

        {/* Save Plan Modal */}
        <SavePlanModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onSave={handleSaveMealPlan}
          isLoading={isSaving}
        />
      </div>
    </Layout>
  );
}