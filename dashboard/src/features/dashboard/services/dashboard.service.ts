import axiosClient from "@/lib/axios";

import { ApiResponse } from "@/types/api";
import { DashboardSummary } from "../types";

const toNumber = (value: number | string | null | undefined) => {
  const normalized = Number(value ?? 0);

  return Number.isFinite(normalized) ? normalized : 0;
};

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const { data } = await axiosClient.get<ApiResponse<DashboardSummary>>(
      "/dashboard/summary"
    );

    return {
      ...data.data,
      today: {
        ...data.data.today,
        grossOrderValue: toNumber(data.data.today.grossOrderValue),
        recognizedRevenue: toNumber(data.data.today.recognizedRevenue),
        averageOrderValue: toNumber(data.data.today.averageOrderValue),
      },
      recentOrders: data.data.recentOrders.map((order) => ({
        ...order,
        total: toNumber(order.total),
      })),
    };
  },
};
