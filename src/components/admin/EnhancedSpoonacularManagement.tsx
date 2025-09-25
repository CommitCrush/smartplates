/**
 * Enhanced Spoonacular Management Component
 * 
 * Admin interface for managing enhanced Spoonacular API features
 * including performance monitoring, cache optimization, and analytics.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Database, 
  Activity, 
  Zap, 
  TrendingUp, 
  Clock, 
  RefreshCw, 
  Trash2, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ========================================
// Types
// ========================================

interface CacheAnalytics {
  totalCachedRecipes: number;
  cacheHitRate: number;
  avgResponseTime: number;
  quotaUsage: {
    today: number;
    remaining: number;
    percentage: number;
  };
  oldestCacheEntry: string | null;
  newestCacheEntry: string | null;
  topSearchTerms: Array<{ term: string; count: number }>;
}

interface HealthStatus {
  status: 'healthy' | 'warning' | 'error';
  checks: {
    database: boolean;
    cache: boolean;
    quota: boolean;
    performance: boolean;
  };
  details: {
    dbConnection: boolean;
    cacheSize: number;
    quotaRemaining: number;
    avgResponseTime: number;
  };
}

interface EnhancedSpoonacularData {
  overview: {
    status: string;
    totalRecipes: number;
    cacheHitRate: number;
    quotaUsage: { today: number; remaining: number; percentage: number };
    avgResponseTime: number;
  };
  analytics: CacheAnalytics;
  health: HealthStatus;
  performance: any;
}

// ========================================
// Main Component
// ========================================

export function EnhancedSpoonacularManagement() {
  const [data, setData] = useState<EnhancedSpoonacularData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOperationRunning, setIsOperationRunning] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // ========================================
  // Data Fetching
  // ========================================

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/spoonacular-enhanced');
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const result = await response.json();
      if (result.success) {
        setData(result.data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch enhanced data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // ========================================
  // Operations
  // ========================================

  const runOperation = async (action: string, name: string) => {
    try {
      setIsOperationRunning(true);
      
      const response = await fetch('/api/admin/spoonacular-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      if (!response.ok) throw new Error(`${name} operation failed`);
      
      const result = await response.json();
      if (result.success) {
        console.log(`✅ ${name} completed:`, result.message);
        // Refresh data after operation
        await fetchData();
      }
    } catch (error) {
      console.error(`❌ ${name} failed:`, error);
    } finally {
      setIsOperationRunning(false);
    }
  };

  const handleWarmupCache = () => runOperation('warmup', 'Cache Warmup');
  const handleOptimizeCache = () => runOperation('optimize', 'Cache Optimization');
  const handleClearMetrics = () => runOperation('clear-metrics', 'Clear Metrics');

  // ========================================
  // Helper Functions
  // ========================================

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Failed to load enhanced Spoonacular data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Spoonacular Management</h2>
          <p className="text-muted-foreground">
            Advanced API monitoring, caching, and optimization
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status
            <Badge 
              variant={data.health.status === 'healthy' ? 'default' : data.health.status === 'warning' ? 'secondary' : 'destructive'}
              className={cn("ml-auto", getStatusColor(data.health.status))}
            >
              {getStatusIcon(data.health.status)}
              <span className="ml-1 capitalize">{data.health.status}</span>
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Database</div>
              <div className={cn("flex items-center gap-1", data.health.checks.database ? 'text-green-600' : 'text-red-600')}>
                {data.health.checks.database ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <span className="text-sm font-medium">
                  {data.health.checks.database ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Cache</div>
              <div className={cn("flex items-center gap-1", data.health.checks.cache ? 'text-green-600' : 'text-red-600')}>
                {data.health.checks.cache ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <span className="text-sm font-medium">
                  {data.analytics.totalCachedRecipes.toLocaleString()} recipes
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">API Quota</div>
              <div className={cn("flex items-center gap-1", data.health.checks.quota ? 'text-green-600' : 'text-yellow-600')}>
                {data.health.checks.quota ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                <span className="text-sm font-medium">
                  {data.analytics.quotaUsage.remaining} remaining
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Performance</div>
              <div className={cn("flex items-center gap-1", data.health.checks.performance ? 'text-green-600' : 'text-yellow-600')}>
                {data.health.checks.performance ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                <span className="text-sm font-medium">
                  {data.analytics.avgResponseTime}ms avg
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Cache Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Cache Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Cache Hit Rate</span>
                <span className="font-medium">{data.analytics.cacheHitRate}%</span>
              </div>
              <Progress value={data.analytics.cacheHitRate} className="h-2" />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Recipes</span>
                <span className="font-medium">{data.analytics.totalCachedRecipes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Avg Response</span>
                <span className="font-medium">{data.analytics.avgResponseTime}ms</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Quota */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              API Quota Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Today&apos;s Usage</span>
                <span className="font-medium">
                  {data.analytics.quotaUsage.today} / 150
                </span>
              </div>
              <Progress value={data.analytics.quotaUsage.percentage} className="h-2" />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Remaining</span>
                <span className="font-medium">{data.analytics.quotaUsage.remaining}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Usage %</span>
                <span className="font-medium">{data.analytics.quotaUsage.percentage}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Cache Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleWarmupCache}
              disabled={isOperationRunning}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Warmup Cache
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={handleOptimizeCache}
              disabled={isOperationRunning}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Optimize Cache
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={handleClearMetrics}
              disabled={isOperationRunning}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Metrics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-muted-foreground">
        <Clock className="h-3 w-3 inline mr-1" />
        Last updated: {lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  );
}

export default EnhancedSpoonacularManagement;