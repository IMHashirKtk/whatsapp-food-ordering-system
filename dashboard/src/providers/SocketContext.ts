"use client";

import { createContext } from "react";

import type { FoodajiSocket } from "@/lib/socket";

export interface SocketContextValue {
  socket: FoodajiSocket | null;
  isConnected: boolean;
  connectionError: Error | null;
  isSoundMuted: boolean;
  setSoundMuted: (isMuted: boolean) => void;
  toggleSoundMuted: () => void;
}

export const SocketContext = createContext<
  SocketContextValue | undefined
>(undefined);
