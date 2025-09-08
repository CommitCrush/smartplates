import React from "react";
import { cn } from "@/lib/utils";

export function AdminTable({ columns, data, className }: {
  columns: { key: string; label: string }[];
  data: Record<string, any>[];
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto rounded border border-border", className)}>
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-2 text-left font-semibold text-sm text-muted-foreground">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-background divide-y divide-border">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-accent/30">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-2 text-sm">
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
