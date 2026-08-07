"use client";

import { useEffect, useState } from "react";

import { authService } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { TOKEN_KEY } from "@/lib/constants";

type Props = {
  children: React.ReactNode;
};

export default function AuthProvider({ children }: Props) {
  const { setAccessToken, setUser, logout } = useAuthStore();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);

        if (!token) {
          setLoading(false);
          return;
        }

        setAccessToken(token);

        const user = await authService.me();

        setUser(user);
      } catch (error) {
        logout();

        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [logout, setAccessToken, setUser]);

  if (loading) {
    return null;
  }

  return children;
}
