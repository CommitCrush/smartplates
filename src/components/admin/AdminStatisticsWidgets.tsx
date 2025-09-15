'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      <span className="mt-2 text-lg text-muted-foreground">Registrierte Nutzer</span>
    </Card>
  );
}

export function RecipeCountWidget({ count }: { count: number }) {
  return (
    <Card className="p-6 flex flex-col items-center justify-center">
      <span className="text-5xl font-bold text-primary">{count}</span>
      <span className="mt-2 text-lg text-muted-foreground">Rezepte</span>
    </Card>
  );
}

export function CommissionCountWidget({ count }: { count: number }) {
  return (
    <Card className="p-6 flex flex-col items-center justify-center">
      <span className="text-5xl font-bold text-primary">{count}</span>
      <span className="mt-2 text-lg text-muted-foreground">Kommissionen</span>
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
      setError(error instanceof Error ? error.message : 'Fehler beim Laden der Statistiken');
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
      case 'healthy': return 'Gesund';
      case 'warning': return 'Warnung';
      case 'error': return 'Fehler';
      default: return 'Unbekannt';
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
