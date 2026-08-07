import { Ban, PackageCheck, UserPlus } from "lucide-react";

import type { DashboardToday } from "../types";

type Props = {
  today: DashboardToday;
};

function SummaryItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="shrink-0 rounded-md bg-muted p-2">{icon}</div>
        <span className="truncate text-sm font-medium text-foreground">{label}</span>
      </div>
      <span className="shrink-0 text-lg font-bold text-foreground">{value}</span>
    </div>
  );
}

export default function TodaySummaryCard({ today }: Props) {
  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">Today summary</h2>
        <p className="text-sm text-muted-foreground">Completed activity for the restaurant-local day.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryItem
          label="Delivered Today"
          value={today.deliveredOrders}
          icon={<PackageCheck className="h-5 w-5 text-success" />}
        />
        <SummaryItem
          label="Cancelled Today"
          value={today.cancelledOrders}
          icon={<Ban className="h-5 w-5 text-destructive" />}
        />
        <SummaryItem
          label="New Customers Today"
          value={today.newCustomers}
          icon={<UserPlus className="h-5 w-5 text-info" />}
        />
      </div>
    </section>
  );
}
