import axiosClient from "@/lib/axios";

import { ApiResponse } from "@/types/api";

import {
  GetOrdersParams,
  Order,
  OrdersPagination,
  UpdatePaymentStatusRequest,
  UpdateOrderStatusRequest,
} from "../types";

interface OrdersListApiResponse {
  success: boolean;
  message?: string;
  data: Order[];
  pagination: OrdersPagination;
}

export interface OrdersListResult {
  orders: Order[];
  pagination: OrdersPagination;
}

export const orderService = {
  async getOrders(params?: GetOrdersParams): Promise<OrdersListResult> {
    const requestParams: GetOrdersParams | undefined = params
      ? {
          ...params,
          search: params.search?.trim() || undefined,
        }
      : undefined;

    const { data } = await axiosClient.get<OrdersListApiResponse>("/orders", {
      params: requestParams,
    });

    return {
      orders: data.data,
      pagination: data.pagination,
    };
  },

  async getOrder(id: string): Promise<Order> {
    const { data } = await axiosClient.get<ApiResponse<Order>>(`/orders/${id}`);

    return data.data;
  },

  async updateStatus(
    id: string,
    payload: UpdateOrderStatusRequest,
  ): Promise<Order> {
    const { data } = await axiosClient.patch<ApiResponse<Order>>(
      `/orders/${id}/status`,
      payload,
    );

    return data.data;
  },

  async updatePaymentStatus(
    id: string,
    payload: UpdatePaymentStatusRequest,
  ): Promise<Order> {
    const { data } = await axiosClient.patch<ApiResponse<Order>>(
      `/orders/${id}/payment-status`,
      payload,
    );

    return data.data;
  },
};
