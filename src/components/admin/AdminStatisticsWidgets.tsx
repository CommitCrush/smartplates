'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  ChefHat, 
  DollarSign, 
  CheckCircle,
  Calendar,
  TrendingUp,
  Activity,
  AlertTriangle,
  RefreshCw
} from "lucide-react";

interface StatisticsData {
  totalUsers: number;
  activeUsers: number;
  totalRecipes: number;
  publishedRecipes: number;
  totalMealPlans: number;
  activeMealPlans: number;
  revenue: number;
  monthlyGrowth: number;
  systemHealth: 'healthy' | 'warning' | 'error';
  pendingReviews: number;
}

export default function AdminStatisticsWidgets() {
  const [statistics, setStatistics] = useState<StatisticsData>({
    totalUsers: 1247,
    activeUsers: 892,
    totalRecipes: 3456,
    publishedRecipes: 2987,
    totalMealPlans: 1890,
    activeMealPlans: 567,
    revenue: 12450.75,
    monthlyGrowth: 15.7,
    systemHealth: 'healthy',
    pendingReviews: 23
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const mockData: StatisticsData = {
        totalUsers: 1247,
        activeUsers: 892,
        totalRecipes: 3456,
        publishedRecipes: 2987,
        totalMealPlans: 1890,
        activeMealPlans: 567,
        revenue: 12450.75,
        monthlyGrowth: 15.7,
        systemHealth: 'healthy',
        pendingReviews: 23
      };
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setStatistics(mockData);
    } catch (error) {
      console.error('Failed to load statistics:', error);
      setError(error instanceof Error ? error.message : 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Statistics</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={loadStatistics} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total Users
          </CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {statistics.totalUsers.toLocaleString()}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {statistics.activeUsers.toLocaleString()} active this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Recipes
          </CardTitle>
          <ChefHat className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {statistics.totalRecipes.toLocaleString()}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {statistics.publishedRecipes.toLocaleString()} published
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Revenue
          </CardTitle>
          <DollarSign className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(statistics.revenue)}
          </div>
          <p className="text-xs text-green-600 mt-1">
            {formatPercentage(statistics.monthlyGrowth)} from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            System Health
          </CardTitle>
          {getHealthIcon(statistics.systemHealth)}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 capitalize">
            {statistics.systemHealth}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            All services operational
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
