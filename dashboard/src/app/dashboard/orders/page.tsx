"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import ErrorState from "@/components/shared/ErrorState";
import Loading from "@/components/shared/Loading";
import PageHeader from "@/components/shared/PageHeader";
import {
  OrderFilters,
  type OrderStatusFilter,
} from "@/features/orders/components/OrderFilters";
import { OrderDetailsDrawer } from "@/features/orders/components/OrderDetailsDrawer";
import { OrdersTable } from "@/features/orders/components/OrdersTable";
import { useOrders } from "@/features/orders/hooks/useOrders";
import { GetOrdersParams, OrderStatus } from "@/features/orders/types";

const DEFAULT_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 500;

export default function OrdersPage() {
  return (
    <Suspense fallback={<Loading />}>
      <OrdersPageContent />
    </Suspense>
  );
}

function OrdersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<OrderStatusFilter>("ALL");
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(DEFAULT_LIMIT);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const requestedOrderId = searchParams.get("orderId");

  useEffect(() => {
    if (requestedOrderId) {
      setSelectedOrderId(requestedOrderId);
    }
  }, [requestedOrderId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchValue(searchValue.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [searchValue]);

  const params = useMemo<GetOrdersParams>(() => {
    return {
      page,
      limit,
      status: status === "ALL" ? undefined : (status as OrderStatus),
      search: debouncedSearchValue || undefined,
    };
  }, [debouncedSearchValue, limit, page, status]);

  const { data, isLoading, isError } = useOrders(params);

  const handleStatusChange = (value: OrderStatusFilter) => {
    setStatus(value);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setPage(1);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        title="Unable to load orders"
        description="Please try again shortly."
      />
    );
  }

  const orders = data.orders;

  return (
    <>
      <PageHeader
        title="Orders"
        description="Manage incoming restaurant orders and keep the pipeline moving."
      />

      <OrderFilters
        status={status}
        onStatusChange={handleStatusChange}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
      />

      <div className="mt-6">
        <OrdersTable
          orders={orders}
          isLoading={false}
          emptyMessage="No orders available."
          pagination={data.pagination}
          onPageChange={setPage}
          onOrderClick={(order) => setSelectedOrderId(order.id)}
        />
      </div>

      <OrderDetailsDrawer
        orderId={selectedOrderId}
        open={Boolean(selectedOrderId)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOrderId(null);

            if (requestedOrderId) {
              router.replace("/dashboard/orders", { scroll: false });
            }
          }
        }}
      />
    </>
  );
}
