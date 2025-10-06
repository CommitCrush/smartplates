'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminStatisticsWidgets from '@/components/admin/AdminStatisticsWidgets';
import { Button } from '@/components/ui/button';
import {
  Users,
  ChefHat,
  Settings,
  BarChart3,
  UserCog,
  Package
} from 'lucide-react';
import Link from 'next/link';

interface ActivityEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

export default function AdminPage() {
  const [recentActivities, setRecentActivities] = useState<ActivityEvent[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch('/api/admin/recent-activity');
      if (response.ok) {
        const data = await response.json();
        setRecentActivities(data);
      }
    } catch (error) {
      console.error('Failed to fetch recent activities:', error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'Manage and moderate user accounts',
      href: '/admin/manage-users',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Manage Recipes',
      description: 'Review and moderate recipes',
      href: '/admin/manage-recipes',
      icon: ChefHat,
      color: 'text-green-600'
    },
    {
      title: 'Analytics',
      description: 'Detailed system analytics',
      href: '/admin/statistics',
      icon: BarChart3,
      color: 'text-purple-600'
    },
    {
      title: 'Cookware Commissions',
      description: 'Manage cookware commissions',
      href: '/admin/commission-management',
      icon: Package,
      color: 'text-orange-600'
    },
    {
      title: 'System Settings',
      description: 'Manage admin configuration',
      href: '/admin/settings',
      icon: Settings,
      color: 'text-gray-600'
    },
    {
      title: 'Enhanced API Management',
      description: 'Monitor and optimize Spoonacular API',
      href: '/admin/api-management',
      icon: UserCog,
      color: 'text-indigo-600'
    }
  ];

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            SmartPlates system management and overview
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button variant="outline" asChild>
            <Link href="/admin/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">System Overview</h2>
        </div>
        <AdminStatisticsWidgets />
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <UserCog className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Quick Actions</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card key={action.href} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gray-100 ${action.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="mb-4">
                    {action.description}
                  </CardDescription>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={action.href}>
                      Open
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Recent Activity</h2>

        <Card>
          <CardHeader>
            <CardTitle>System Events</CardTitle>
            <CardDescription>
              Latest system events and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <div className="h-4 bg-gray-300 rounded w-32"></div>
                    </div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.slice(0, 6).map((activity, index) => (
                  <div key={activity.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'user_registration' ? 'bg-green-500' :
                        activity.type === 'system_backup' ? 'bg-blue-500' :
                        activity.type === 'recipe_created' ? 'bg-purple-500' :
                        activity.type === 'user_login' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`}></div>
                      <span className="text-sm">{activity.message}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No recent activities</p>
              </div>
            )}

            <div className="mt-6">
              <Button variant="outline" size="sm" className="w-full">
                View All Events
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
