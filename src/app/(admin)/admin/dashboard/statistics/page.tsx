'use client';

import { useState, useEffect } from 'react';
import AdminStatisticsWidgets from '@/components/admin/AdminStatisticsWidgets';
import { Card } from '@/components/ui/card';

interface AdminStatistics {
  users: {
    total: number;
    new_this_month: number;
    active_users: number;
  };
  recipes: {
    total: number;
    published: number;
    pending_review: number;
  };
  commissions: {
    total_cookware_items: number;
    active_partnerships: number;
    monthly_revenue: number;
  };
  activity: {
    daily_logins: number;
    recipes_created_today: number;
    meal_plans_created: number;
  };
}

export default function StatisticsPage() {
  const [statistics, setStatistics] = useState<AdminStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/admin/statistics');
      const data = await response.json();
      
      if (data.success) {
        setStatistics(data.data);
      } else {
        setError('Failed to load statistics');
      }
    } catch (err) {
      setError('Error loading statistics');
      console.error('Statistics error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Statistics & Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-16 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Statistics & Analytics</h1>
        <Card className="p-6">
          <p className="text-red-500">Error: {error}</p>
        </Card>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Statistics & Analytics</h1>
        <Card className="p-6">
          <p className="text-muted-foreground">No statistics available</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Statistics & Analytics</h1>
      
      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <AdminStatisticsWidgets />
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Statistics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">User Activity</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Users</span>
              <span className="font-medium">{statistics.users.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">New This Month</span>
              <span className="font-medium text-primary-600">{statistics.users.new_this_month}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Users</span>
              <span className="font-medium text-green-600">{statistics.users.active_users}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Daily Logins</span>
              <span className="font-medium">{statistics.activity.daily_logins}</span>
            </div>
          </div>
        </Card>

        {/* Recipe Statistics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recipe Management</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Recipes</span>
              <span className="font-medium">{statistics.recipes.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Published</span>
              <span className="font-medium text-green-600">{statistics.recipes.published}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pending Review</span>
              <span className="font-medium text-amber-600">{statistics.recipes.pending_review}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created Today</span>
              <span className="font-medium">{statistics.activity.recipes_created_today}</span>
            </div>
          </div>
        </Card>

        {/* Commission Statistics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Cookware & Commissions</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cookware Items</span>
              <span className="font-medium">{statistics.commissions.total_cookware_items}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Partnerships</span>
              <span className="font-medium text-primary-600">{statistics.commissions.active_partnerships}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly Revenue</span>
              <span className="font-medium text-green-600">€{statistics.commissions.monthly_revenue.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Activity Statistics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Daily Activity</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Daily Logins</span>
              <span className="font-medium">{statistics.activity.daily_logins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recipes Created</span>
              <span className="font-medium">{statistics.activity.recipes_created_today}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Meal Plans Created</span>
              <span className="font-medium">{statistics.activity.meal_plans_created}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
