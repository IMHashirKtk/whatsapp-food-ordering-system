import Link from "next/link";
import { BarChart3, Menu, Settings, ShoppingBag, Users } from "lucide-react";

const actions = [
  { title: "View Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { title: "Manage Menu", href: "/dashboard/menu", icon: Menu },
  { title: "View Customers", href: "/dashboard/customers", icon: Users },
  { title: "Open Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  {
    title: "Availability Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
] as const;

export default function QuickActionsCard() {
  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-foreground">Quick actions</h2>
      <p className="mt-1 text-sm text-muted-foreground">Jump to common tasks.</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex min-h-11 items-center gap-3 rounded-md border border-border p-3 text-left transition hover:border-primary/40 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon className="h-5 w-5 shrink-0 text-primary" />
              <span className="font-medium text-foreground">{action.title}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
