import { create } from "zustand";

import { AuthUser } from "@/features/auth/types";
import { TOKEN_KEY } from "@/lib/constants";

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;

  isAuthenticated: boolean;

  setAccessToken: (token: string | null) => void;

  setUser: (user: AuthUser | null) => void;

  login: (token: string, user: AuthUser) => void;

  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,

  user: null,

  isAuthenticated: false,

  setAccessToken: (token) =>
    set({
      accessToken: token,
      isAuthenticated: !!token,
    }),

  setUser: (user) =>
    set({
      user,
    }),

  login: (token, user) =>
    set({
      accessToken: token,
      user,
      isAuthenticated: true,
    }),

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
    }

    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
    });
  },
}));
