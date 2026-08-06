import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { orderService } from "../services/order.service";
import { Order } from "../types";

export function useOrder(id: string): UseQueryResult<Order, Error> {
  return useQuery<Order, Error>({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => orderService.getOrder(id),
    enabled: Boolean(id),
  });
}
