import Link from "next/link";
import { Clock3, PackageCheck } from "lucide-react";

import { PaymentStatusBadge } from "@/components/shared/PaymentStatusBadge";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";

import type { DashboardRecentOrder } from "../types";

type Props = {
  orders: DashboardRecentOrder[];
  timezone: string;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 2,
  }).format(value);

const formatDate = (value: string, timezone: string) =>
  new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(value));

function PaymentBadge({
  paymentStatus,
}: {
  paymentStatus: DashboardRecentOrder["paymentStatus"];
}) {
  if (paymentStatus === "PAID") {
    return null;
  }

  return <PaymentStatusBadge status={paymentStatus} />;
}

export default function RecentOrdersCard({ orders, timezone }: Props) {
  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Recent orders</h2>
          <p className="text-sm text-muted-foreground">The latest orders received.</p>
        </div>

        <PackageCheck className="h-5 w-5 shrink-0 text-muted-foreground" />
      </div>

      {orders.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground">
          No orders have been received yet.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/orders?orderId=${encodeURIComponent(order.id)}`}
              className="block rounded-md border border-border p-3 transition hover:border-primary/40 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-4"
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">
                    #{order.orderNumber}
                  </p>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {order.customer.name?.trim() || order.customer.whatsappId}
                  </p>
                  <div className="mt-2 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                    <Clock3 className="h-3 w-3 shrink-0" />
                    <span className="truncate">
                      {formatDate(order.createdAt, timezone)}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2 text-right">
                  <p className="font-semibold text-foreground">
                    {formatCurrency(order.total)}
                  </p>
                  <div className="flex max-w-[11rem] flex-wrap justify-end gap-1.5">
                    <OrderStatusBadge status={order.status} />
                    <PaymentBadge paymentStatus={order.paymentStatus} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Link
        href="/dashboard/orders"
        className="mt-5 inline-flex text-sm font-semibold text-primary hover:text-primary-hover"
      >
        View all orders
      </Link>
    </section>
  );
}
