import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { dashboardService } from "../services/dashboard.service";

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,

    queryFn: dashboardService.getSummary,
  });
}