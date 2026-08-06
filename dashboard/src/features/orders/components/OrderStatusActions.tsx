"use client";

import { toast } from "sonner";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useUpdateOrderStatus } from "../hooks/useUpdateOrderStatus";
import type { OrderStatus } from "../types";
import {
  canTransitionOrderStatus,
  canCancelOrderStatus,
  getOrderStatusAction,
  getNextOrderStatus,
} from "../utils/orderStatusTransitions";
import { OrderCancellationDialog } from "./OrderCancellationDialog";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrderStatusActionsProps {
  orderId: string;
  currentStatus: OrderStatus;
  className?: string;
  variant?: "compact" | "drawer";
}

export function OrderStatusActions({
  orderId,
  currentStatus,
  className,
  variant = "compact",
}: OrderStatusActionsProps) {
  const updateOrderStatus = useUpdateOrderStatus();
  const action = getOrderStatusAction(currentStatus);
  const nextStatus = getNextOrderStatus(currentStatus);
  const canUpdate =
    nextStatus !== null && canTransitionOrderStatus(currentStatus, nextStatus);
  const canCancel = canCancelOrderStatus(currentStatus);
  const isUpdating = updateOrderStatus.isPending;
  const [isCancellationDialogOpen, setIsCancellationDialogOpen] =
    useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  const handleUpdate = async () => {
    if (!canUpdate || !nextStatus) {
      return;
    }

    try {
      await updateOrderStatus.mutateAsync({
        id: orderId,
        payload: {
          status: nextStatus,
        },
      });

      toast.success("Order status updated.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to update order status.";

      toast.error(message);
    }
  };

  const handleCancel = async () => {
    const normalizedReason = cancellationReason.trim();

    if (!canCancel || normalizedReason.length < 3) {
      return;
    }

    try {
      await updateOrderStatus.mutateAsync({
        id: orderId,
        payload: {
          status: "CANCELLED",
          cancellationReason: normalizedReason,
        },
      });

      toast.success("Order cancelled.");
      setCancellationReason("");
      setIsCancellationDialogOpen(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to cancel order.";

      toast.error(message);
    }
  };

  if (currentStatus === "CANCELLED") {
    if (variant === "compact") {
      return null;
    }

    return (
      <div
        className={cn(
          "flex flex-col rounded-lg border border-gray-200 p-4",
          className,
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-gray-500">
            Current status
          </span>
          <OrderStatusBadge status={currentStatus} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-2",
        variant === "drawer"
          ? "flex-col rounded-lg border border-gray-200 p-4"
          : "items-center",
        className,
      )}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      {variant === "drawer" ? (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-gray-500">
            Current status
          </span>
          <OrderStatusBadge status={currentStatus} />
        </div>
      ) : null}

      <div
        className={cn(
          "flex gap-2",
          variant === "drawer" ? "flex-col sm:flex-row" : "items-center",
        )}
      >
        <Button
          type="button"
          size={variant === "compact" ? "sm" : "default"}
          variant={canUpdate ? "default" : "secondary"}
          disabled={!canUpdate || isUpdating}
          onClick={handleUpdate}
          className={variant === "drawer" ? "w-full sm:w-auto" : undefined}
        >
          {isUpdating ? "Updating..." : action.label}
        </Button>

        {canCancel ? (
          <Button
            type="button"
            size={variant === "compact" ? "sm" : "default"}
            variant="destructive"
            disabled={isUpdating}
            onClick={() => setIsCancellationDialogOpen(true)}
            className={variant === "drawer" ? "w-full sm:w-auto" : undefined}
          >
            Cancel Order
          </Button>
        ) : null}
      </div>

      <OrderCancellationDialog
        open={isCancellationDialogOpen}
        orderId={orderId}
        reason={cancellationReason}
        isSubmitting={isUpdating}
        onReasonChange={setCancellationReason}
        onCancel={() => {
          if (!isUpdating) {
            setIsCancellationDialogOpen(false);
          }
        }}
        onConfirm={handleCancel}
      />
    </div>
  );
}
