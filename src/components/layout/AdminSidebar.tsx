import Link from "next/link";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin/dashboard/statistics", label: "Statistiken" },
  { href: "/admin/dashboard/manage-users", label: "User-Management" },
  { href: "/admin/dashboard/manage-recipes", label: "Rezept-Management" },
  { href: "/admin/dashboard/manage_cookware_commissions", label: "Kommissionsverwaltung" },
  { href: "/admin/settings", label: "Einstellungen" },
];

export function AdminSidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-64 h-[calc(100vh-4rem)] bg-card border-r border-border sticky top-16 p-6 gap-4 z-20",
        className
      )}
    >
      <nav className="flex flex-col gap-2">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded px-3 py-2 hover:bg-accent hover:text-accent-foreground transition"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
