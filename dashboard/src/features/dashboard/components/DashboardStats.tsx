import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";

import StatCard from "@/components/shared/StatCard";

import { DashboardStats as DashboardStatsType } from "../types";

type Props = {
  stats: DashboardStatsType;
};

export default function DashboardStats({ stats }: Props) {
  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Today's Orders"
        value={stats.todayOrders}
        description="Orders received today"
        icon={ShoppingCart}
      />

      <StatCard
        title="Today's Revenue"
        value={`PKR ${stats.todayRevenue.toLocaleString()}`}
        description="Revenue earned today"
        icon={DollarSign}
      />

      <StatCard
        title="Customers"
        value={stats.customers}
        description="Registered customers"
        icon={Users}
      />

      <StatCard
        title="Menu Items"
        value={stats.menuItems}
        description="Active menu items"
        icon={Package}
      />
    </section>
  );
}
