
import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

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
      </header>
      {/* Main Content with Sidebar */}
      <div className="flex flex-1 w-full max-w-7xl mx-auto">
        <AdminSidebar />
        <main className="flex-1 flex flex-col p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
