import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import {
  orderService,
  type OrdersListResult,
} from "../services/order.service";
import type { Order, UpdateOrderStatusRequest } from "../types";

interface UpdateOrderStatusVariables {
  id: string;
  payload: UpdateOrderStatusRequest;
}

const mergeOrder = (currentOrder: Order | undefined, updatedOrder: Order) => {
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

const updateCachedOrderLists = (
  queryClient: ReturnType<typeof useQueryClient>,
  updatedOrder: Order,
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

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateOrderStatusVariables) =>
      orderService.updateStatus(id, payload),

    onSuccess: (updatedOrder, variables) => {
      const detailQueryKey = queryKeys.orders.detail(variables.id);
      const currentOrder = queryClient.getQueryData<Order>(detailQueryKey);

      if (currentOrder) {
        queryClient.setQueryData<Order>(
          detailQueryKey,
          mergeOrder(currentOrder, updatedOrder),
        );
      }

      updateCachedOrderLists(queryClient, updatedOrder);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard,
        refetchType: "active",
      });
    },
  });
}
