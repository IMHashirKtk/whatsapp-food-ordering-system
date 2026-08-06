import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { analyticsService } from "../services/analytics.service";
import type { AnalyticsDateRangeParams } from "../types";

export function useAnalyticsOperations(
  params?: AnalyticsDateRangeParams,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.analytics.operations(params),
    queryFn: () => analyticsService.getOperations(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}
