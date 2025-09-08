import React from "react";
import { Card } from "@/components/ui/card";

export function UserCountWidget({ count }: { count: number }) {
  return (
    <Card className="p-6 flex flex-col items-center justify-center">
      <span className="text-5xl font-bold text-primary">{count}</span>
      <span className="mt-2 text-lg text-muted-foreground">Registrierte Nutzer</span>
    </Card>
  );
}

export function RecipeCountWidget({ count }: { count: number }) {
  return (
    <Card className="p-6 flex flex-col items-center justify-center">
      <span className="text-5xl font-bold text-primary">{count}</span>
      <span className="mt-2 text-lg text-muted-foreground">Rezepte</span>
    </Card>
  );
}

export function CommissionCountWidget({ count }: { count: number }) {
  return (
    <Card className="p-6 flex flex-col items-center justify-center">
      <span className="text-5xl font-bold text-primary">{count}</span>
      <span className="mt-2 text-lg text-muted-foreground">Kommissionen</span>
    </Card>
  );
}
