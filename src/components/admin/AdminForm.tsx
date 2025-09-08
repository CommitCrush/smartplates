import React from "react";
import { cn } from "@/lib/utils";

export function AdminForm({ children, onSubmit, className }: {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
}) {
  return (
    <form onSubmit={onSubmit} className={cn("space-y-4 p-4 bg-card rounded border border-border", className)}>
      {children}
    </form>
  );
}
