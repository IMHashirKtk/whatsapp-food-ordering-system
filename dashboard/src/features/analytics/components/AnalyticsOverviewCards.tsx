import {
  BadgePoundSterling,
  Ban,
  CircleDollarSign,
  ClipboardList,
  UserPlus,
  Users,
} from "lucide-react";

import StatCard from "@/components/shared/StatCard";

import type { AnalyticsOverview } from "../types";
import {
  formatNumber,
  formatPercentage,
  formatPkr,
} from "../utils/analyticsFormatters";

interface AnalyticsOverviewCardsProps {
  data: AnalyticsOverview;
}

export default function AnalyticsOverviewCards({
  data,
}: AnalyticsOverviewCardsProps) {
  const cards = [
    {
      title: "Recognized Revenue",
      value: formatPkr(data.recognizedRevenue),
      description: "Non-cancelled paid or pending-verification orders",
      icon: BadgePoundSterling,
    },
    {
      title: "Gross Order Value",
      value: formatPkr(data.grossOrderValue),
      description: "Non-cancelled order totals",
      icon: CircleDollarSign,
    },
    {
      title: "Orders",
      value: formatNumber(data.orders),
      description: "Orders in selected range",
      icon: ClipboardList,
    },
    {
      title: "Average Order Value",
      value: formatPkr(data.averageOrderValue),
      description: "Gross value per non-cancelled order",
      icon: CircleDollarSign,
    },
    {
      title: "Cancelled Orders",
      value: formatNumber(data.cancelledOrders),
      description: "Orders cancelled in selected range",
      icon: Ban,
    },
    {
      title: "Cancellation Rate",
      value: formatPercentage(data.cancellationRate),
      description: "Cancelled orders as a share of orders",
      icon: Ban,
    },
    {
      title: "New Customers",
      value: formatNumber(data.newCustomers),
      description: "First order in selected range",
      icon: UserPlus,
    },
    {
      title: "Returning Customers",
      value: formatNumber(data.returningCustomers),
      description: "Previous customers ordering again",
      icon: Users,
    },
  ];

  return (
    <section aria-labelledby="analytics-overview-heading">
      <h2 id="analytics-overview-heading" className="sr-only">
        Analytics overview
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>
    </section>
  );
}
