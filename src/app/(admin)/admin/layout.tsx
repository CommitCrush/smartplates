
import React from "react";
import Navbar from "@/components/layout/Navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Unified Navbar */}
      <Navbar />

      {/* Main Content without Sidebar */}
      <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto p-8">
        {children}
      </main>
    </div>
  );
}
