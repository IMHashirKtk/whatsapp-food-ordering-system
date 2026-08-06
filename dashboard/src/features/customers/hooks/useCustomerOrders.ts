import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { customerService } from "../services/customer.service";
import type { GetCustomerOrdersParams } from "../types";

export function useCustomerOrders(
  id: string | null,
  params?: GetCustomerOrdersParams,
) {
  return useQuery({
    queryKey: queryKeys.customers.orders(id ?? "", params),
    queryFn: () => customerService.getCustomerOrders(id ?? "", params),
    enabled: Boolean(id),
  });
}
