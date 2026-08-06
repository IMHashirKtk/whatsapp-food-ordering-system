import axiosClient from "@/lib/axios";

import { ApiResponse } from "@/types/api";
import { DashboardSummary } from "../types";

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const { data } = await axiosClient.get<ApiResponse<DashboardSummary>>(
      "/dashboard/summary"
    );

    return data.data;
  },
};