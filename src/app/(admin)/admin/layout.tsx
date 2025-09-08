import React from 'react';
import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-foreground">
              SmartPlates Admin
            </h1>
            <nav className="space-x-4">
              <Link href="/admin" className="text-primary-600 hover:text-primary-700">
                Dashboard
              </Link>
              <Link href="/admin/settings" className="text-muted-foreground hover:text-foreground">
                Settings
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