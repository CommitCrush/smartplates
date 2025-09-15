'use client';

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

export default function AdminPage() {
  const quickActions = [
    {
      title: 'Benutzer verwalten',
      description: 'Benutzerkonten verwalten und moderieren',
      href: '/admin/dashboard/manage-users',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Rezepte verwalten',
      description: 'Rezepte überprüfen und moderieren',
      href: '/admin/dashboard/manage-recipes',
      icon: ChefHat,
      color: 'text-green-600'
    },
    {
      title: 'Statistiken',
      description: 'Detaillierte System-Statistiken',
      href: '/admin/dashboard/statistics',
      icon: BarChart3,
      color: 'text-purple-600'
    },
    {
      title: 'Kommissionen',
      description: 'Cookware-Kommissionen verwalten',
      href: '/admin/dashboard/manage_cookware_commissions',
      icon: Package,
      color: 'text-orange-600'
    },
    {
      title: 'System-Einstellungen',
      description: 'Admin-Konfiguration verwalten',
      href: '/admin/settings',
      icon: Settings,
      color: 'text-gray-600'
    }
  ];

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            SmartPlates System-Verwaltung und Übersicht
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button variant="outline" asChild>
            <Link href="/admin/settings">
              <Settings className="h-4 w-4 mr-2" />
              Einstellungen
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">System-Übersicht</h2>
        </div>
        <AdminStatisticsWidgets />
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <UserCog className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Schnellaktionen</h2>
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
                      Öffnen
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
        <h2 className="text-xl font-semibold">Aktuelle Aktivität</h2>
        
        <Card>
          <CardHeader>
            <CardTitle>System-Status</CardTitle>
            <CardDescription>
              Letzte System-Events und Benachrichtigungen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">System läuft normal</span>
                </div>
                <span className="text-xs text-muted-foreground">vor 2 Minuten</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Datenbank-Backup abgeschlossen</span>
                </div>
                <span className="text-xs text-muted-foreground">vor 1 Stunde</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">5 neue Benutzer registriert</span>
                </div>
                <span className="text-xs text-muted-foreground">heute</span>
              </div>
            </div>
            
            <div className="mt-6">
              <Button variant="outline" size="sm" className="w-full">
                Alle Events anzeigen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
