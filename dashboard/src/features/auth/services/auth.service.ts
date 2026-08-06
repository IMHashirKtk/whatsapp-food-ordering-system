import axiosClient from "@/lib/axios";

import { ApiResponse } from "@/types/api";

import {
  AuthUser,
  LoginRequest,
  LoginResponse,
} from "../types";

export const authService = {
  async login(
    payload: LoginRequest
  ): Promise<LoginResponse> {
    const { data } = await axiosClient.post<
      ApiResponse<LoginResponse>
    >("/auth/login", payload);

    return data.data;
  },

  async me(): Promise<AuthUser> {
    const { data } = await axiosClient.get<
      ApiResponse<AuthUser>
    >("/auth/me");

    return data.data;
  },
};