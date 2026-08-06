import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { orderService } from "../services/order.service";
import type { GetOrdersParams } from "../types";

export function useOrders(params?: GetOrdersParams) {
  return useQuery({
    queryKey: queryKeys.orders.list(params),

    queryFn: () => orderService.getOrders(params),
  });
}
