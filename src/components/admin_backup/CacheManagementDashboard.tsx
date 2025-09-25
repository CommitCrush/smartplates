/**
 * Admin Cache Management Dashboard
 * 
 * Provides administrators with:
 * - Real-time cache statistics
 * - API quota monitoring
 * - Cache management controls
 * - Performance metrics
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { 
  RefreshCw, 
  Trash2, 
  Zap, 
  Database, 
  Search, 
  ChefHat, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Simple Progress component inline
const Progress = ({ value, className }: { value: number; className?: string }) => (
  <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', className)}>
    <div 
      className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

interface CacheStats {
  recipes: number;
  searches: number;
  ingredientSearches: number;
  randomSets: number;
  totalEntries: number;
  quotaStatus: {
    remaining: number;
    total: number;
    percentage: number;
    canMakeRequest: boolean;
  };
}

export function CacheManagementDashboard() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch cache statistics
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cache/spoonacular?action=stats');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch cache stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle cache actions
  const handleCacheAction = async (action: string) => {
    try {
      setActionLoading(action);
      
      const response = await fetch(`/api/cache/spoonacular?action=${action}`, {
        method: 'GET'
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh stats after action
        await fetchStats();
      } else {
        console.error('Cache action failed:', result.message);
      }
    } catch (error) {
      console.error('Cache action error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    fetchStats();
    
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const quotaStatus = stats?.quotaStatus;
  const quotaPercentage = quotaStatus?.percentage || 0;
  
  // Determine quota status color
  const getQuotaStatusColor = () => {
    if (quotaPercentage >= 80) return 'text-green-600 bg-green-50';
    if (quotaPercentage >= 50) return 'text-yellow-600 bg-yellow-50';
    if (quotaPercentage >= 20) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cache Management</h2>
          <p className="text-muted-foreground">
            Monitor and manage Spoonacular API cache
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            Refresh
          </Button>
          
          <Badge variant="secondary" className="text-xs">
            Updated: {lastUpdated.toLocaleTimeString()}
          </Badge>
        </div>
      </div>

      {/* API Quota Status */}
      <Card className={cn('border-l-4', 
        quotaStatus?.canMakeRequest ? 'border-l-green-500' : 'border-l-red-500'
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              API Quota Status
            </CardTitle>
            
            <Badge className={getQuotaStatusColor()}>
              {quotaStatus?.canMakeRequest ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <AlertTriangle className="h-3 w-3 mr-1" />
              )}
              {quotaStatus?.canMakeRequest ? 'Healthy' : 'Limited'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Remaining Requests</span>
              <span className="font-mono">
                {quotaStatus?.remaining || 0} / {quotaStatus?.total || 150}
              </span>
            </div>
            
            <Progress 
              value={quotaPercentage} 
              className="h-2"
            />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {quotaPercentage}%
                </div>
                <div className="text-muted-foreground">Available</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {quotaStatus?.total ? quotaStatus.total - (quotaStatus.remaining || 0) : 0}
                </div>
                <div className="text-muted-foreground">Used Today</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cache Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Cached Recipes
                </p>
                <p className="text-2xl font-bold">
                  {stats?.recipes.toLocaleString() || 0}
                </p>
              </div>
              <ChefHat className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Search Results
                </p>
                <p className="text-2xl font-bold">
                  {stats?.searches.toLocaleString() || 0}
                </p>
              </div>
              <Search className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ingredient Searches
                </p>
                <p className="text-2xl font-bold">
                  {stats?.ingredientSearches.toLocaleString() || 0}
                </p>
              </div>
              <Database className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Entries
                </p>
                <p className="text-2xl font-bold">
                  {stats?.totalEntries.toLocaleString() || 0}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cache Management Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Cache Management Actions
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => handleCacheAction('clear-expired')}
              disabled={actionLoading === 'clear-expired'}
              className="flex items-center justify-center gap-2"
            >
              {actionLoading === 'clear-expired' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Clear Expired
            </Button>

            <Button
              variant="outline"
              onClick={() => handleCacheAction('warmup')}
              disabled={actionLoading === 'warmup'}
              className="flex items-center justify-center gap-2"
            >
              {actionLoading === 'warmup' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              Warm Up Cache
            </Button>

            <Button
              variant="outline"
              onClick={fetchStats}
              disabled={loading}
              className="flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh Stats
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cache Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Cache Efficiency</h4>
                <div className="text-2xl font-bold text-green-600">
                  ~90%+
                </div>
                <p className="text-xs text-muted-foreground">
                  Estimated cache hit rate reduces API calls by 90%+
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Cost Savings</h4>
                <div className="text-2xl font-bold text-blue-600">
                  ${((stats?.totalEntries || 0) * 0.001).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Estimated monthly storage cost in MongoDB
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Tip:</strong> Run &quot;Warm Up Cache&quot; during off-peak hours to pre-populate 
                popular recipes and improve user experience.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CacheManagementDashboard;