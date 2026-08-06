import { io, type Socket } from "socket.io-client";

import { env } from "@/config/env";
import { TOKEN_KEY } from "@/lib/constants";

import type { OrderStatus } from "@/features/orders/types";

export interface OrderRealtimeEvent {
  eventId: string;
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  occurredAt: string;
  updatedAt?: string;
  customerName?: string | null;
  customerWhatsappId?: string | null;
  total?: number | string | null;
}

interface ServerToClientEvents {
  "order:created": (payload: OrderRealtimeEvent) => void;
  "order:updated": (payload: OrderRealtimeEvent) => void;
}

type ClientToServerEvents = Record<string, never>;

export type FoodajiSocket = Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;

export function createSocketClient(): FoodajiSocket | null {
  if (typeof window === "undefined") {
    return null;
  }

  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    return null;
  }

  return io(env.SOCKET_URL, {
    autoConnect: false,
    auth: {
      token,
    },
    transports: ["polling", "websocket"],
  }) as FoodajiSocket;
}
