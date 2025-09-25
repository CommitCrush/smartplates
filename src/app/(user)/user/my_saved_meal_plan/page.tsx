/**
 * Saved Meal Plans Page
 * 
 * Shows user's saved meal plan templates and past meal plans
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Copy, 
  Edit, 
  Eye, 
  Trash2, 
  Plus,
  Download,
  Heart
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { MealPlanService } from '@/services/mealPlanService';
import type { IMealPlan } from '@/types/meal-planning';
import { exportMealPlanToPDF } from '@/utils/mealPlanExport';
import Link from 'next/link';

export default function SavedMealPlanPage() {
  const { data: session } = useSession();
  const [savedPlans, setSavedPlans] = useState<IMealPlan[]>([]);
  const [templates, setTemplates] = useState<IMealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      loadSavedPlans();
    }
  }, [session]);

  const loadSavedPlans = async () => {
    try {
      setLoading(true);
      
      // Load regular meal plans
      const plans = await MealPlanService.getMealPlans();
      setSavedPlans(plans.filter(plan => !plan.isTemplate));
      
      // Load templates
      // Note: We'll implement template fetching when the API supports it
      setTemplates([]);
      
    } catch (err) {
      console.error('Failed to load saved plans:', err);
      setError('Failed to load meal plans');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPlan = async (plan: IMealPlan) => {
    try {
      await exportMealPlanToPDF(plan, { format: 'pdf' });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleCopyPlan = async (plan: IMealPlan) => {
    try {
      // Create a new meal plan for current week based on this template
      const today = new Date();
      const currentWeekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      
      await MealPlanService.createMealPlan({
        weekStartDate: currentWeekStart.toISOString().split('T')[0],
        title: `Copy of ${plan.title}`,
        copyFromWeek: new Date(plan.weekStartDate).toISOString().split('T')[0]
      });
      
      // Refresh the list
      loadSavedPlans();
    } catch (error) {
      console.error('Copy failed:', error);
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
    }
  };

  if (!session) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
            <p className="text-gray-600">Please log in to view your saved meal plans.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Saved Meal Plans</h1>
            <p className="text-gray-600">
              Manage your meal plans and templates for easy meal planning
            </p>
          </div>
          
          <Button asChild>
            <Link href="/user/my_meal_plan">
              <Plus className="h-4 w-4 mr-2" />
              Create New Plan
            </Link>
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Templates Section */}
            {templates.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="h-5 w-5 text-red-500" />
                  <h2 className="text-xl font-semibold text-gray-900">Meal Plan Templates</h2>
                  <Badge variant="secondary">{templates.length}</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((template) => (
                    <MealPlanCard
                      key={template._id}
                      plan={template}
                      isTemplate={true}
                      onExport={() => handleExportPlan(template)}
                      onCopy={() => handleCopyPlan(template)}
                      onDelete={() => template._id && handleDeletePlan(template._id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Saved Plans Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-900">Past Meal Plans</h2>
                <Badge variant="secondary">{savedPlans.length}</Badge>
              </div>
              
              {savedPlans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedPlans.map((plan) => (
                    <MealPlanCard
                      key={plan._id}
                      plan={plan}
                      isTemplate={false}
                      onExport={() => handleExportPlan(plan)}
                      onCopy={() => handleCopyPlan(plan)}
                      onDelete={() => plan._id && handleDeletePlan(plan._id)}
                    />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <CardTitle className="text-gray-900 mb-2">No Saved Plans Yet</CardTitle>
                    <CardDescription className="mb-4">
                      Start creating meal plans to see them here
                    </CardDescription>
                    <Button asChild>
                      <Link href="/user/my_meal_plan">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Plan
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </section>
          </div>
        )}
      </div>
    </Layout>
  );
}

// Meal Plan Card Component
interface MealPlanCardProps {
  plan: IMealPlan;
  isTemplate: boolean;
  onExport: () => void;
  onCopy: () => void;
  onDelete: () => void;
}

function MealPlanCard({ plan, isTemplate, onExport, onCopy, onDelete }: MealPlanCardProps) {
  const weekStart = new Date(plan.weekStartDate);
  const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
  
  // Count total meals
  const totalMeals = plan.days?.reduce((total, day) => {
    return total + 
      (day.breakfast?.length || 0) + 
      (day.lunch?.length || 0) + 
      (day.dinner?.length || 0) + 
      (day.snacks?.length || 0);
  }, 0) || 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{plan.title}</CardTitle>
            <CardDescription>
              {isTemplate ? (
                'Reusable template'
              ) : (
                `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`
              )}
            </CardDescription>
          </div>
          {isTemplate && (
            <Badge variant="outline" className="text-red-600 border-red-600">
              Template
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{totalMeals} meals planned</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>7 days</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onCopy}
            className="flex-1"
          >
            <Copy className="h-4 w-4 mr-1" />
            {isTemplate ? 'Use' : 'Copy'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onExport}
          >
            <Download className="h-4 w-4" />
          </Button>
          
          {plan._id && (
            <Link href={`/user/my_meal_plan/${plan._id}`}>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
