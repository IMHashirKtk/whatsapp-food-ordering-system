import axiosClient from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

import type {
  AnalyticsCustomers,
  AnalyticsCustomersParams,
  AnalyticsDateRangeParams,
  AnalyticsOperations,
  AnalyticsOverview,
  AnalyticsProducts,
  AnalyticsProductsParams,
  AnalyticsTrend,
  AnalyticsTrendsParams,
} from "../types";

const normalizeParams = (params?: object) => {
  if (!params) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== ""),
  );
};

export const analyticsService = {
  async getOverview(params?: AnalyticsDateRangeParams): Promise<AnalyticsOverview> {
    const { data } = await axiosClient.get<ApiResponse<AnalyticsOverview>>(
      "/analytics/overview",
      { params: normalizeParams(params) },
    );

    return data.data;
  },

  async getTrends(params: AnalyticsTrendsParams): Promise<AnalyticsTrend[]> {
    const { data } = await axiosClient.get<ApiResponse<AnalyticsTrend[]>>(
      "/analytics/trends",
      { params: normalizeParams(params) },
    );

    return data.data;
  },

  async getProducts(
    params?: AnalyticsProductsParams,
  ): Promise<AnalyticsProducts> {
    const { data } = await axiosClient.get<ApiResponse<AnalyticsProducts>>(
      "/analytics/products",
      { params: normalizeParams(params) },
    );

    return data.data;
  },

  async getOperations(
    params?: AnalyticsDateRangeParams,
  ): Promise<AnalyticsOperations> {
    const { data } = await axiosClient.get<ApiResponse<AnalyticsOperations>>(
      "/analytics/operations",
      { params: normalizeParams(params) },
    );

    return data.data;
  },

  async getCustomers(
    params?: AnalyticsCustomersParams,
  ): Promise<AnalyticsCustomers> {
    const { data } = await axiosClient.get<ApiResponse<AnalyticsCustomers>>(
      "/analytics/customers",
      { params: normalizeParams(params) },
    );

    return data.data;
  },
};
