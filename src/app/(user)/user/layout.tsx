import React from 'react';
import Link from 'next/link';

interface UserLayoutProps {
  children: React.ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-foreground">
              SmartPlates
            </h1>
            <nav className="space-x-4">
              <Link href="/user" className="text-primary-600 hover:text-primary-700">
                Dashboard
              </Link>
              <Link href="/user/profile" className="text-muted-foreground hover:text-foreground">
                Profile
              </Link>
              <Link href="/user/dashboard/my_meal_plan/current" className="text-muted-foreground hover:text-foreground">
                Meal Planning
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}