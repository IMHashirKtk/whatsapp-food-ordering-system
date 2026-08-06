import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { analyticsService } from "../services/analytics.service";
import type { AnalyticsDateRangeParams } from "../types";

export function useAnalyticsOverview(
  params?: AnalyticsDateRangeParams,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.analytics.overview(params),
    queryFn: () => analyticsService.getOverview(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}
