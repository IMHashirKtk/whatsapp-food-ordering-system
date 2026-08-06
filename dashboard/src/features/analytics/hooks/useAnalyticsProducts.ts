import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { analyticsService } from "../services/analytics.service";
import type { AnalyticsProductsParams } from "../types";

export function useAnalyticsProducts(
  params?: AnalyticsProductsParams,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.analytics.products(params),
    queryFn: () => analyticsService.getProducts(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}
