'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  ChefHat,
  Settings,
  UserCog,
  Package,
  AlertTriangle
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
  const [communityRecipes, setCommunityRecipes] = useState<number>(0);
  const [communityRecipesLoading, setCommunityRecipesLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [onlineUsersLoading, setOnlineUsersLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivities();
    fetchCommunityRecipes();
    fetchOnlineUsers();

    // Update online users every minute
    const interval = setInterval(fetchOnlineUsers, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchOnlineUsers = async () => {
    try {
      setOnlineUsersLoading(true);
      const response = await fetch('/api/admin/users/online');
      if (response.ok) {
        const data = await response.json();
        setOnlineUsers(data.onlineCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch online users:', error);
    } finally {
      setOnlineUsersLoading(false);
    }
  };

  const fetchCommunityRecipes = async () => {
    try {
      setCommunityRecipesLoading(true);
      const response = await fetch('/api/admin/recipes');
      if (response.ok) {
        const data = await response.json();
        // Count recipes from admin_upload and user_upload sources
        const communityCount = data.recipes ? 
          data.recipes.filter((recipe: any) => 
            recipe.source === 'admin_upload' || recipe.source === 'user_upload'
          ).length : 0;
        setCommunityRecipes(communityCount);
      }
    } catch (error) {
      console.error('Failed to fetch community recipes:', error);
    } finally {
      setCommunityRecipesLoading(false);
    }
  };

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
      href: '/admin/dashboard/manage-recipes',
      icon: ChefHat,
      color: 'text-green-600'
    },
    {
      title: 'Cookware Commissions',
      description: 'Manage cookware commissions',
      href: '/admin/dashboard/manage_cookware_commissions',
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
     
      </div>

      {/* Dashboard Overview Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">System Overview</h2>
        </div>
        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Users</p>
                <p className="text-2xl font-bold">{/* TODO: fetch from API */}11</p>
               
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Online Now</p>
                {onlineUsersLoading ? (
                  <div className="animate-pulse">
                    <div className="h-6 w-8 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-green-600">{onlineUsers}</p>
                    <p className="text-xs text-green-600">Active in last 5min</p>
                  </>
                )}
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className={`h-3 w-3 rounded-full ${onlineUsers > 0 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recipes</p>
                <p className="text-2xl font-bold">159</p>
                <p className="text-xs text-orange-600">0 pending</p>
              </div>
              <ChefHat className="h-8 w-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Community Recipes</p>
                {communityRecipesLoading ? (
                  <div className="animate-pulse">
                    <div className="h-6 w-12 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 w-20 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-purple-600">{communityRecipes.toLocaleString()}</p>
                   
                  </>
                )}
              </div>
              <ChefHat className="h-8 w-8 text-purple-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reports</p>
                <p className="text-2xl font-bold text-red-600">0</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </Card>
        </div>
        {/* System Status */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Uptime</p>
              <p className="text-lg font-semibold">99.9%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Storage Used</p>
              <p className="text-lg font-semibold">2.3 GB</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">System Status</p>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Online
              </Badge>
            </div>
          </div>
        </Card>
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
