import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { analyticsService } from "../services/analytics.service";
import type { AnalyticsTrendsParams } from "../types";

export function useAnalyticsTrends(
  params: AnalyticsTrendsParams,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.analytics.trends(params),
    queryFn: () => analyticsService.getTrends(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}
