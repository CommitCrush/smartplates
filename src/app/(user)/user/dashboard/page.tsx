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
  totalLikes: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
  }>;
}

export default function UserDashboardPage() {
  const { user, isAuthenticated, status } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalRecipes: 0,
    savedMealPlans: 0,
    totalLikes: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

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
      // Mock data for now - replace with actual API calls
      setStats({
        totalRecipes: 12,
        savedMealPlans: 5,
        totalLikes: 47,
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
          },
          {
            id: '3',
            type: 'like',
            description: 'Liked "Healthy Breakfast Bowl"',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          }
        ]
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Plan Meals',
      description: 'Create your weekly meal plan',
      href: '/user/my_meal_plan/current',
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

  const statCards = [
    {
      title: 'My Recipes',
      value: stats.totalRecipes,
      icon: ChefHat,
      color: 'text-blue-600',
      href: '/user/my-recipe'
    },
    {
      title: 'Meal Plans',
      value: stats.savedMealPlans,
      icon: Calendar,
      color: 'text-green-600',
      href: '/user/my_meal_plan/current'
    },
    {
      title: 'Total Likes',
      value: stats.totalLikes,
      icon: Star,
      color: 'text-yellow-600',
      href: '/user/profile/me'
    }
  ];

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Profile Image */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative">
            <Image
              src={user?.image || '/placeholder-avatar.svg'}
              alt={`${user?.name || 'User'}'s profile`}
              width={80}
              height={80}
              className="rounded-full border-4 border-white shadow-lg"
            />
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
        {statCards.map((card, index) => (
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

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              {stats.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No recent activity yet. Start by uploading your first recipe!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Links
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="space-y-3">
                <Link 
                  href="/user/settings"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Settings className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-white">Account Settings</span>
                </Link>
                <Link 
                  href="/user/cookware"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChefHat className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-white">Cookware Recommendations</span>
                </Link>
                <Link 
                  href="/recipe"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <BookOpen className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-white">Browse All Recipes</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
