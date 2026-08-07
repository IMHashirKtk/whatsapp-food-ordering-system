import Link from "next/link";
import { CheckCircle2, Clock3, Store, XCircle } from "lucide-react";

import { StatusBadge } from "@/components/shared/StatusBadge";

import type { DashboardRestaurant } from "../types";

type Props = {
  restaurant: DashboardRestaurant;
};

export default function DashboardOperationalHeader({ restaurant }: Props) {
  const isAcceptingOrders = restaurant.isOpen && restaurant.orderAcceptanceEnabled;

  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="rounded-lg bg-primary-soft p-3">
            <Store className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold text-foreground">
              {restaurant.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Restaurant time: {restaurant.timezone}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <StatusBadge
            tone={restaurant.isOpen ? "success" : "danger"}
            className="gap-1.5 px-3 py-1.5"
          >
            {restaurant.isOpen ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {restaurant.isOpen ? "Open" : "Closed"}
          </StatusBadge>
          <StatusBadge
            tone={isAcceptingOrders ? "info" : "neutral"}
            className="gap-1.5 px-3 py-1.5"
          >
            {isAcceptingOrders ? "Accepting Orders" : "Not Accepting Orders"}
          </StatusBadge>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-muted-foreground" />
          Hours: {restaurant.openingTime ?? "Not set"} – {restaurant.closingTime ?? "Not set"}
        </span>
        <Link
          href="/dashboard/settings"
          className="font-semibold text-primary hover:text-primary-hover"
        >
          Manage availability
        </Link>
      </div>
    </section>
  );
}
