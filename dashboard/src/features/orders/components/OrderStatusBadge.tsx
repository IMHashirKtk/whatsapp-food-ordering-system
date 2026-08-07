import { StatusBadge, type StatusTone } from "@/components/shared/StatusBadge";
import type { OrderStatus } from "../types";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
  tone?: StatusTone;
}

const statusStyles: Record<OrderStatus, StatusTone> = {
  PENDING: "neutral",
  ACCEPTED: "info",
  PREPARING: "warning",
  READY: "success",
  OUT_FOR_DELIVERY: "info",
  DELIVERED: "success",
  CANCELLED: "danger",
};

export function OrderStatusBadge({
  status,
  className,
  tone,
}: OrderStatusBadgeProps) {
  const resolvedTone = tone ?? statusStyles[status];

  return (
    <StatusBadge tone={resolvedTone} className={className}>
      {status
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())}
    </StatusBadge>
  );
}
