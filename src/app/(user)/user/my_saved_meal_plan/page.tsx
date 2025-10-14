/**
 * Enhanced Saved Meal Plans Page
 * 
 * Professional UI/UX for managing saved meal plans and templates
 * Features: Advanced filtering, sorting, search, bulk actions, responsive design
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Calendar, 
  Clock, 
  Copy, 
  Eye, 
  Trash2, 
  Plus,
  Download,
  Heart,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreVertical,
  Grid3X3,
  List,
  Star,
  CalendarDays,
  ChefHat,
  Users,
  AlertTriangle
} from 'lucide-react';
import { MealPlanService } from '@/services/mealPlanService';
import type { IMealPlan } from '@/types/meal-planning';
import { exportMealPlanToPDF } from '@/utils/mealPlanExport';
import Link from 'next/link';
import { slugify, cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useMealPlanSync } from '@/hooks/useMealPlanSync';

type ViewMode = 'grid' | 'list';
type SortOption = 'date' | 'name' | 'meals' | 'created';
type FilterOption = 'all' | 'templates' | 'plans' | 'favorites';

export default function SavedMealPlansPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [savedPlans, setSavedPlans] = useState<IMealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedPlans, setSelectedPlans] = useState<Set<string>>(new Set());
  const { syncCounter, triggerSync } = useMealPlanSync();

  useEffect(() => {
    if (session?.user?.id) {
      loadSavedPlans();
    }
  }, [session]);

  // 🔄 SYNC: Reload data when meal plans change on other pages
  useEffect(() => {
    if (session?.user?.id && syncCounter > 0) {
      console.log('🔄 My Saved Meal Plans: Syncing data due to meal plan changes');
      loadSavedPlans();
    }
  }, [syncCounter, session?.user?.id]);

  const loadSavedPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const plans = await MealPlanService.getMealPlans();
      setSavedPlans(plans);
      
    } catch (err) {
      console.error('Failed to load saved plans:', err);
      setError('Failed to load meal plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort meal plans
  const filteredAndSortedPlans = useMemo(() => {
    let filtered = savedPlans;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(plan => 
        plan.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    switch (filterBy) {
      case 'templates':
        filtered = filtered.filter(plan => plan.isTemplate);
        break;
      case 'plans':
        filtered = filtered.filter(plan => !plan.isTemplate);
        break;
      case 'favorites':
        // For now, we'll use a placeholder - can be enhanced later
        filtered = filtered.filter(plan => plan.title?.includes('Favorite'));
        break;
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = (a.title || '').localeCompare(b.title || '');
          break;
        case 'date':
          comparison = new Date(a.weekStartDate).getTime() - new Date(b.weekStartDate).getTime();
          break;
        case 'meals':
          const aMeals = getMealCount(a);
          const bMeals = getMealCount(b);
          comparison = aMeals - bMeals;
          break;
        case 'created':
          comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [savedPlans, searchQuery, filterBy, sortBy, sortOrder]);

  const getMealCount = (plan: IMealPlan): number => {
    return plan.days?.reduce((total, day) => {
      return total + 
        (day.breakfast?.length || 0) + 
        (day.lunch?.length || 0) + 
        (day.dinner?.length || 0) + 
        (day.snacks?.length || 0);
    }, 0) || 0;
  };

  const handleExportPlan = async (plan: IMealPlan) => {
    try {
      await exportMealPlanToPDF(plan, { format: 'pdf' });
    } catch (error) {
      console.error('Export failed:', error);
      setError('Export failed. Please try again.');
    }
  };

  const handleCopyPlan = async (plan: IMealPlan) => {
    try {
      const today = new Date();
      const currentWeekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      
      await MealPlanService.createMealPlan({
        weekStartDate: currentWeekStart.toISOString().split('T')[0],
        title: `Copy of ${plan.title}`,
        copyFromWeek: new Date(plan.weekStartDate).toISOString().split('T')[0]
      });
      
      loadSavedPlans();
    } catch (error) {
      console.error('Copy failed:', error);
      setError('Failed to copy meal plan. Please try again.');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this meal plan?')) {
      return;
    }

    try {
      await MealPlanService.deleteMealPlan(planId);
      loadSavedPlans();
    } catch (error) {
      console.error('Delete failed:', error);
      setError('Failed to delete meal plan. Please try again.');
    }
  };

  // Enhanced Batch Operations using optimized API
  const handleBulkDelete = async () => {
    if (selectedPlans.size === 0) return;

    const confirmed = confirm(
      `Are you sure you want to delete ${selectedPlans.size} meal plan(s)? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      
      const response = await fetch('/api/meal-plans/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'delete',
          planIds: Array.from(selectedPlans)
        })
      });

      const result = await response.json();

      if (result.success) {
        // Remove deleted plans from state
        setSavedPlans(prev => prev.filter(plan => !selectedPlans.has(plan._id || '')));
        setSelectedPlans(new Set());
        toast({
          title: 'Success',
          description: result.message,
        });
      } else {
        throw new Error(result.error || 'Failed to delete meal plans');
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete selected meal plans. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCopy = async () => {
    if (selectedPlans.size === 0) return;

    const startDate = prompt(
      `Enter the start date for copying ${selectedPlans.size} meal plan(s) (YYYY-MM-DD):`,
      new Date().toISOString().split('T')[0]
    );

    if (!startDate) return;

    const weeksToAdvance = selectedPlans.size > 1 ? 
      parseInt(prompt('Weeks between each copied plan (default: 1):', '1') || '1', 10) : 1;

    try {
      setLoading(true);
      
      const response = await fetch('/api/meal-plans/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'copy',
          planIds: Array.from(selectedPlans),
          data: { startDate, weeksToAdvance }
        })
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the plans list
        await loadSavedPlans();
        setSelectedPlans(new Set());
        toast({
          title: 'Success',
          description: result.message,
        });
      } else {
        throw new Error(result.error || 'Failed to copy meal plans');
      }
    } catch (error) {
      console.error('Bulk copy error:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy selected meal plans. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkExport = async () => {
    if (selectedPlans.size === 0) return;

    try {
      setLoading(true);
      
      const response = await fetch('/api/meal-plans/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'export',
          planIds: Array.from(selectedPlans)
        })
      });

      const result = await response.json();

      if (result.success) {
        // Create and download JSON file
        const dataStr = JSON.stringify(result.plans, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `meal-plans-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setSelectedPlans(new Set());
        toast({
          title: 'Success',
          description: result.message,
        });
      } else {
        throw new Error(result.error || 'Failed to export meal plans');
      }
    } catch (error) {
      console.error('Bulk export error:', error);
      toast({
        title: 'Error',
        description: 'Failed to export selected meal plans. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCreateTemplates = async () => {
    const nonTemplates = savedPlans.filter(plan => 
      selectedPlans.has(plan._id || '') && !plan.isTemplate
    );

    if (nonTemplates.length === 0) {
      toast({
        title: 'No Action Needed',
        description: 'All selected plans are already templates.',
      });
      return;
    }

    const confirmed = confirm(
      `Convert ${nonTemplates.length} meal plan(s) to reusable template(s)?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      
      const response = await fetch('/api/meal-plans/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'makeTemplates',
          planIds: nonTemplates.map(plan => plan._id).filter(Boolean)
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setSavedPlans(prev => prev.map(plan => 
          nonTemplates.some(nt => nt._id === plan._id) 
            ? { ...plan, isTemplate: true }
            : plan
        ));
        setSelectedPlans(new Set());
        toast({
          title: 'Success',
          description: result.message,
        });
      } else {
        throw new Error(result.error || 'Failed to create templates');
      }
    } catch (error) {
      console.error('Bulk template creation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create templates. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePlanSelection = (planId: string) => {
    const newSelection = new Set(selectedPlans);
    if (newSelection.has(planId)) {
      newSelection.delete(planId);
    } else {
      newSelection.add(planId);
    }
    setSelectedPlans(newSelection);
  };

  const selectAllPlans = () => {
    const allIds = filteredAndSortedPlans.map(plan => plan._id).filter(Boolean) as string[];
    setSelectedPlans(new Set(allIds));
  };

  const clearSelection = () => {
    setSelectedPlans(new Set());
  };

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please log in to view your saved meal plans.</p>
          <Button asChild>
            <Link href="/login">Log In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
              My Saved Meal Plans
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Organize, manage, and reuse your meal planning templates and past meal plans for effortless meal preparation.
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>{savedPlans.filter(p => !p.isTemplate).length} saved plans</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Heart className="h-4 w-4" />
                <span>{savedPlans.filter(p => p.isTemplate).length} templates</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <ChefHat className="h-4 w-4" />
                <span>{savedPlans.reduce((total, plan) => total + getMealCount(plan), 0)} total meals</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild variant="outline">
              <Link href="/recipe">
                <Search className="h-4 w-4 mr-2" />
                Browse Recipes
              </Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
              <Link href={session?.user?.name ? `/user/${encodeURIComponent(slugify(session.user.name))}/meal-plan/current` : '/user/meal-plan/current'}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Plan
              </Link>
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setError(null)}
              className="ml-auto"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Enhanced Controls */}
        <div className="bg-white rounded-lg border shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search meal plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters and Sort */}
            <div className="flex flex-wrap gap-2">
              {/* Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter: {filterBy.charAt(0).toUpperCase() + filterBy.slice(1)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterBy('all')}>
                    All Plans
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterBy('plans')}>
                    Saved Plans
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterBy('templates')}>
                    Templates
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterBy('favorites')}>
                    Favorites
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {sortOrder === 'asc' ? <SortAsc className="h-4 w-4 mr-2" /> : <SortDesc className="h-4 w-4 mr-2" />}
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortBy('date')}>
                    Date
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('name')}>
                    Name
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('meals')}>
                    Meal Count
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('created')}>
                    Created Date
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                    {sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* View Toggle */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedPlans.size > 0 && (
            <div className="mt-4 pt-4 border-t bg-gray-50 rounded-lg p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedPlans.size} plan(s) selected
                  </span>
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    Clear Selection
                  </Button>
                  <Button variant="outline" size="sm" onClick={selectAllPlans}>
                    Select All ({filteredAndSortedPlans.length})
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleBulkCopy}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Selected
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleBulkExport}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export All
                  </Button>
                  
                  {savedPlans.some(plan => 
                    selectedPlans.has(plan._id || '') && !plan.isTemplate
                  ) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleBulkCreateTemplates}
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Make Templates
                    </Button>
                  )}
                  
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              </div>
              
              {/* Quick Info */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <span>
                    Templates: {savedPlans.filter(plan => 
                      selectedPlans.has(plan._id || '') && plan.isTemplate
                    ).length}
                  </span>
                  <span>
                    Plans: {savedPlans.filter(plan => 
                      selectedPlans.has(plan._id || '') && !plan.isTemplate
                    ).length}
                  </span>
                  <span>
                    Total Meals: {savedPlans
                      .filter(plan => selectedPlans.has(plan._id || ''))
                      .reduce((total, plan) => total + getMealCount(plan), 0)
                    }
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        {loading ? (
          <div className={cn(
            "grid gap-6",
            viewMode === 'grid' 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          )}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="flex gap-2 mt-4">
                      <div className="h-8 bg-gray-200 rounded flex-1"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAndSortedPlans.length > 0 ? (
          <div className="space-y-8">
            {/* Templates Section */}
            {filteredAndSortedPlans.some(plan => plan.isTemplate) && (filterBy === 'all' || filterBy === 'templates') && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <Heart className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Meal Plan Templates</h2>
                    <p className="text-gray-600">Reusable meal plan templates for quick planning</p>
                  </div>
                  <Badge variant="secondary" className="ml-auto">
                    {filteredAndSortedPlans.filter(p => p.isTemplate).length}
                  </Badge>
                </div>
                
                <div className={cn(
                  "grid gap-6",
                  viewMode === 'grid' 
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                    : "grid-cols-1"
                )}>
                  {filteredAndSortedPlans
                    .filter(plan => plan.isTemplate)
                    .map((template) => (
                      <EnhancedMealPlanCard
                        key={template._id}
                        plan={template}
                        viewMode={viewMode}
                        isSelected={selectedPlans.has(template._id || '')}
                        onToggleSelect={() => template._id && togglePlanSelection(template._id)}
                        onExport={() => handleExportPlan(template)}
                        onCopy={() => handleCopyPlan(template)}
                        onDelete={() => template._id && handleDeletePlan(template._id)}
                      />
                    ))}
                </div>
              </section>
            )}

            {/* Saved Plans Section */}
            {filteredAndSortedPlans.some(plan => !plan.isTemplate) && (filterBy === 'all' || filterBy === 'plans') && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <CalendarDays className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Past Meal Plans</h2>
                    <p className="text-gray-600">Your previously created meal plans</p>
                  </div>
                  <Badge variant="secondary" className="ml-auto">
                    {filteredAndSortedPlans.filter(p => !p.isTemplate).length}
                  </Badge>
                </div>
                
                <div className={cn(
                  "grid gap-6",
                  viewMode === 'grid' 
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                    : "grid-cols-1"
                )}>
                  {filteredAndSortedPlans
                    .filter(plan => !plan.isTemplate)
                    .map((plan) => (
                      <EnhancedMealPlanCard
                        key={plan._id}
                        plan={plan}
                        viewMode={viewMode}
                        isSelected={selectedPlans.has(plan._id || '')}
                        onToggleSelect={() => plan._id && togglePlanSelection(plan._id)}
                        onExport={() => handleExportPlan(plan)}
                        onCopy={() => handleCopyPlan(plan)}
                        onDelete={() => plan._id && handleDeletePlan(plan._id)}
                      />
                    ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <EmptyState 
            searchQuery={searchQuery}
            filterBy={filterBy}
            totalPlans={savedPlans.length}
          />
        )}
      </div>
  );
}

// Empty State Component
interface EmptyStateProps {
  searchQuery: string;
  filterBy: FilterOption;
  totalPlans: number;
}

function EmptyState({ searchQuery, filterBy, totalPlans }: EmptyStateProps) {
  const { data: session } = useSession();

  if (totalPlans === 0) {
    return (
      <Card className="text-center py-16">
        <CardContent>
          <div className="max-w-md mx-auto">
            <div className="p-4 bg-green-50 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <ChefHat className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900 mb-3">No Meal Plans Yet</CardTitle>
            <CardDescription className="text-lg mb-6">
              Start your meal planning journey by creating your first meal plan. Organize your meals, save time, and eat better.
            </CardDescription>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <Link href={session?.user?.name ? `/user/${encodeURIComponent(slugify(session.user.name))}/meal-plan/current` : '/user/meal-plan/current'}>
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Plan
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/recipes">
                  <Search className="h-5 w-5 mr-2" />
                  Browse Recipes
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="text-center py-12">
      <CardContent>
        <div className="max-w-md mx-auto">
          <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <CardTitle className="text-xl text-gray-900 mb-2">
            {searchQuery ? 'No Results Found' : `No ${filterBy === 'all' ? 'Plans' : filterBy} Found`}
          </CardTitle>
          <CardDescription className="mb-4">
            {searchQuery 
              ? `No meal plans match "${searchQuery}". Try adjusting your search terms.`
              : `You don't have any ${filterBy === 'all' ? 'plans' : filterBy} yet.`
            }
          </CardDescription>
          <Button asChild>
            <Link href={session?.user?.name ? `/user/${encodeURIComponent(slugify(session.user.name))}/meal-plan/current` : '/user/meal-plan/current'}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Plan
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced Meal Plan Card Component
interface EnhancedMealPlanCardProps {
  plan: IMealPlan;
  viewMode: ViewMode;
  isSelected: boolean;
  onToggleSelect: () => void;
  onExport: () => void;
  onCopy: () => void;
  onDelete: () => void;
}

function EnhancedMealPlanCard({ 
  plan, 
  viewMode, 
  isSelected, 
  onToggleSelect,
  onExport, 
  onCopy, 
  onDelete 
}: EnhancedMealPlanCardProps) {
  const weekStart = new Date(plan.weekStartDate);
  const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
  const { data: session } = useSession();
  
  // Count total meals
  const totalMeals = plan.days?.reduce((total, day) => {
    return total + 
      (day.breakfast?.length || 0) + 
      (day.lunch?.length || 0) + 
      (day.dinner?.length || 0) + 
      (day.snacks?.length || 0);
  }, 0) || 0;

  // Count meal types
  const mealTypes = {
    breakfast: plan.days?.reduce((total, day) => total + (day.breakfast?.length || 0), 0) || 0,
    lunch: plan.days?.reduce((total, day) => total + (day.lunch?.length || 0), 0) || 0,
    dinner: plan.days?.reduce((total, day) => total + (day.dinner?.length || 0), 0) || 0,
    snacks: plan.days?.reduce((total, day) => total + (day.snacks?.length || 0), 0) || 0
  };

  if (viewMode === 'list') {
    return (
      <Card className={cn(
        "hover:shadow-lg transition-all duration-200 cursor-pointer",
        isSelected && "ring-2 ring-green-500 ring-offset-2"
      )}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            {/* Checkbox */}
            <div 
              className="flex-shrink-0 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect();
              }}
            >
              <div className={cn(
                "w-5 h-5 border-2 rounded transition-colors",
                isSelected 
                  ? "bg-green-600 border-green-600" 
                  : "border-gray-300 hover:border-green-400"
              )}>
                {isSelected && (
                  <svg className="w-3 h-3 text-white mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>

            {/* Icon */}
            <div className={cn(
              "p-3 rounded-lg flex-shrink-0",
              plan.isTemplate ? "bg-red-50" : "bg-blue-50"
            )}>
              {plan.isTemplate ? (
                <Heart className="h-6 w-6 text-red-600" />
              ) : (
                <Calendar className="h-6 w-6 text-blue-600" />
              )}
            </div>

            {/* Content */}
            <div className="flex-grow min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{plan.title}</h3>
                  <p className="text-sm text-gray-600">
                    {plan.isTemplate ? (
                      'Reusable template'
                    ) : (
                      `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`
                    )}
                  </p>
                </div>
                {plan.isTemplate && (
                  <Badge variant="outline" className="text-red-600 border-red-600 ml-2">
                    Template
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <ChefHat className="h-4 w-4" />
                  <span>{totalMeals} meals</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>7 days</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>For 2 people</span>
                </div>
              </div>

              {/* Meal breakdown */}
              <div className="flex gap-4 text-xs text-gray-500">
                {mealTypes.breakfast > 0 && <span>🥞 {mealTypes.breakfast}</span>}
                {mealTypes.lunch > 0 && <span>🥙 {mealTypes.lunch}</span>}
                {mealTypes.dinner > 0 && <span>🍽️ {mealTypes.dinner}</span>}
                {mealTypes.snacks > 0 && <span>🍿 {mealTypes.snacks}</span>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy();
                }}
              >
                <Copy className="h-4 w-4 mr-1" />
                {plan.isTemplate ? 'Use' : 'Copy'}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={session?.user?.name ? `/user/${encodeURIComponent(slugify(session.user.name))}/meal-plan/${plan._id}` : `/user/meal-plan/${plan._id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Plan
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDelete} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card className={cn(
      "hover:shadow-lg transition-all duration-200 cursor-pointer group",
      isSelected && "ring-2 ring-green-500 ring-offset-2"
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-grow min-w-0">
            {/* Checkbox */}
            <div 
              className="flex-shrink-0 cursor-pointer mt-1"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect();
              }}
            >
              <div className={cn(
                "w-5 h-5 border-2 rounded transition-colors",
                isSelected 
                  ? "bg-green-600 border-green-600" 
                  : "border-gray-300 hover:border-green-400"
              )}>
                {isSelected && (
                  <svg className="w-3 h-3 text-white mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>

            <div className="min-w-0 flex-grow">
              <CardTitle className="text-lg truncate">{plan.title}</CardTitle>
              <CardDescription className="mt-1">
                {plan.isTemplate ? (
                  'Reusable template'
                ) : (
                  `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`
                )}
              </CardDescription>
            </div>
          </div>
          
          {plan.isTemplate && (
            <Badge variant="outline" className="text-red-600 border-red-600 flex-shrink-0">
              Template
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <ChefHat className="h-4 w-4" />
              <span>{totalMeals} meals</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>7 days</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>2</span>
            </div>
          </div>

          {/* Meal breakdown */}
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
            {mealTypes.breakfast > 0 && (
              <div className="flex items-center gap-1">
                <span>🥞</span>
                <span>Breakfast: {mealTypes.breakfast}</span>
              </div>
            )}
            {mealTypes.lunch > 0 && (
              <div className="flex items-center gap-1">
                <span>🥙</span>
                <span>Lunch: {mealTypes.lunch}</span>
              </div>
            )}
            {mealTypes.dinner > 0 && (
              <div className="flex items-center gap-1">
                <span>🍽️</span>
                <span>Dinner: {mealTypes.dinner}</span>
              </div>
            )}
            {mealTypes.snacks > 0 && (
              <div className="flex items-center gap-1">
                <span>🍿</span>
                <span>Snacks: {mealTypes.snacks}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onCopy();
              }}
              className="flex-1"
            >
              <Copy className="h-4 w-4 mr-1" />
              {plan.isTemplate ? 'Use' : 'Copy'}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onExport();
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
            
            {plan._id && (
              <Link href={session?.user?.name ? `/user/${encodeURIComponent(slugify(session.user.name))}/meal-plan/${plan._id}` : `/user/meal-plan/${plan._id}`}>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
