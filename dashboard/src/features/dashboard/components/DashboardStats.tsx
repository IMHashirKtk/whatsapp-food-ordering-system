import {
  BadgePoundSterling,
  CircleDollarSign,
  ClipboardList,
  ReceiptText,
} from "lucide-react";

import StatCard from "@/components/shared/StatCard";

import type { DashboardToday } from "../types";

type Props = {
  today: DashboardToday;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 2,
  }).format(value);

export default function DashboardStats({ today }: Props) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Recognized Revenue Today"
        value={formatCurrency(today.recognizedRevenue)}
        description="Non-cancelled paid or pending-verification orders"
        icon={BadgePoundSterling}
      />

      <StatCard
        title="Gross Order Value Today"
        value={formatCurrency(today.grossOrderValue)}
        description="Non-cancelled order totals"
        icon={CircleDollarSign}
      />

      <StatCard
        title="Orders Today"
        value={today.orders}
        description="All orders created today"
        icon={ClipboardList}
      />

      <StatCard
        title="Average Order Value"
        value={formatCurrency(today.averageOrderValue)}
        description="Gross value per non-cancelled order"
        icon={ReceiptText}
      />
    </section>
  );
}
