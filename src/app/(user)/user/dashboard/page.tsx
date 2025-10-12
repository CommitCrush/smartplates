/**
 * Main User Dashboard Page
 * 
 * Central hub for user activities including:
 * - Recent activity overview
 * - Quick actions (meal planning, recipe upload)
 * - Statistics and metrics
 * - Navigation to sub-sections
 */

'use client';

import { useAuth } from '@/context/authContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Calendar, 
  ChefHat, 
  BookOpen, 
  Settings, 
  PlusCircle,
  Star,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react';

interface DashboardStats {
  totalRecipes: number;
  savedMealPlans: number;
  totalMeals: number;
  totalLikes: number;
}

interface UpcomingMeal {
  date: string;
  mealType: string;
  recipeName: string;
  image?: string;
}

interface DashboardActivity {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
}

interface DashboardData {
  stats: DashboardStats;
  recentActivity: DashboardActivity[];
  upcomingMeals: UpcomingMeal[];
  currentWeekPlan: {
    id: string;
    title: string;
    weekStart: string;
  } | null;
  quickLinks: {
    mealPlanUrl: string;
    myRecipesUrl: string;
    savedMealPlansUrl: string;
  };
}

export default function UserDashboardPage() {
  const { user, isAuthenticated, status } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      // Load user dashboard data
      loadDashboardData();
    }
  }, [status, isAuthenticated, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🏠 Loading dashboard data...');
      
      const response = await fetch('/api/users/dashboard');
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('🏠 Dashboard data loaded:', result.data);
      
      if (result.success) {
        setDashboardData(result.data);
      } else {
        throw new Error(result.error || 'Failed to load dashboard data');
      }
    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
      
      // Fallback to mock data
      setDashboardData({
        stats: {
          totalRecipes: 12,
          savedMealPlans: 5,
          totalMeals: 15,
          totalLikes: 47
        },
        recentActivity: [
          {
            id: '1',
            type: 'recipe_upload',
            description: 'Uploaded "Mediterranean Pasta Salad"',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            id: '2',
            type: 'meal_plan',
            description: 'Created weekly meal plan',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        ],
        upcomingMeals: [],
        currentWeekPlan: null,
        quickLinks: {
          mealPlanUrl: '/user/meal-plan/current',
          myRecipesUrl: '/user/my-recipe',
          savedMealPlansUrl: '/user/my_saved_meal_plan'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const getQuickActions = () => [
    {
      title: 'Plan Meals',
      description: 'Create your weekly meal plan',
      href: dashboardData?.quickLinks.mealPlanUrl || '/user/meal-plan/current',
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      title: 'Upload Recipe',
      description: 'Share your favorite recipe',
      href: '/user/my-recipe/new',
      icon: PlusCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Browse Recipes',
      description: 'Discover new recipes',
      href: '/recipe',
      icon: BookOpen,
      color: 'bg-purple-500'
    },
    {
      title: 'AI Features',
      description: 'Smart recipe suggestions',
      href: '/user/ai_feature',
      icon: TrendingUp,
      color: 'bg-orange-500'
    }
  ];

  const getStatCards = () => [
    {
      title: 'My Recipes',
      value: dashboardData?.stats.totalRecipes || 0,
      icon: ChefHat,
      color: 'text-blue-600',
      href: dashboardData?.quickLinks.myRecipesUrl || '/user/my-recipe'
    },
    {
      title: 'Meal Plans',
      value: dashboardData?.stats.savedMealPlans || 0,
      icon: Calendar,
      color: 'text-green-600',
      href: dashboardData?.quickLinks.savedMealPlansUrl || '/user/my_saved_meal_plan'
    },
    {
      title: 'Total Likes',
      value: dashboardData?.stats.totalLikes || 0,
      icon: Star,
      color: 'text-yellow-600',
      href: '/user/settings'
    }
  ];

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error && !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Users className="h-16 w-16 mx-auto mb-2" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Failed to Load Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Profile Image */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative">
            <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
              <AvatarImage 
                src={user?.image || '/placeholder-avatar.svg'} 
                alt={`${user?.name || 'User'}'s profile`}
              />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.name || 'Chef'}!
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              {user?.email}
            </p>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Here&apos;s what&apos;s happening in your kitchen today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {getStatCards().map((card, index) => (
          <Link key={index} href={card.href} className="group">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {card.value}
                  </p>
                </div>
                <card.icon className={`h-8 w-8 ${card.color}`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Current Week Meal Plan Overview */}
      {dashboardData?.currentWeekPlan && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              This Week&apos;s Meal Plan
            </h2>
            <Link 
              href={dashboardData.quickLinks.mealPlanUrl}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              View Full Plan →
            </Link>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {dashboardData.currentWeekPlan.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(dashboardData.currentWeekPlan.weekStart).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {getQuickActions().map((action, index) => (
            <Link key={index} href={action.href} className="group">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${action.color} text-white mb-3`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity and Upcoming Meals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentActivity.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(activity.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No recent activity yet. Start by creating your first meal plan!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Meals */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Upcoming Meals
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              {dashboardData?.upcomingMeals && dashboardData.upcomingMeals.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.upcomingMeals.slice(0, 5).map((meal, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Image
                          src={meal.image || '/placeholder-recipe.svg'}
                          alt={meal.recipeName}
                          width={40}
                          height={40}
                          className="rounded-lg object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {meal.recipeName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(meal.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })} • {meal.mealType}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No upcoming meals planned.
                  </p>
                  <Link 
                    href={dashboardData?.quickLinks.mealPlanUrl || '/user/meal-plan/current'}
                    className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Plan Your Meals
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
