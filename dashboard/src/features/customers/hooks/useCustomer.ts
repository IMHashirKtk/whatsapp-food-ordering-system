import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { customerService } from "../services/customer.service";
import type { CustomerDetail } from "../types";

export function useCustomer(id: string | null) {
  return useQuery<CustomerDetail>({
    queryKey: queryKeys.customers.detail(id ?? ""),
    queryFn: () => customerService.getCustomer(id ?? ""),
    enabled: Boolean(id),
  });
}
