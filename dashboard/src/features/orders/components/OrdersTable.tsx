"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Loader2, Printer } from "lucide-react";
import { toast } from "sonner";

import Loading from "@/components/shared/Loading";
import { Button } from "@/components/ui/button";
import type {
  MonetaryAmount,
  Order,
  OrdersPagination,
  OrderStatus,
} from "../types";
import { OrderStatusActions } from "./OrderStatusActions";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderReceipt } from "./OrderReceipt";
import { useOrder } from "../hooks/useOrder";
import { printOrderReceipt } from "../utils/printOrderReceipt";

interface OrdersTableProps {
  orders: Order[];
  isLoading?: boolean;
  emptyMessage?: string;
  pagination?: OrdersPagination;
  onOrderClick?: (order: Order) => void;
  onPageChange?: (page: number) => void;
}

const columnHelper = createColumnHelper<Order>();

const formatCurrency = (value?: MonetaryAmount | null) => {
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

const formatDate = (value?: string | null) => {
  if (!value) {
    return "—";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

function createColumns(
  onPrint: (orderId: string) => void,
  printOrderId: string | null,
) {
  return [
  columnHelper.accessor("orderNumber", {
    header: "Order ID",
    cell: (info) => (
      <span className="font-medium">{info.getValue<string>() ?? "—"}</span>
    ),
  }),
  columnHelper.accessor("customer", {
    header: "Customer",
    cell: (info) => {
      const customer = info.getValue<Order["customer"] | null | undefined>();

      if (!customer) {
        return <span className="text-muted-foreground">—</span>;
      }

      return (
        <div className="flex flex-col">
          <span className="font-medium">{customer.name ?? "—"}</span>
          <span className="text-sm text-muted-foreground">
            {customer.phone ?? customer.whatsappId ?? "—"}
          </span>
        </div>
      );
    },
  }),
  columnHelper.accessor("items", {
    header: "Items Count",
    cell: (info) => {
      const items = info.getValue<Order["items"] | null | undefined>();

      return (
        <span>{info.row.original.itemCount ?? items?.length ?? 0}</span>
      );
    },
  }),
  columnHelper.accessor("total", {
    header: "Total",
    cell: (info) => (
      <span>
        {formatCurrency(info.getValue<MonetaryAmount | null | undefined>())}
      </span>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => (
      <OrderStatusBadge status={info.getValue<OrderStatus>() ?? "PENDING"} />
    ),
  }),
  columnHelper.accessor("createdAt", {
    header: "Created At",
    cell: (info) => (
      <span>{formatDate(info.getValue<string | null | undefined>())}</span>
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: (info) => {
      const orderId = info.row.original.id;
      const isPrinting = printOrderId === orderId;

      return (
        <div
          className="grid min-w-[280px] grid-cols-[minmax(0,1fr)_2.25rem] items-center gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="min-w-0">
            <OrderStatusActions
              orderId={orderId}
              currentStatus={info.row.original.status}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={`Print receipt for order ${info.row.original.orderNumber}`}
            title="Print order receipt"
            disabled={printOrderId !== null}
            onClick={() => onPrint(orderId)}
          >
            {isPrinting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Printer />
            )}
          </Button>
        </div>
      );
    },
  }),
  ];
}

export function OrdersTable({
  orders,
  isLoading = false,
  emptyMessage = "No orders found.",
  pagination,
  onOrderClick,
  onPageChange,
}: OrdersTableProps) {
  const [printOrderId, setPrintOrderId] = useState<string | null>(null);
  const receiptRef = useRef<HTMLElement>(null);
  const {
    data: printOrder,
    isLoading: isPrintOrderLoading,
    isError: isPrintOrderError,
  } = useOrder(printOrderId ?? "");

  const columns = useMemo(
    () =>
      createColumns(
        setPrintOrderId,
        printOrderId,
      ),
    [printOrderId],
  );

  useEffect(() => {
    if (!printOrderId) {
      return;
    }

    if (isPrintOrderError) {
      toast.error("Unable to load the order receipt.");
      setPrintOrderId(null);
      return;
    }

    if (isPrintOrderLoading || !printOrder) {
      return;
    }

    void printOrderReceipt(receiptRef.current, {
      onAfterPrint: () => setPrintOrderId(null),
    }).catch(() => {
      toast.error("Unable to print the order receipt.");
      setPrintOrderId(null);
    });
  }, [isPrintOrderError, isPrintOrderLoading, printOrder, printOrderId]);

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <Loading />;
  }

  if (!orders.length) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring data-[clickable=true]:cursor-pointer"
                data-clickable={Boolean(onOrderClick)}
                tabIndex={onOrderClick ? 0 : undefined}
                aria-label={`View details for order ${row.original.orderNumber}`}
                onClick={() => onOrderClick?.(row.original)}
                onKeyDown={(event) => {
                  if (!onOrderClick) {
                    return;
                  }

                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOrderClick(row.original);
                  }
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 align-middle text-sm text-foreground"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination ? (
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing page {currentPage} of {Math.max(totalPages, 1)} ·{" "}
            {pagination.total} orders
          </span>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!hasPreviousPage}
              onClick={() => onPageChange?.(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!hasNextPage}
              onClick={() => onPageChange?.(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
      </div>
      {printOrder ? (
        <OrderReceipt
          ref={receiptRef}
          order={printOrder}
          restaurantName="Foodaji"
        />
      ) : null}
    </>
  );
}
