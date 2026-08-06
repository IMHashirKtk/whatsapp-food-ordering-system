import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { OrderStatus } from "../types";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize",
  {
    variants: {
      tone: {
        default: "border-gray-200 bg-gray-50 text-gray-700",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700",
        info: "border-sky-200 bg-sky-50 text-sky-700",
        warning: "border-amber-200 bg-amber-50 text-amber-700",
        danger: "border-rose-200 bg-rose-50 text-rose-700",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  },
);

interface OrderStatusBadgeProps extends VariantProps<
  typeof statusBadgeVariants
> {
  status: OrderStatus;
  className?: string;
}

const statusStyles: Record<
  OrderStatus,
  VariantProps<typeof statusBadgeVariants>["tone"]
> = {
  PENDING: "default",
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
    <span
      className={cn(statusBadgeVariants({ tone: resolvedTone }), className)}
    >
      {status.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}
