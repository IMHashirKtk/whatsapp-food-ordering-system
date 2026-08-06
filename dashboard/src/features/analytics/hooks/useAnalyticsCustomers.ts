import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { analyticsService } from "../services/analytics.service";
import type { AnalyticsCustomersParams } from "../types";

export function useAnalyticsCustomers(
  params?: AnalyticsCustomersParams,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.analytics.customers(params),
    queryFn: () => analyticsService.getCustomers(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}
