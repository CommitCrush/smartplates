'use client';'use client';'use client';'use client';



import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Users, ChefHat, DollarSign, CheckCircle } from "lucide-react";

import React, { useState, useEffect } from "react";

export default function AdminStatisticsWidgets() {

  return (import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

      <Card>import { import React, { useState, useEffect } from "react";import React, { useState, useEffect } from "react";

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <CardTitle className="text-sm font-medium text-gray-600">  Users, 

            Total Users

          </CardTitle>  ChefHat, import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";import { Card        'use client';

          <Users className="h-4 w-4 text-blue-600" />

        </CardHeader>  Calendar, 

        <CardContent>

          <div className="text-2xl font-bold text-gray-900">1,247</div>  TrendingUp, import { 

          <p className="text-xs text-gray-500 mt-1">892 active this month</p>

        </CardContent>  DollarSign,

      </Card>

  Activity,  Users, import React, { useState, useEffect } from "react";

      <Card>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">  AlertTriangle,

          <CardTitle className="text-sm font-medium text-gray-600">

            Recipes  CheckCircle  ChefHat, import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

          </CardTitle>

          <ChefHat className="h-4 w-4 text-green-600" />} from "lucide-react";

        </CardHeader>

        <CardContent>  Calendar, import { 

          <div className="text-2xl font-bold text-gray-900">3,456</div>

          <p className="text-xs text-gray-500 mt-1">2,987 published</p>interface StatisticsData {

        </CardContent>

      </Card>  totalUsers: number;  TrendingUp,   Users, 



      <Card>  activeUsers: number;

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <CardTitle className="text-sm font-medium text-gray-600">  totalRecipes: number;  DollarSign,  ChefHat, 

            Revenue

          </CardTitle>  publishedRecipes: number;

          <DollarSign className="h-4 w-4 text-yellow-600" />

        </CardHeader>  totalMealPlans: number;  Activity,  Calendar, 

        <CardContent>

          <div className="text-2xl font-bold text-gray-900">€12,451</div>  activeMealPlans: number;

          <p className="text-xs text-green-600 mt-1">+15.7% from last month</p>

        </CardContent>  revenue: number;  AlertTriangle,  TrendingUp, 

      </Card>

  monthlyGrowth: number;

      <Card>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">  systemHealth: 'healthy' | 'warning' | 'error';  CheckCircle  DollarSign,

          <CardTitle className="text-sm font-medium text-gray-600">

            System Health  pendingReviews: number;

          </CardTitle>

          <CheckCircle className="h-4 w-4 text-green-600" />}} from "lucide-react";  Activity,

        </CardHeader>

        <CardContent>

          <div className="text-2xl font-bold text-gray-900">Healthy</div>

          <p className="text-xs text-gray-500 mt-1">All services operational</p>export default function AdminStatisticsWidgets() {  AlertTriangle,

        </CardContent>

      </Card>  const [statistics, setStatistics] = useState<StatisticsData>({

    </div>

  );    totalUsers: 1247,interface StatisticsData {  CheckCircle

}
    activeUsers: 892,

    totalRecipes: 3456,  totalUsers: number;} from "lucide-react";

    publishedRecipes: 2987,

    totalMealPlans: 1890,  activeUsers: number;

    activeMealPlans: 567,

    revenue: 12450.75,  totalRecipes: number;interface StatisticsData {

    monthlyGrowth: 15.7,

    systemHealth: 'healthy',  publishedRecipes: number;  totalUsers: number;

    pendingReviews: 23

  });  totalMealPlans: number;  activeUsers: number;

  const [loading, setLoading] = useState(false);

  activeMealPlans: number;  totalRecipes: number;

  const formatCurrency = (amount: number) => {

    return new Intl.NumberFormat('en-US', {  revenue: number;  publishedRecipes: number;

      style: 'currency',

      currency: 'EUR'  monthlyGrowth: number;  totalMealPlans: number;

    }).format(amount);

  };  systemHealth: 'healthy' | 'warning' | 'error';  activeMealPlans: number;



  const formatPercentage = (value: number) => {  pendingReviews: number;  revenue: number;

    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

  };}  monthlyGrowth: number;



  return (  systemHealth: 'healthy' | 'warning' | 'error';

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

      {/* Total Users */}export default function AdminStatisticsWidgets() {  pendingReviews: number;

      <Card>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">  const [statistics, setStatistics] = useState<StatisticsData>({}

          <CardTitle className="text-sm font-medium text-gray-600">

            Total Users    totalUsers: 0,

          </CardTitle>

          <Users className="h-4 w-4 text-blue-600" />    activeUsers: 0,export default function AdminStatisticsWidgets() {

        </CardHeader>

        <CardContent>    totalRecipes: 0,  const [statistics, setStatistics] = useState<StatisticsData>({

          <div className="text-2xl font-bold text-gray-900">

            {statistics.totalUsers.toLocaleString()}    publishedRecipes: 0,    totalUsers: 0,

          </div>

          <p className="text-xs text-gray-500 mt-1">    totalMealPlans: 0,    activeUsers: 0,

            {statistics.activeUsers.toLocaleString()} active this month

          </p>    activeMealPlans: 0,    totalRecipes: 0,

        </CardContent>

      </Card>    revenue: 0,    publishedRecipes: 0,



      {/* Total Recipes */}    monthlyGrowth: 0,    totalMealPlans: 0,

      <Card>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">    systemHealth: 'healthy',    activeMealPlans: 0,

          <CardTitle className="text-sm font-medium text-gray-600">

            Recipes    pendingReviews: 0    revenue: 0,

          </CardTitle>

          <ChefHat className="h-4 w-4 text-green-600" />  });    monthlyGrowth: 0,

        </CardHeader>

        <CardContent>  const [loading, setLoading] = useState(true);    systemHealth: 'healthy',

          <div className="text-2xl font-bold text-gray-900">

            {statistics.totalRecipes.toLocaleString()}  const [error, setError] = useState<string | null>(null);    pendingReviews: 0

          </div>

          <p className="text-xs text-gray-500 mt-1">  });

            {statistics.publishedRecipes.toLocaleString()} published

          </p>  useEffect(() => {  const [loading, setLoading] = useState(true);

        </CardContent>

      </Card>    loadStatistics();  const [error, setError] = useState<string | null>(null);



      {/* Revenue */}  }, []);

      <Card>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">  useEffect(() => {

          <CardTitle className="text-sm font-medium text-gray-600">

            Revenue  const loadStatistics = async () => {    loadStatistics();

          </CardTitle>

          <DollarSign className="h-4 w-4 text-yellow-600" />    try {  }, []);

        </CardHeader>

        <CardContent>      setLoading(true);

          <div className="text-2xl font-bold text-gray-900">

            {formatCurrency(statistics.revenue)}        const loadStatistics = async () => {

          </div>

          <p className="text-xs text-green-600 mt-1">      // Mock data for now - replace with actual API call    try {

            {formatPercentage(statistics.monthlyGrowth)} from last month

          </p>      const mockData: StatisticsData = {      setLoading(true);

        </CardContent>

      </Card>        totalUsers: 1247,      



      {/* System Health */}        activeUsers: 892,      // Mock data for now - replace with actual API call

      <Card>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">        totalRecipes: 3456,      const mockData: StatisticsData = {

          <CardTitle className="text-sm font-medium text-gray-600">

            System Health        publishedRecipes: 2987,        totalUsers: 1247,

          </CardTitle>

          <CheckCircle className="h-4 w-4 text-green-600" />        totalMealPlans: 1890,        activeUsers: 892,

        </CardHeader>

        <CardContent>        activeMealPlans: 567,        totalRecipes: 3456,

          <div className="text-2xl font-bold text-gray-900 capitalize">

            Healthy        revenue: 12450.75,        publishedRecipes: 2987,

          </div>

          <p className="text-xs text-gray-500 mt-1">        monthlyGrowth: 15.7,        totalMealPlans: 1890,

            All services operational

          </p>        systemHealth: 'healthy',        activeMealPlans: 567,

        </CardContent>

      </Card>        pendingReviews: 23        revenue: 12450.75,

    </div>

  );      };        monthlyGrowth: 15.7,

}
        systemHealth: 'healthy',

      // Simulate API delay        pendingReviews: 23

      await new Promise(resolve => setTimeout(resolve, 500));      };

      

      setStatistics(mockData);      // Simulate API delay

      setError(null);      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {      

      console.error('Failed to load statistics:', error);      setStatistics(mockData);

      setError(error instanceof Error ? error.message : 'Failed to load statistics');      setError(null);

    } finally {    } catch (error) {

      setLoading(false);      console.error('Failed to load statistics:', error);

    }      setError(error instanceof Error ? error.message : 'Failed to load statistics');

  };    } finally {

      setLoading(false);

  const formatCurrency = (amount: number) => {    }

    return new Intl.NumberFormat('en-US', {  };

      style: 'currency',

      currency: 'EUR'  const formatCurrency = (amount: number) => {

    }).format(amount);    return new Intl.NumberFormat('en-US', {

  };      style: 'currency',

      currency: 'EUR'

  const formatPercentage = (value: number) => {    }).format(amount);

    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;  };

  };

  const formatPercentage = (value: number) => {

  const getHealthIcon = (health: string) => {    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

    switch (health) {  };

      case 'healthy':

        return <CheckCircle className="h-4 w-4 text-green-600" />;  const getHealthIcon = (health: string) => {

      case 'warning':    switch (health) {

        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;      case 'healthy':

      case 'error':        return <CheckCircle className="h-4 w-4 text-green-600" />;

        return <AlertTriangle className="h-4 w-4 text-red-600" />;      case 'warning':

      default:        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;

        return <Activity className="h-4 w-4 text-gray-600" />;      case 'error':

    }        return <AlertTriangle className="h-4 w-4 text-red-600" />;

  };      default:

        return <Activity className="h-4 w-4 text-gray-600" />;

  if (loading) {    }

    return (  };

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {[...Array(8)].map((_, i) => (  if (loading) {

          <Card key={i} className="animate-pulse">    return (

            <CardHeader className="pb-2">      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              <div className="h-4 bg-gray-200 rounded w-3/4"></div>        {[...Array(8)].map((_, i) => (

            </CardHeader>          <Card key={i} className="animate-pulse">

            <CardContent>            <CardHeader className="pb-2">

              <div className="h-8 bg-gray-200 rounded w-1/2"></div>              <div className="h-4 bg-gray-200 rounded w-3/4"></div>

            </CardContent>            </CardHeader>

          </Card>            <CardContent>

        ))}              <div className="h-8 bg-gray-200 rounded w-1/2"></div>

      </div>            </CardContent>

    );          </Card>

  }        ))}

      </div>

  if (error) {    );

    return (  }

      <div className="text-center p-6">

        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />  if (error) {

        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Statistics</h3>    return (

        <p className="text-gray-500 mb-4">{error}</p>      <div className="text-center p-6">

        <button        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />

          onClick={loadStatistics}        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Statistics</h3>

          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"        <p className="text-gray-500 mb-4">{error}</p>

        >        <button

          Retry          onClick={loadStatistics}

        </button>          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"

      </div>        >

    );          Retry

  }        </button>

      </div>

  return (    );

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">  }

      {/* Total Users */}

      <Card>  return (

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <CardTitle className="text-sm font-medium text-gray-600">      {/* Total Users */}

            Total Users      <Card>

          </CardTitle>        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <Users className="h-4 w-4 text-blue-600" />          <CardTitle className="text-sm font-medium text-gray-600">

        </CardHeader>            Total Users

        <CardContent>          </CardTitle>

          <div className="text-2xl font-bold text-gray-900">          <Users className="h-4 w-4 text-blue-600" />

            {statistics.totalUsers.toLocaleString()}        </CardHeader>

          </div>        <CardContent>

          <p className="text-xs text-gray-500 mt-1">          <div className="text-2xl font-bold text-gray-900">

            {statistics.activeUsers.toLocaleString()} active this month            {statistics.totalUsers.toLocaleString()}

          </p>          </div>

        </CardContent>          <p className="text-xs text-gray-500 mt-1">

      </Card>            {statistics.activeUsers.toLocaleString()} active this month

          </p>

      {/* Total Recipes */}        </CardContent>

      <Card>      </Card>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <CardTitle className="text-sm font-medium text-gray-600">      {/* Total Recipes */}

            Recipes      <Card>

          </CardTitle>        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <ChefHat className="h-4 w-4 text-green-600" />          <CardTitle className="text-sm font-medium text-gray-600">

        </CardHeader>            Recipes

        <CardContent>          </CardTitle>

          <div className="text-2xl font-bold text-gray-900">          <ChefHat className="h-4 w-4 text-green-600" />

            {statistics.totalRecipes.toLocaleString()}        </CardHeader>

          </div>        <CardContent>

          <p className="text-xs text-gray-500 mt-1">          <div className="text-2xl font-bold text-gray-900">

            {statistics.publishedRecipes.toLocaleString()} published            {statistics.totalRecipes.toLocaleString()}

          </p>          </div>

        </CardContent>          <p className="text-xs text-gray-500 mt-1">

      </Card>            {statistics.publishedRecipes.toLocaleString()} published

          </p>

      {/* Meal Plans */}        </CardContent>

      <Card>      </Card>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <CardTitle className="text-sm font-medium text-gray-600">      {/* Meal Plans */}

            Meal Plans      <Card>

          </CardTitle>        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <Calendar className="h-4 w-4 text-purple-600" />          <CardTitle className="text-sm font-medium text-gray-600">

        </CardHeader>            Meal Plans

        <CardContent>          </CardTitle>

          <div className="text-2xl font-bold text-gray-900">          <Calendar className="h-4 w-4 text-purple-600" />

            {statistics.totalMealPlans.toLocaleString()}        </CardHeader>

          </div>        <CardContent>

          <p className="text-xs text-gray-500 mt-1">          <div className="text-2xl font-bold text-gray-900">

            {statistics.activeMealPlans.toLocaleString()} active this week            {statistics.totalMealPlans.toLocaleString()}

          </p>          </div>

        </CardContent>          <p className="text-xs text-gray-500 mt-1">

      </Card>            {statistics.activeMealPlans.toLocaleString()} active this week

          </p>

      {/* Revenue */}        </CardContent>

      <Card>      </Card>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <CardTitle className="text-sm font-medium text-gray-600">      {/* Revenue */}

            Revenue      <Card>

          </CardTitle>        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <DollarSign className="h-4 w-4 text-yellow-600" />          <CardTitle className="text-sm font-medium text-gray-600">

        </CardHeader>            Revenue

        <CardContent>          </CardTitle>

          <div className="text-2xl font-bold text-gray-900">          <DollarSign className="h-4 w-4 text-yellow-600" />

            {formatCurrency(statistics.revenue)}        </CardHeader>

          </div>        <CardContent>

          <p className="text-xs text-green-600 mt-1">          <div className="text-2xl font-bold text-gray-900">

            {formatPercentage(statistics.monthlyGrowth)} from last month            {formatCurrency(statistics.revenue)}

          </p>          </div>

        </CardContent>          <p className="text-xs text-green-600 mt-1">

      </Card>            {formatPercentage(statistics.monthlyGrowth)} from last month

          </p>

      {/* System Health */}        </CardContent>

      <Card>      </Card>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <CardTitle className="text-sm font-medium text-gray-600">      {/* System Health */}

            System Health      <Card>

          </CardTitle>        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          {getHealthIcon(statistics.systemHealth)}          <CardTitle className="text-sm font-medium text-gray-600">

        </CardHeader>            System Health

        <CardContent>          </CardTitle>

          <div className="text-2xl font-bold text-gray-900 capitalize">          {getHealthIcon(statistics.systemHealth)}

            {statistics.systemHealth}        </CardHeader>

          </div>        <CardContent>

          <p className="text-xs text-gray-500 mt-1">          <div className="text-2xl font-bold text-gray-900 capitalize">

            All services operational            {statistics.systemHealth}

          </p>          </div>

        </CardContent>          <p className="text-xs text-gray-500 mt-1">

      </Card>            All services operational

          </p>

      {/* Pending Reviews */}        </CardContent>

      <Card>      </Card>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <CardTitle className="text-sm font-medium text-gray-600">      {/* Pending Reviews */}

            Pending Reviews      <Card>

          </CardTitle>        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <AlertTriangle className="h-4 w-4 text-orange-600" />          <CardTitle className="text-sm font-medium text-gray-600">

        </CardHeader>            Pending Reviews

        <CardContent>          </CardTitle>

          <div className="text-2xl font-bold text-gray-900">          <AlertTriangle className="h-4 w-4 text-orange-600" />

            {statistics.pendingReviews}        </CardHeader>

          </div>        <CardContent>

          <p className="text-xs text-gray-500 mt-1">          <div className="text-2xl font-bold text-gray-900">

            Recipes awaiting approval            {statistics.pendingReviews}

          </p>          </div>

        </CardContent>          <p className="text-xs text-gray-500 mt-1">

      </Card>            Recipes awaiting approval

          </p>

      {/* Growth Rate */}        </CardContent>

      <Card>      </Card>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <CardTitle className="text-sm font-medium text-gray-600">      {/* Growth Rate */}

            Growth Rate      <Card>

          </CardTitle>        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <TrendingUp className="h-4 w-4 text-indigo-600" />          <CardTitle className="text-sm font-medium text-gray-600">

        </CardHeader>            Growth Rate

        <CardContent>          </CardTitle>

          <div className="text-2xl font-bold text-gray-900">          <TrendingUp className="h-4 w-4 text-indigo-600" />

            {formatPercentage(statistics.monthlyGrowth)}        </CardHeader>

          </div>        <CardContent>

          <p className="text-xs text-gray-500 mt-1">          <div className="text-2xl font-bold text-gray-900">

            Monthly user growth            {formatPercentage(statistics.monthlyGrowth)}

          </p>          </div>

        </CardContent>          <p className="text-xs text-gray-500 mt-1">

      </Card>            Monthly user growth

          </p>

      {/* User Engagement */}        </CardContent>

      <Card>      </Card>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <CardTitle className="text-sm font-medium text-gray-600">      {/* User Engagement */}

            User Engagement      <Card>

          </CardTitle>        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

          <Activity className="h-4 w-4 text-teal-600" />          <CardTitle className="text-sm font-medium text-gray-600">

        </CardHeader>            User Engagement

        <CardContent>          </CardTitle>

          <div className="text-2xl font-bold text-gray-900">          <Activity className="h-4 w-4 text-teal-600" />

            {((statistics.activeUsers / statistics.totalUsers) * 100).toFixed(1)}%        </CardHeader>

          </div>        <CardContent>

          <p className="text-xs text-gray-500 mt-1">          <div className="text-2xl font-bold text-gray-900">

            Active user ratio            {((statistics.activeUsers / statistics.totalUsers) * 100).toFixed(1)}%

          </p>          </div>

        </CardContent>          <p className="text-xs text-gray-500 mt-1">

      </Card>            Active user ratio

    </div>          </p>

  );        </CardContent>

}      </Card>
    </div>
  );
}tent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  ChefHat, 
  Calendar, 
  TrendingUp, 
  Activity, 
  Database,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface AdminStatistics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  totalRecipes: number;
  publicRecipes: number;
  totalMealPlans: number;
  activeMealPlans: number;
  systemHealth: {
    database: 'healthy' | 'warning' | 'error';
    api: 'healthy' | 'warning' | 'error';
    storage: 'healthy' | 'warning' | 'error';
  };
  performance: {
    avgResponseTime: number;
    errorRate: number;
    uptime: number;
  };
}

export function UserCountWidget({ count }: { count: number }) {
  return (
    <Card className="p-6 flex flex-col items-center justify-center">
      <span className="text-5xl font-bold text-primary">{count}</span>
      <span className="mt-2 text-lg text-muted-foreground">Registered Users</span>
    </Card>
  );
}

export function RecipeCountWidget({ count }: { count: number }) {
  return (
    <Card className="p-6 flex flex-col items-center justify-center">
      <span className="text-5xl font-bold text-primary">{count}</span>
      <span className="mt-2 text-lg text-muted-foreground">Recipes</span>
    </Card>
  );
}

export function CommissionCountWidget({ count }: { count: number }) {
  return (
    <Card className="p-6 flex flex-col items-center justify-center">
      <span className="text-5xl font-bold text-primary">{count}</span>
      <span className="mt-2 text-lg text-muted-foreground">Commissions</span>
    </Card>
  );
}

export default function AdminStatisticsWidgets() {
  const [statistics, setStatistics] = useState<AdminStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📊 Fetching admin statistics...');
      const response = await fetch('/api/admin/statistics');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Statistics API error:', response.status, errorData);
        
        if (response.status === 401) {
          throw new Error('Sie sind nicht angemeldet. Bitte loggen Sie sich ein.');
        } else if (response.status === 403) {
          throw new Error('Sie haben keine Admin-Berechtigung.');
        } else {
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }
      }
      
      const data = await response.json();
      console.log('✅ Statistics fetched successfully:', data);
      setStatistics(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching admin statistics:', error);
      setError(error instanceof Error ? error.message : 'Error loading statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchStatistics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getHealthBadgeVariant = (status: string) => {
    switch (status) {
      case 'healthy': return 'default';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  const getHealthBadgeText = (status: string) => {
    switch (status) {
      case 'healthy': return 'Healthy';
      case 'warning': return 'Warning';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  if (isLoading && !statistics) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchStatistics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Erneut versuchen
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!statistics) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">System-Statistiken</h2>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Letzte Aktualisierung: {lastUpdated.toLocaleTimeString('de-DE')}
            </p>
          )}
        </div>
        <Button 
          onClick={fetchStatistics} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Aktualisieren
        </Button>
      </div>

      {/* Main Statistics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Benutzer Gesamt</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalUsers.toLocaleString('de-DE')}</div>
            <p className="text-xs text-muted-foreground">
              +{statistics.newUsersThisMonth} diesen Monat
            </p>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Benutzer</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.activeUsers.toLocaleString('de-DE')}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((statistics.activeUsers / statistics.totalUsers) * 100)}% der Gesamtbenutzer
            </p>
          </CardContent>
        </Card>

        {/* Total Recipes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rezepte Gesamt</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalRecipes.toLocaleString('de-DE')}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.publicRecipes} öffentlich verfügbar
            </p>
          </CardContent>
        </Card>

        {/* Meal Plans */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Essenspl&auml;ne</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalMealPlans.toLocaleString('de-DE')}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.activeMealPlans} aktiv
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System-Gesundheit</CardTitle>
          <CardDescription>Status der wichtigsten Systemkomponenten</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Datenbank</span>
              </div>
              <Badge variant={getHealthBadgeVariant(statistics.systemHealth.database)}>
                {getHealthBadgeText(statistics.systemHealth.database)}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">API</span>
              </div>
              <Badge variant={getHealthBadgeVariant(statistics.systemHealth.api)}>
                {getHealthBadgeText(statistics.systemHealth.api)}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Speicher</span>
              </div>
              <Badge variant={getHealthBadgeVariant(statistics.systemHealth.storage)}>
                {getHealthBadgeText(statistics.systemHealth.storage)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance-Metriken</CardTitle>
          <CardDescription>Aktuelle System-Performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {statistics.performance.avgResponseTime}ms
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Durchschnittliche Antwortzeit
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {statistics.performance.uptime}%
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Systemverfügbarkeit
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {statistics.performance.errorRate}%
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Fehlerrate
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
