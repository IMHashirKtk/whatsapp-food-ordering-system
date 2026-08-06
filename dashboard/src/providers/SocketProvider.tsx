"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { queryKeys } from "@/config/queryKeys";
import {
  MAX_PROCESSED_ORDER_EVENTS,
} from "@/lib/constants";
import {
  createSocketClient,
  type FoodajiSocket,
  type OrderRealtimeEvent,
} from "@/lib/socket";
import {
  persistOrderSoundMuted,
  playOrderNotificationSound,
  readOrderSoundMuted,
  unlockOrderNotificationSound,
} from "@/lib/orderNotificationSound";
import { useAuthStore } from "@/store/auth.store";
import { SocketContext } from "./SocketContext";

interface SocketProviderProps {
  children: ReactNode;
}

const ACTIVE_QUERY_REFETCH = {
  refetchType: "active" as const,
};

const logRealtimeEvent = (...args: unknown[]) => {
  if (process.env.NODE_ENV === "development") {
    console.debug("[Realtime]", ...args);
  }
};

const formatOrderTotal = (total: number | string | null | undefined) => {
  if (total === null || total === undefined) {
    return null;
  }

  const numericTotal = Number(total);

  if (!Number.isFinite(numericTotal)) {
    return `PKR ${total}`;
  }

  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericTotal);
};

export default function SocketProvider({
  children,
}: SocketProviderProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [socket, setSocket] = useState<FoodajiSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const isSoundMutedRef = useRef(isSoundMuted);
  const processedEventIdsRef = useRef<Set<string>>(new Set());
  const processedEventQueueRef = useRef<string[]>([]);

  const setSoundMuted = (nextIsMuted: boolean) => {
    isSoundMutedRef.current = nextIsMuted;
    setIsSoundMuted(nextIsMuted);
    persistOrderSoundMuted(nextIsMuted);

    if (!nextIsMuted) {
      void unlockOrderNotificationSound();
    }
  };

  const toggleSoundMuted = () => {
    setSoundMuted(!isSoundMutedRef.current);
  };

  useEffect(() => {
    const storedMutePreference = readOrderSoundMuted();

    isSoundMutedRef.current = storedMutePreference;
    setIsSoundMuted(storedMutePreference);
  }, []);

  useEffect(() => {
    if (!accessToken) {
      setSocket(null);
      setIsConnected(false);
      setConnectionError(null);
      return;
    }

    const nextSocket = createSocketClient();

    if (!nextSocket) {
      return;
    }

    const invalidateOrderQueries = () => {
      logRealtimeEvent("invalidating orders queries");
      return queryClient.invalidateQueries({
        queryKey: queryKeys.orders.all,
        ...ACTIVE_QUERY_REFETCH,
      });
    };

    const invalidateDashboardQuery = () => {
      logRealtimeEvent("invalidating dashboard query");
      return queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard,
        ...ACTIVE_QUERY_REFETCH,
      });
    };

    const invalidateOrderAndDashboardQueries = () => {
      return Promise.all([
        invalidateOrderQueries(),
        invalidateDashboardQuery(),
      ]);
    };

    const handleConnect = () => {
      setIsConnected(true);
      setConnectionError(null);
      logRealtimeEvent("connected");
    };

    const handleDisconnect = (reason: string) => {
      setIsConnected(false);
      logRealtimeEvent("disconnected", reason);
    };

    const handleConnectError = (error: Error) => {
      setIsConnected(false);
      setConnectionError(error);
      console.error("[Realtime] Socket connection error.", error);
    };

    const handleReconnect = () => {
      logRealtimeEvent("reconnected");
      void invalidateOrderAndDashboardQueries();
    };

    const handleOrderCreated = (event: OrderRealtimeEvent) => {
      if (processedEventIdsRef.current.has(event.eventId)) {
        logRealtimeEvent("ignored duplicate order:created", event.eventId);
        return;
      }

      processedEventIdsRef.current.add(event.eventId);
      processedEventQueueRef.current.push(event.eventId);

      if (
        processedEventQueueRef.current.length >
        MAX_PROCESSED_ORDER_EVENTS
      ) {
        const oldestEventId = processedEventQueueRef.current.shift();

        if (oldestEventId) {
          processedEventIdsRef.current.delete(oldestEventId);
        }
      }

      logRealtimeEvent("order:created", event);
      void invalidateOrderAndDashboardQueries();

      const description = [
        `Order #${event.orderNumber}`,
        event.customerName?.trim()
          ? `Customer: ${event.customerName.trim()}`
          : null,
        event.total !== null && event.total !== undefined
          ? `Total: ${formatOrderTotal(event.total)}`
          : null,
      ]
        .filter(Boolean)
        .join(" · ");

      toast("New order received", {
        description,
        action: {
          label: "View order",
          onClick: () => {
            router.push(
              `/dashboard/orders?orderId=${encodeURIComponent(event.orderId)}`,
            );
          },
        },
      });

      if (!isSoundMutedRef.current) {
        void playOrderNotificationSound();
      }
    };

    const handleOrderUpdated = (event: OrderRealtimeEvent) => {
      logRealtimeEvent("order:updated", event);
      logRealtimeEvent("invalidating order detail query", event.orderId);
      void Promise.all([
        invalidateOrderQueries(),
        queryClient.invalidateQueries({
          queryKey: queryKeys.orders.detail(event.orderId),
          ...ACTIVE_QUERY_REFETCH,
        }),
        invalidateDashboardQuery(),
      ]);
    };

    nextSocket.on("connect", handleConnect);
    nextSocket.on("disconnect", handleDisconnect);
    nextSocket.on("connect_error", handleConnectError);
    nextSocket.io.on("reconnect", handleReconnect);
    nextSocket.on("order:created", handleOrderCreated);
    nextSocket.on("order:updated", handleOrderUpdated);

    setSocket(nextSocket);
    nextSocket.connect();

    return () => {
      nextSocket.off("connect", handleConnect);
      nextSocket.off("disconnect", handleDisconnect);
      nextSocket.off("connect_error", handleConnectError);
      nextSocket.io.off("reconnect", handleReconnect);
      nextSocket.off("order:created", handleOrderCreated);
      nextSocket.off("order:updated", handleOrderUpdated);
      nextSocket.disconnect();

      setSocket((currentSocket) =>
        currentSocket === nextSocket ? null : currentSocket,
      );
      setIsConnected(false);
    };
  }, [accessToken, queryClient, router]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        connectionError,
        isSoundMuted,
        setSoundMuted,
        toggleSoundMuted,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
