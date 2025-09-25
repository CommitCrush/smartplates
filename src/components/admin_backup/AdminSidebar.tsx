'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  ChefHat,
  Settings,
  BarChart3,
  CookingPot,
  LogOut,
  Home
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard/statistics',
    icon: LayoutDashboard,
    description: 'Übersicht und Statistiken'
  },
  {
    title: 'Statistiken',
    href: '/admin/dashboard/statistics',
    icon: BarChart3,
    description: 'Analyse und Berichte'
  },
  {
    title: 'Benutzer verwalten',
    href: '/admin/dashboard/manage-users',
    icon: Users,
    description: 'Benutzerkonten verwalten'
  },
  {
    title: 'Rezepte verwalten',
    href: '/admin/dashboard/manage-recipes',
    icon: ChefHat,
    description: 'Rezepte moderieren'
  },
  {
    title: 'Kochgeschirr',
    href: '/admin/dashboard/manage_cookware_commissions',
    icon: CookingPot,
    description: 'Kommissionen verwalten'
  },
  {
    title: 'Einstellungen',
    href: '/admin/settings',
    icon: Settings,
    description: 'Systemkonfiguration'
  }
];

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn('flex h-full flex-col bg-white border-r border-gray-200', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
          <p className="text-sm text-gray-500">SmartPlates</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className={cn('h-5 w-5', isActive ? 'text-blue-700' : 'text-gray-400')} />
                  <div className="flex-1 min-w-0">
                    <div className={cn('truncate', isActive ? 'text-blue-700' : 'text-gray-700')}>
                      {item.title}
                    </div>
                    {item.description && (
                      <div className={cn(
                        'text-xs mt-1 truncate',
                        isActive ? 'text-blue-600' : 'text-gray-500'
                      )}>
                        {item.description}
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Quick Actions */}
      <div className="border-t border-gray-200 p-4">
        <div className="space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900"
          >
            <Home className="h-5 w-5 text-gray-400" />
            <span>Zurück zur Hauptseite</span>
          </Link>
          
          <button
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 w-full text-left"
            onClick={() => {
              // Handle logout logic
              console.log('Logout clicked');
            }}
          >
            <LogOut className="h-5 w-5 text-gray-400" />
            <span>Abmelden</span>
          </button>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          <span>System Online</span>
        </div>
      </div>
    </div>
  );
}
