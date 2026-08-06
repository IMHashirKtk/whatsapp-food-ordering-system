import { Clock3, PackageCheck } from "lucide-react";

import { RecentOrder } from "../types";

type Props = {
  orders: RecentOrder[];
};

function getStatusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return (
        <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
          Pending
        </span>
      );

    case "ACCEPTED":
      return (
        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
          Accepted
        </span>
      );

    case "PREPARING":
      return (
        <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
          Preparing
        </span>
      );

    case "READY":
      return (
        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
          Ready
        </span>
      );

    case "OUT_FOR_DELIVERY":
      return (
        <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
          Out for Delivery
        </span>
      );

    default:
      return (
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">
          {status}
        </span>
      );
  }
}

export default function RecentOrdersCard({ orders }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Recent Orders</h2>

          <p className="text-sm text-slate-500">Latest customer orders</p>
        </div>

        <PackageCheck className="h-5 w-5 text-slate-400" />
      </div>

      {orders.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-500">
          No recent orders found.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-xl border border-slate-100 p-4 transition hover:bg-slate-50"
            >
              <div>
                <p className="font-semibold">#{order.orderNumber}</p>

                <p className="text-sm text-slate-500">{order.customer.name}</p>

                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                  <Clock3 className="h-3 w-3" />

                  {new Date(order.createdAt).toLocaleString("en-PK", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "Asia/Karachi",
                  })}
                </div>
              </div>

              <div className="text-right">
                <p className="mb-2 font-semibold">
                  PKR {Number(order.total).toLocaleString()}
                </p>

                {getStatusBadge(order.status)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
