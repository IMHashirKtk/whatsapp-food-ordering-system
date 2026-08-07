"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface OrderCancellationDialogProps {
  open: boolean;
  orderId: string;
  reason: string;
  isSubmitting: boolean;
  onReasonChange: (reason: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function OrderCancellationDialog({
  open,
  orderId,
  reason,
  isSubmitting,
  onReasonChange,
  onCancel,
  onConfirm,
}: OrderCancellationDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, onCancel, open]);

  if (!open) {
    return null;
  }

  const isReasonValid = reason.trim().length >= 3;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="presentation"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        aria-label="Close cancellation dialog"
        className="absolute inset-0 bg-black/60"
        onClick={onCancel}
        disabled={isSubmitting}
      />

      <section
        aria-labelledby={`cancel-order-title-${orderId}`}
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id={`cancel-order-title-${orderId}`}
              className="text-lg font-semibold text-foreground"
            >
              Cancel order
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Cancellation cannot be undone. Enter a reason for the customer
              and order record.
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close cancellation dialog"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X />
          </Button>
        </div>

        <div className="mt-5">
          <label
            htmlFor={`cancellation-reason-${orderId}`}
            className="text-sm font-medium text-foreground"
          >
            Cancellation reason
          </label>
          <textarea
            id={`cancellation-reason-${orderId}`}
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            minLength={3}
            maxLength={500}
            rows={4}
            required
            disabled={isSubmitting}
            autoFocus
            className="mt-2 w-full resize-y rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-foreground outline-none transition focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="For example: Customer requested cancellation"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Minimum 3 characters. {reason.length}/500
          </p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Keep Order
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={!isReasonValid || isSubmitting}
          >
            {isSubmitting ? "Cancelling..." : "Cancel Order"}
          </Button>
        </div>
      </section>
    </div>
  );
}
