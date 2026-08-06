"use client";

import { Toaster } from "sonner";

import QueryProvider from "./QueryProvider";
import ThemeProvider from "./ThemeProvider";
import AuthProvider from "./AuthProvider";
import SocketProvider from "./SocketProvider";

type Props = {
  children: React.ReactNode;
};

export default function Providers({ children }: Props) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>{children}</SocketProvider>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
