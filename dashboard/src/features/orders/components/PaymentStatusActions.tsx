"use client";

import axios from "axios";
import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { useUpdatePaymentStatus } from "../hooks/useUpdatePaymentStatus";
import type { Order } from "../types";

interface PaymentStatusActionsProps {
  order: Order;
}

const getPaymentVerificationErrorMessage = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return "Unable to verify payment. Please try again.";
  }

  if (!error.response) {
    return "Unable to connect to the server. Please try again.";
  }

  if (error.response.status === 404) {
    return "This order could not be found.";
  }

  if (error.response.status === 409) {
    return "This payment was already updated. Refresh the order and try again.";
  }

  if (error.response.status === 403) {
    return "You do not have permission to verify payments.";
  }

  if (error.response.status >= 500) {
    return "The server is temporarily unavailable. Please try again.";
  }

  return "Unable to verify payment. Please check the order and try again.";
};

export function PaymentStatusActions({ order }: PaymentStatusActionsProps) {
  const updatePaymentStatus = useUpdatePaymentStatus();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [note, setNote] = useState("");

  const isPaid = order.paymentStatus === "PAID";
  const isCod = order.paymentMethod === "COD";
  const actionLabel =
    order.paymentStatus === "UNPAID"
      ? "Mark Payment as Paid"
      : "Verify Payment";

  const closeDialog = () => {
    if (!updatePaymentStatus.isPending) {
      setIsDialogOpen(false);
    }
  };

  const handleConfirm = async () => {
    try {
      await updatePaymentStatus.mutateAsync({
        id: order.id,
        payload: {
          paymentStatus: "PAID",
          note: note.trim() || undefined,
        },
      });

      toast.success("Payment marked as paid.");
      setNote("");
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(getPaymentVerificationErrorMessage(error));
    }
  };

  return (
    <>
      <Button
        type="button"
        variant={isPaid ? "secondary" : "default"}
        disabled={isPaid || updatePaymentStatus.isPending}
        onClick={() => setIsDialogOpen(true)}
      >
        {isPaid
          ? "Payment Verified"
          : updatePaymentStatus.isPending
            ? "Verifying..."
            : actionLabel}
      </Button>

      {isDialogOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="presentation"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            aria-label="Close payment verification dialog"
            className="absolute inset-0 bg-black/60"
            onClick={closeDialog}
            disabled={updatePaymentStatus.isPending}
          />

          <section
            aria-labelledby={`verify-payment-title-${order.id}`}
            aria-modal="true"
            className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id={`verify-payment-title-${order.id}`}
                  className="text-lg font-semibold text-foreground"
                >
                  {isCod
                    ? "Confirm cash payment received?"
                    : "Confirm payment has been verified?"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  This will permanently mark the payment as paid for this
                  order.
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Close payment verification dialog"
                onClick={closeDialog}
                disabled={updatePaymentStatus.isPending}
              >
                <X />
              </Button>
            </div>

            <div className="mt-5">
              <label
                htmlFor={`payment-verification-note-${order.id}`}
                className="text-sm font-medium text-foreground"
              >
                Verification note (optional)
              </label>
              <textarea
                id={`payment-verification-note-${order.id}`}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={500}
                rows={4}
                disabled={updatePaymentStatus.isPending}
                className="mt-2 w-full resize-y rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-foreground outline-none transition focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder={
                  isCod
                    ? "For example: Cash collected by rider"
                    : "For example: Transaction matched in account statement"
                }
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {note.length}/500
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={updatePaymentStatus.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={updatePaymentStatus.isPending}
              >
                {updatePaymentStatus.isPending ? "Verifying..." : "Confirm"}
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
