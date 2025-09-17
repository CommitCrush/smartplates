/**
 * Cache Initializer Component
 * 
 * Initializes the recipe cache when the app starts
 */

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, Clock } from 'lucide-react';

interface CacheStatus {
  isLoading: boolean;
  lastRefresh?: string;
  totalRecipes?: number;
  error?: string;
}

export function CacheInitializer() {
  const [cacheStatus, setCacheStatus] = useState<CacheStatus>({ isLoading: false });

  const refreshCache = async () => {
    setCacheStatus({ isLoading: true });
    
    try {
      const response = await fetch('/api/recipes/refresh-cache', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCacheStatus({
          isLoading: false,
          lastRefresh: data.data.lastUpdated,
          totalRecipes: data.data.totalRecipes
        });
      } else {
        throw new Error(data.message || 'Failed to refresh cache');
      }
    } catch (error) {
      setCacheStatus({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Auto-initialize cache on component mount
  useEffect(() => {
    // Check if we need to refresh cache automatically
    const autoRefresh = localStorage.getItem('lastCacheRefresh');
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    // Only auto-refresh if cache is older than 1 day AND we haven't had payment errors
    const lastPaymentError = localStorage.getItem('lastPaymentError');
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    // Skip auto-refresh if we had a payment error in the last hour
    const shouldSkipDueToPaymentError = lastPaymentError && parseInt(lastPaymentError) > oneHourAgo;
    
    if (!autoRefresh || (parseInt(autoRefresh) < oneDayAgo && !shouldSkipDueToPaymentError)) {
      console.log('🚀 Auto-initializing recipe cache...');
      refreshCache().then(() => {
        localStorage.setItem('lastCacheRefresh', Date.now().toString());
      }).catch((error) => {
        if (error.message.includes('402') || error.message.includes('Payment')) {
          localStorage.setItem('lastPaymentError', Date.now().toString());
          console.log('⚠️ Payment error detected, skipping future auto-refreshes for 1 hour');
        }
      });
    } else if (shouldSkipDueToPaymentError) {
      console.log('⏭️ Skipping cache refresh due to recent payment error');
    }
  }, []);

  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      {/* Cache Status */}
      <div className="flex items-center gap-2">
        <Database className="h-4 w-4" />
        <span>
          {cacheStatus.totalRecipes 
            ? `${cacheStatus.totalRecipes} recipes cached` 
            : 'Cache status unknown'
          }
        </span>
      </div>

      {/* Last Refresh */}
      {cacheStatus.lastRefresh && (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>
            Updated: {new Date(cacheStatus.lastRefresh).toLocaleDateString()}
          </span>
        </div>
      )}

      {/* Refresh Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={refreshCache}
        disabled={cacheStatus.isLoading}
        className="h-8"
      >
        <RefreshCw className={`h-3 w-3 mr-2 ${cacheStatus.isLoading ? 'animate-spin' : ''}`} />
        {cacheStatus.isLoading ? 'Refreshing...' : 'Refresh Cache'}
      </Button>

      {/* Error Display */}
      {cacheStatus.error && (
        <div className="text-red-500 text-xs">
          Error: {cacheStatus.error}
        </div>
      )}
    </div>
  );
}