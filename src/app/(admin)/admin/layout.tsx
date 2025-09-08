import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Admin Navbar */}
      <header className="h-16 flex items-center px-8 border-b border-border bg-card/80 backdrop-blur sticky top-0 z-30">
        <Link href="/admin" className="text-2xl font-bold text-primary">
          SmartPlates Admin
        </Link>
        <nav className="ml-auto flex gap-6">
          <Link
            href="/admin/dashboard/statistics"
            className="hover:text-accent"
          >
            Statistiken
          </Link>
          <Link
            href="/admin/dashboard/manage-users"
            className="hover:text-accent"
          >
            User-Management
          </Link>
          <Link
            href="/admin/dashboard/manage-recipes"
            className="hover:text-accent"
          >
            Rezept-Management
          </Link>
          <Link
            href="/admin/dashboard/manage_cookware_commissions"
            className="hover:text-accent"
          >
            Kommissionsverwaltung
          </Link>
          <Link href="/admin/settings" className="hover:text-accent">
            Einstellungen
          </Link>
        </nav>
      </header>
      {/* Main Content */}
      <main className="flex-1 flex flex-col p-8 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
