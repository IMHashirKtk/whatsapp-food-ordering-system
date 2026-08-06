import axios from "axios";

import axiosClient from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

import type {
  AISettingsPayload,
  AvailabilityPayload,
  LocalizationPayload,
  MetaSettings,
  MetaSettingsPayload,
  NotificationSettingsPayload,
  OrderConfigPayload,
  PaymentMethodsPayload,
  ProfileSettingsPayload,
  ReceiptSettingsPayload,
  SettingsData,
} from "../types";

export const settingsService = {
  async getSettings(): Promise<SettingsData> {
    const { data } = await axiosClient.get<ApiResponse<SettingsData>>(
      "/settings",
    );

    return data.data;
  },

  async updateProfile(payload: ProfileSettingsPayload): Promise<SettingsData> {
    const { data } = await axiosClient.patch<ApiResponse<SettingsData>>(
      "/settings/profile",
      payload,
    );

    return data.data;
  },

  async updateOrderConfig(payload: OrderConfigPayload): Promise<SettingsData> {
    const { data } = await axiosClient.patch<ApiResponse<SettingsData>>(
      "/settings/order-config",
      payload,
    );

    return data.data;
  },

  async updatePaymentMethods(
    payload: PaymentMethodsPayload,
  ): Promise<SettingsData> {
    const { data } = await axiosClient.patch<ApiResponse<SettingsData>>(
      "/settings/payment-methods",
      payload,
    );

    return data.data;
  },

  async updateAvailability(payload: AvailabilityPayload): Promise<SettingsData> {
    const { data } = await axiosClient.patch<ApiResponse<SettingsData>>(
      "/settings/availability",
      payload,
    );

    return data.data;
  },

  async updateReceipt(payload: ReceiptSettingsPayload): Promise<SettingsData> {
    const { data } = await axiosClient.patch<ApiResponse<SettingsData>>(
      "/settings/receipt",
      payload,
    );

    return data.data;
  },

  async updateNotifications(
    payload: NotificationSettingsPayload,
  ): Promise<SettingsData> {
    const { data } = await axiosClient.patch<ApiResponse<SettingsData>>(
      "/settings/notifications",
      payload,
    );

    return data.data;
  },

  async updateLocalization(payload: LocalizationPayload): Promise<SettingsData> {
    const { data } = await axiosClient.patch<ApiResponse<SettingsData>>(
      "/settings/localization",
      payload,
    );

    return data.data;
  },

  async updateAI(payload: AISettingsPayload): Promise<SettingsData> {
    const { data } = await axiosClient.patch<ApiResponse<SettingsData>>(
      "/settings/ai",
      payload,
    );

    return data.data;
  },

  async updateMeta(payload: MetaSettingsPayload): Promise<MetaSettings> {
    const { data } = await axiosClient.patch<ApiResponse<MetaSettings>>(
      "/settings/meta",
      payload,
    );

    return data.data;
  },
};

export const getSettingsErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | { message?: unknown }
      | undefined;

    if (typeof responseData?.message === "string") {
      return responseData.message;
    }
  }

  return fallback;
};
