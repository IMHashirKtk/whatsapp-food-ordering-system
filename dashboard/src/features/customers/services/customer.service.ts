import axios from "axios";

import axiosClient from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

import type {
  Customer,
  CustomerDetail,
  CustomerOrder,
  CustomerPagination,
  CustomersListResult,
  CustomerUpdatePayload,
  GetCustomerOrdersParams,
  GetCustomersParams,
} from "../types";

export interface CustomerOrdersResult {
  orders: CustomerOrder[];
  pagination: CustomerPagination;
}

const normalizeParams = (params?: object) => {
  if (!params) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      typeof value === "string" ? value.trim() || undefined : value,
    ]),
  );
};

export const customerService = {
  async getCustomers(params?: GetCustomersParams): Promise<CustomersListResult> {
    const { data } = await axiosClient.get<PaginatedResponse<Customer>>(
      "/customers",
      { params: normalizeParams(params) },
    );

    return {
      customers: data.data,
      pagination: data.pagination,
    };
  },

  async getCustomer(id: string): Promise<CustomerDetail> {
    const { data } = await axiosClient.get<ApiResponse<CustomerDetail>>(
      `/customers/${id}`,
    );

    return data.data;
  },

  async getCustomerOrders(
    id: string,
    params?: GetCustomerOrdersParams,
  ): Promise<CustomerOrdersResult> {
    const { data } = await axiosClient.get<PaginatedResponse<CustomerOrder>>(
      `/customers/${id}/orders`,
      { params: normalizeParams(params) },
    );

    return {
      orders: data.data,
      pagination: data.pagination,
    };
  },

  async updateCustomer(
    id: string,
    payload: CustomerUpdatePayload,
  ): Promise<Customer> {
    const { data } = await axiosClient.patch<ApiResponse<Customer>>(
      `/customers/${id}`,
      payload,
    );

    return data.data;
  },

  async deleteCustomer(id: string): Promise<void> {
    await axiosClient.delete<ApiResponse<null>>(`/customers/${id}`);
  },
};

export const getCustomerErrorMessage = (
  error: unknown,
  fallback: string,
) => {
  if (axios.isAxiosError(error)) {
    switch (error.response?.status) {
      case 400:
        return "Please review the customer details and try again.";
      case 401:
        return "Your session has expired. Please sign in again.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return "This customer is no longer available.";
      case 409:
        return "A customer with this WhatsApp number already exists.";
      default:
        return fallback;
    }
  }

  return fallback;
};
