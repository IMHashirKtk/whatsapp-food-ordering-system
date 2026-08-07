import axios from "axios";

import axiosClient from "@/lib/axios";

import { ApiResponse } from "@/types/api";

import {
  AuthUser,
  LoginRequest,
  LoginResponse,
} from "../types";

type AuthErrorResponse = {
  message?: unknown;
};

export const getLoginErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error)) {
    return "Unable to sign in right now. Please try again.";
  }

  if (!error.response) {
    return "Unable to connect to the server. Please check your connection and try again.";
  }

  switch (error.response.status) {
    case 401:
      return "Invalid email or password.";
    case 403: {
      const responseData = error.response.data as AuthErrorResponse | undefined;

      if (responseData?.message === "Account is inactive.") {
        return "Your account is disabled. Please contact an administrator.";
      }

      return "You do not have permission to sign in.";
    }
    case 404:
      return "The login service is unavailable. Please try again later.";
    default:
      if (error.response.status >= 500) {
        return "The server is temporarily unavailable. Please try again later.";
      }

      return "Unable to sign in right now. Please try again.";
  }
};

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
