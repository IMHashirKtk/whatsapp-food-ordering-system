"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";

import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import Loading from "@/components/shared/Loading";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";

import { useCustomerOrders } from "../hooks/useCustomerOrders";
import type {
  CustomerOrderStatus,
  CustomerPaymentStatus,
  GetCustomerOrdersParams,
} from "../types";
import {
  formatCustomerCurrency,
  formatCustomerDateTime,
  formatPaymentMethod,
  formatPaymentStatus,
} from "../utils/customerFormatters";

interface CustomerOrderHistoryProps {
  customerId: string;
  onOrderClick: (orderId: string) => void;
}

type StatusFilter = CustomerOrderStatus | "ALL";
type PaymentStatusFilter = CustomerPaymentStatus | "ALL";

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: "ALL", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "PREPARING", label: "Preparing" },
  { value: "READY", label: "Ready" },
  { value: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

const paymentStatusOptions: Array<{
  value: PaymentStatusFilter;
  label: string;
}> = [
  { value: "ALL", label: "All payment statuses" },
  { value: "UNPAID", label: "Unpaid" },
  { value: "PENDING_VERIFICATION", label: "Pending verification" },
  { value: "PAID", label: "Paid" },
];

export function CustomerOrderHistory({
  customerId,
  onOrderClick,
}: CustomerOrderHistoryProps) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatusFilter>("ALL");

  useEffect(() => {
    setPage(1);
  }, [customerId]);

  const params = useMemo<GetCustomerOrdersParams>(
    () => ({
      page,
      limit: 10,
      status: status === "ALL" ? undefined : status,
      paymentStatus: paymentStatus === "ALL" ? undefined : paymentStatus,
    }),
    [page, paymentStatus, status],
  );

  const { data, isError, isLoading } = useCustomerOrders(customerId, params);

  return (
    <section aria-labelledby="customer-order-history-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3
            id="customer-order-history-title"
            className="text-sm font-semibold uppercase tracking-wide text-slate-500"
          >
            Order history
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Review this customer&apos;s orders and payment status.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="sr-only" htmlFor="customer-order-status-filter">
            Filter orders by status
          </label>
          <select
            id="customer-order-status-filter"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as StatusFilter);
              setPage(1);
            }}
            className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:bg-white"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="customer-payment-status-filter">
            Filter orders by payment status
          </label>
          <select
            id="customer-payment-status-filter"
            value={paymentStatus}
            onChange={(event) => {
              setPaymentStatus(event.target.value as PaymentStatusFilter);
              setPage(1);
            }}
            className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:bg-white"
          >
            {paymentStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        {isLoading ? <Loading /> : null}
        {isError ? (
          <ErrorState
            title="Unable to load order history"
            description="Please close the drawer and try again."
          />
        ) : null}
        {!isLoading && !isError && data && !data.orders.length ? (
          <EmptyState
            title="No matching orders"
            description="There are no orders for the selected filters."
          />
        ) : null}
        {!isLoading && !isError && data?.orders.length ? (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="divide-y divide-slate-200 md:hidden">
              {data.orders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  className="block w-full p-4 text-left transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500"
                  onClick={() => onOrderClick(order.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {order.orderNumber}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatCustomerDateTime(order.createdAt)}
                      </p>
                    </div>
                    <ArrowUpRight className="size-4 text-slate-400" />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <OrderStatusBadge status={order.status} />
                    <span className="text-xs capitalize text-slate-500">
                      {formatPaymentStatus(order.paymentStatus)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-500">
                      {formatPaymentMethod(order.paymentMethod)}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {formatCustomerCurrency(order.total)}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-[640px] w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    {[
                      "Order",
                      "Status",
                      "Payment",
                      "Total",
                      "Created",
                      "View",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="px-3 py-3 text-sm font-medium text-slate-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-3 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-700">
                        <span className="block capitalize">
                          {formatPaymentStatus(order.paymentStatus)}
                        </span>
                        <span className="mt-1 block text-xs capitalize text-slate-500">
                          {formatPaymentMethod(order.paymentMethod)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-slate-900">
                        {formatCustomerCurrency(order.total)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-700">
                        {formatCustomerDateTime(order.createdAt)}
                      </td>
                      <td className="px-3 py-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Open order ${order.orderNumber}`}
                          title="Open order"
                          onClick={() => onOrderClick(order.id)}
                        >
                          <ArrowUpRight />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-3 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Page {data.pagination.page} of {Math.max(data.pagination.totalPages, 1)} · {data.pagination.total} orders
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={data.pagination.page <= 1}
                  onClick={() => setPage((value) => value - 1)}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={data.pagination.page >= data.pagination.totalPages}
                  onClick={() => setPage((value) => value + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
