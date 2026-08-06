import type { OrderStatus } from "../types";

interface OrderStatusAction {
  label: string;
  nextStatus: OrderStatus | null;
}

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export const CANCELLABLE_ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "ACCEPTED",
];

const orderStatusActions: Record<OrderStatus, OrderStatusAction> = {
  PENDING: {
    label: "Accept Order",
    nextStatus: "ACCEPTED",
  },
  ACCEPTED: {
    label: "Start Preparing",
    nextStatus: "PREPARING",
  },
  PREPARING: {
    label: "Mark Ready",
    nextStatus: "READY",
  },
  READY: {
    label: "Out for Delivery",
    nextStatus: "OUT_FOR_DELIVERY",
  },
  OUT_FOR_DELIVERY: {
    label: "Mark Delivered",
    nextStatus: "DELIVERED",
  },
  DELIVERED: {
    label: "Completed",
    nextStatus: null,
  },
  CANCELLED: {
    label: "Cancelled",
    nextStatus: null,
  },
};

export function getNextOrderStatus(status: OrderStatus): OrderStatus | null {
  return orderStatusActions[status].nextStatus;
}

export function getOrderStatusAction(
  status: OrderStatus,
): OrderStatusAction {
  return orderStatusActions[status];
}

export function canTransitionOrderStatus(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
): boolean {
  return getNextOrderStatus(currentStatus) === nextStatus;
}

export function canCancelOrderStatus(status: OrderStatus): boolean {
  return CANCELLABLE_ORDER_STATUSES.includes(status);
}
