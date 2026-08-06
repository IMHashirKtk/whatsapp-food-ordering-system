"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Loader2, Printer, X } from "lucide-react";
import { toast } from "sonner";

import ErrorState from "@/components/shared/ErrorState";
import Loading from "@/components/shared/Loading";
import { Button } from "@/components/ui/button";

import { useOrder } from "../hooks/useOrder";
import type { Order, OrderItem } from "../types";
import { OrderStatusActions } from "./OrderStatusActions";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderReceipt } from "./OrderReceipt";
import { printOrderReceipt } from "../utils/printOrderReceipt";

interface OrderDetailsDrawerProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DetailRowProps {
  label: string;
  value: ReactNode;
}

const formatCurrency = (value?: number | string | null): string => {
  if (value === null || value === undefined || value === "") {
    return "PKR 0.00";
  }

  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return "PKR 0.00";
  }

  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
  }).format(amount);
};

const formatDate = (value?: string | null): string => {
  if (!value) {
    return "Not provided";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not provided";
  }

  return parsedDate.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatLabel = (value?: string | null): string => {
  if (!value) {
    return "Not provided";
  }

  return value.replace(/_/g, " ").toLowerCase();
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="grid gap-1 border-b border-gray-100 py-3 last:border-b-0 sm:grid-cols-[140px_1fr] sm:gap-4">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900">{value}</dd>
    </div>
  );
}

function EmptyDrawerState() {
  return (
    <div className="flex min-h-[300px] items-center justify-center px-6 text-center">
      <div>
        <h3 className="text-base font-semibold text-gray-900">
          No order selected
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Select an order from the table to view its details.
        </p>
      </div>
    </div>
  );
}

function OrderItemsList({ items }: { items: OrderItem[] }) {
  if (!items.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
        No items were found for this order.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                {item.menuItem?.name ?? item.menuItemId}
              </h4>
              <p className="mt-1 text-sm text-gray-500">
                Quantity: {item.quantity}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(item.totalPrice)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Base {formatCurrency(item.basePrice)}
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-gray-100 pt-3">
            <p className="text-xs font-semibold uppercase text-gray-500">
              Item options
            </p>

            {item.options.length ? (
              <ul className="mt-2 space-y-2">
                {item.options.map((option) => (
                  <li
                    key={option.id}
                    className="flex items-center justify-between gap-4 text-sm"
                  >
                    <span className="text-gray-700">{option.name}</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(option.extraPrice)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-gray-500">No options selected.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function OrderTotals({ order }: { order: Order }) {
  return (
    <dl className="rounded-lg border border-gray-200 p-4">
      <DetailRow label="Subtotal" value={formatCurrency(order.subtotal)} />
      <DetailRow label="Tax" value={formatCurrency(order.tax)} />
      <DetailRow
        label="Delivery fee"
        value={formatCurrency(order.deliveryFee)}
      />
      <DetailRow
        label="Total"
        value={
          <span className="font-semibold">{formatCurrency(order.total)}</span>
        }
      />
    </dl>
  );
}

export function OrderDetailsDrawer({
  orderId,
  open,
  onOpenChange,
}: OrderDetailsDrawerProps) {
  const {
    data: order,
    isLoading,
    isError,
  } = useOrder(orderId ?? "");
  const receiptRef = useRef<HTMLElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    setIsPrinting(true);

    try {
      await printOrderReceipt(receiptRef.current, {
        onAfterPrint: () => setIsPrinting(false),
      });
    } catch {
      setIsPrinting(false);
      toast.error("Unable to print the order receipt.");
    }
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onOpenChange, open]);

  if (!open) {
    return null;
  }

  const customer = order?.customer;
  const phone = customer?.phone ?? customer?.whatsappId ?? "Not provided";
  const address =
    order?.deliveryAddress ?? customer?.address ?? "Not provided";

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close order details"
        className="absolute inset-0 bg-black/30"
        onClick={() => onOpenChange(false)}
      />

      <aside
        aria-labelledby="order-details-title"
        aria-modal="true"
        role="dialog"
        className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-white shadow-xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
          <div>
            <p className="text-sm font-medium text-gray-500">Order details</p>
            <h2
              id="order-details-title"
              className="mt-1 text-xl font-semibold text-gray-900"
            >
              {order?.orderNumber ?? "Selected order"}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="Print order receipt"
              title="Print order receipt"
              disabled={isLoading || !order || isPrinting}
              onClick={handlePrint}
            >
              {isPrinting ? <Loader2 className="animate-spin" /> : <Printer />}
              Print Receipt
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close order details"
              onClick={() => onOpenChange(false)}
            >
              <X />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? <Loading /> : null}

          {isError ? (
            <ErrorState
              title="Unable to load order"
              description="Please close the drawer and try again."
            />
          ) : null}

          {!isLoading && !isError && !order ? <EmptyDrawerState /> : null}

          {!isLoading && !isError && order ? (
            <div className="space-y-6">
              <section>
                <h3 className="text-sm font-semibold uppercase text-gray-500">
                  Customer
                </h3>
                <dl className="mt-3 rounded-lg border border-gray-200 p-4">
                  <DetailRow
                    label="Order number"
                    value={order.orderNumber}
                  />
                  <DetailRow
                    label="Customer"
                    value={customer?.name ?? "Not provided"}
                  />
                  <DetailRow label="Phone" value={phone} />
                  <DetailRow label="Address" value={address} />
                </dl>
              </section>

              <section>
                <h3 className="text-sm font-semibold uppercase text-gray-500">
                  Items
                </h3>
                <div className="mt-3">
                    <OrderItemsList items={order.items ?? []} />
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold uppercase text-gray-500">
                  Prices
                </h3>
                <div className="mt-3">
                  <OrderTotals order={order} />
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold uppercase text-gray-500">
                  Payment and status
                </h3>
                <dl className="mt-3 rounded-lg border border-gray-200 p-4">
                  <DetailRow
                    label="Payment method"
                    value={formatLabel(order.paymentMethod)}
                  />
                  <DetailRow
                    label="Payment status"
                    value={formatLabel(order.paymentStatus)}
                  />
                  <DetailRow
                    label="Order status"
                    value={<OrderStatusBadge status={order.status} />}
                  />
                  {order.status !== "CANCELLED" ? (
                    <DetailRow
                      label="Status actions"
                      value={
                        <OrderStatusActions
                          orderId={order.id}
                          currentStatus={order.status}
                          variant="drawer"
                        />
                      }
                    />
                  ) : null}
                  {order.status === "CANCELLED" ? (
                    <DetailRow
                      label="Cancellation reason"
                      value={order.cancellationReason?.trim() || "Not provided"}
                    />
                  ) : null}
                  <DetailRow
                    label="Notes"
                    value={order.notes?.trim() || "Not provided"}
                  />
                  <DetailRow
                    label="Created at"
                    value={formatDate(order.createdAt)}
                  />
                  <DetailRow
                    label="Updated at"
                    value={formatDate(order.updatedAt)}
                  />
                </dl>
              </section>
            </div>
          ) : null}
        </div>
      </aside>

      {order ? (
        <OrderReceipt
          ref={receiptRef}
          order={order}
          restaurantName="Foodaji"
        />
      ) : null}
    </div>
  );
}
