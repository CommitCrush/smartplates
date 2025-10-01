
import React from "react";
import Navbar from "@/components/layout/Navbar";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Unified Navbar */}
      <Navbar />
      
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
