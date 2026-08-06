import {
  BadgeCheck,
  CircleAlert,
  CircleDollarSign,
  Clock3,
  CreditCard,
  PackageCheck,
  ShoppingBag,
  Timer,
} from "lucide-react";

import StatCard from "@/components/shared/StatCard";

import type { CustomerSummary } from "../types";
import { formatCustomerCurrency } from "../utils/customerFormatters";

interface CustomerSummaryCardsProps {
  summary: CustomerSummary;
}

export function CustomerSummaryCards({
  summary,
}: CustomerSummaryCardsProps) {
  const cards = [
    { title: "Pending orders", value: summary.pendingOrders, icon: Timer },
    { title: "Active orders", value: summary.activeOrders, icon: ShoppingBag },
    {
      title: "Delivered orders",
      value: summary.deliveredOrders,
      icon: PackageCheck,
    },
    {
      title: "Cancelled orders",
      value: summary.cancelledOrders,
      icon: CircleAlert,
    },
    { title: "Unpaid orders", value: summary.unpaidOrders, icon: CreditCard },
    {
      title: "Pending verification",
      value: summary.pendingVerificationOrders,
      icon: Clock3,
    },
    { title: "Paid orders", value: summary.paidOrders, icon: BadgeCheck },
    {
      title: "Average order value",
      value: formatCustomerCurrency(summary.averageOrderValue),
      icon: CircleDollarSign,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}
