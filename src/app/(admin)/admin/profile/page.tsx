'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/authContext';
import {
  ChefHat,
  Users,
  Calendar,
  Star,
  Shield,
  Activity
} from 'lucide-react';

interface AdminProfileData {
  totalRecipesCreated: number;
  totalUsersManaged: number;
  totalMealPlansCreated: number;
  lastLogin: string;
  accountCreated: string;
  role: string;
}

export default function AdminProfilePage() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<AdminProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      // For now, use mock data - in real implementation, this would fetch from API
      const mockData: AdminProfileData = {
        totalRecipesCreated: 47,
        totalUsersManaged: 1247,
        totalMealPlansCreated: 23,
        lastLogin: new Date().toISOString(),
        accountCreated: '2024-01-15T10:00:00Z',
        role: 'admin'
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setProfileData(mockData);
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-start gap-8">
            <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load profile data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Profile</h1>
          <p className="text-muted-foreground mt-1">
            Your administrative activities and metrics
          </p>
        </div>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Large Profile Picture - Right Side */}
        <div className="lg:order-2 lg:flex-shrink-0">
          <Card className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-32 h-32 mb-4">
                <AvatarImage src={user?.image || ''} alt={user?.name || 'Admin'} />
                <AvatarFallback className="text-2xl">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold">{user?.name || 'Admin User'}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <Badge className="mt-2 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                <Shield className="w-3 h-3 mr-1" />
                Administrator
              </Badge>
            </div>
          </Card>
        </div>

        {/* Metrics Grid - Left Side */}
        <div className="lg:order-1 lg:flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recipes Created */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Recipes Created
                </CardTitle>
                <ChefHat className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {profileData.totalRecipesCreated}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total recipes you&apos;ve created
                </p>
              </CardContent>
            </Card>

            {/* Users Managed */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Users Managed
                </CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {profileData.totalUsersManaged.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total registered users
                </p>
              </CardContent>
            </Card>

            {/* Meal Plans Created */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Meal Plans Created
                </CardTitle>
                <Calendar className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {profileData.totalMealPlansCreated}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total meal plans you&apos;ve created
                </p>
              </CardContent>
            </Card>

            {/* Account Activity */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Account Activity
                </CardTitle>
                <Activity className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-muted-foreground">Last Login:</span>
                    <div className="font-medium">
                      {new Date(profileData.lastLogin).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <span className="text-muted-foreground">Member Since:</span>
                    <div className="font-medium">
                      {new Date(profileData.accountCreated).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Summary */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Recent Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm">Recipes moderated this week</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm">Users registered this month</span>
                  <span className="font-medium">47</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm">System health checks performed</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">API requests monitored</span>
                  <span className="font-medium">1,234</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}