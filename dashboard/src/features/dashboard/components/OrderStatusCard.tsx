import {
  CheckCircle2,
  ChefHat,
  ClipboardCheck,
  PackageCheck,
  Truck,
} from "lucide-react";

import type { DashboardLiveOrders } from "../types";

type Props = {
  liveOrders: DashboardLiveOrders;
};

type StatusItemProps = {
  label: string;
  value: number;
  icon: React.ReactNode;
  emphasis?: "attention" | "default";
};

function StatusItem({
  label,
  value,
  icon,
  emphasis = "default",
}: StatusItemProps) {
  return (
    <div
      className={`flex min-w-0 items-center justify-between gap-3 rounded-xl border p-3 ${
        emphasis === "attention"
        ? "border-warning/30 bg-warning/10"
          : "border-border bg-card"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="shrink-0 rounded-md bg-muted p-2">{icon}</div>
        <span className="truncate text-sm font-medium text-foreground">
          {label}
        </span>
      </div>
      <span className="shrink-0 text-lg font-bold text-foreground">{value}</span>
    </div>
  );
}

export default function OrderStatusCard({ liveOrders }: Props) {
  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">
          Operational queue
        </h2>
        <p className="text-sm text-muted-foreground">
          Current orders that need attention or are in progress.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatusItem
          label="Pending"
          value={liveOrders.pending}
          emphasis="attention"
          icon={<ClipboardCheck className="h-5 w-5 text-warning" />}
        />
        <StatusItem
          label="Active"
          value={liveOrders.active}
          icon={<PackageCheck className="h-5 w-5 text-info" />}
        />
        <StatusItem
          label="Preparing"
          value={liveOrders.preparing}
          icon={<ChefHat className="h-5 w-5 text-warning" />}
        />
        <StatusItem
          label="Ready"
          value={liveOrders.ready}
          icon={<CheckCircle2 className="h-5 w-5 text-success" />}
        />
        <StatusItem
          label="Out for Delivery"
          value={liveOrders.outForDelivery}
          icon={<Truck className="h-5 w-5 text-info" />}
        />
      </div>
    </section>
  );
}
