import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { orderService } from "../services/order.service";
import type { Order, UpdatePaymentStatusRequest } from "../types";
import { mergeOrder, updateCachedOrderLists } from "./orderCache";

interface UpdatePaymentStatusVariables {
  id: string;
  payload: UpdatePaymentStatusRequest;
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdatePaymentStatusVariables) =>
      orderService.updatePaymentStatus(id, payload),

    onSuccess: (updatedOrder, variables) => {
      const detailQueryKey = queryKeys.orders.detail(variables.id);
      const currentOrder = queryClient.getQueryData<Order>(detailQueryKey);

      queryClient.setQueryData<Order>(
        detailQueryKey,
        mergeOrder(currentOrder, updatedOrder),
      );
      updateCachedOrderLists(queryClient, updatedOrder, false);

      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard,
        refetchType: "active",
      });
    },
  });
}
