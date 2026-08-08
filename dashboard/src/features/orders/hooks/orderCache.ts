import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import type { Order } from "../types";
import type { OrdersListResult } from "../services/order.service";

export const mergeOrder = (
  currentOrder: Order | undefined,
  updatedOrder: Order,
) => {
  if (!currentOrder) {
    return updatedOrder;
  }

  return {
    ...currentOrder,
    ...updatedOrder,
    customer: updatedOrder.customer ?? currentOrder.customer,
    items: updatedOrder.items ?? currentOrder.items,
  };
};

export const updateCachedOrderLists = (
  queryClient: QueryClient,
  updatedOrder: Order,
  removeStaleStatus = true,
) => {
  const cachedQueries = queryClient.getQueriesData<OrdersListResult>({
    queryKey: queryKeys.orders.all,
  });

  cachedQueries.forEach(([queryKey, cachedResult]) => {
    if (queryKey[1] !== "list" || !cachedResult) {
      return;
    }

    const containsUpdatedOrder = cachedResult.orders.some(
      (order) => order.id === updatedOrder.id,
    );

    if (!containsUpdatedOrder) {
      return;
    }

    const listParams = queryKey[2];
    const statusFilter =
      typeof listParams === "object" && listParams !== null
        ? (listParams as { status?: string }).status
        : undefined;
    const shouldRemoveFromList =
      removeStaleStatus &&
      Boolean(statusFilter) &&
      statusFilter !== "all" &&
      statusFilter !== updatedOrder.status;

    const orders = shouldRemoveFromList
      ? cachedResult.orders.filter((order) => order.id !== updatedOrder.id)
      : cachedResult.orders.map((order) =>
          order.id === updatedOrder.id
            ? mergeOrder(order, updatedOrder)
            : order,
        );

    const total = shouldRemoveFromList
      ? Math.max(cachedResult.pagination.total - 1, 0)
      : cachedResult.pagination.total;

    queryClient.setQueryData<OrdersListResult>(queryKey, {
      ...cachedResult,
      orders,
      pagination: {
        ...cachedResult.pagination,
        total,
        totalPages: Math.max(
          Math.ceil(total / cachedResult.pagination.limit),
          1,
        ),
      },
    });
  });
};
