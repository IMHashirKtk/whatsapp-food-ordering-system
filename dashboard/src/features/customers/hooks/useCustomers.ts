import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { customerService } from "../services/customer.service";
import type { GetCustomersParams } from "../types";

export function useCustomers(params?: GetCustomersParams) {
  return useQuery({
    queryKey: queryKeys.customers.list(params),
    queryFn: () => customerService.getCustomers(params),
  });
}
