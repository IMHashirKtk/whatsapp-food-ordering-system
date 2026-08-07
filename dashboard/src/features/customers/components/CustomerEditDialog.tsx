"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  customerSchema,
  toCustomerFormPayload,
  type CustomerFormPayload,
  type CustomerFormValues,
} from "../schemas/customer.schema";
import type { Customer } from "../types";

interface CustomerEditDialogProps {
  open: boolean;
  customer: Customer | null;
  isSubmitting: boolean;
  serverError?: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CustomerFormPayload) => void;
}

const getDefaultValues = (customer: Customer | null): CustomerFormValues => ({
  name: customer?.name ?? "",
  whatsappId: customer?.whatsappId ?? "",
  email: customer?.email ?? "",
  address: customer?.address ?? "",
});

export function CustomerEditDialog({
  open,
  customer,
  isSubmitting,
  serverError,
  onOpenChange,
  onSubmit,
}: CustomerEditDialogProps) {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: getDefaultValues(customer),
  });

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(customer));
    }
  }, [customer, open, reset]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, onOpenChange, open]);

  if (!open) {
    return null;
  }

  const submit = (values: CustomerFormValues) => {
    const payload: CustomerFormPayload = toCustomerFormPayload(values);
    onSubmit(payload);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto p-4"
      role="presentation"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        aria-label="Close customer edit dialog"
        className="absolute inset-0 bg-black/60"
        onClick={() => onOpenChange(false)}
        disabled={isSubmitting}
      />

      <section
        aria-labelledby="customer-edit-title"
        aria-modal="true"
        className="relative z-10 my-8 w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="customer-edit-title" className="text-lg font-semibold text-foreground">
              Edit customer
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Update the customer details used by your restaurant.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close customer edit dialog"
            title="Close"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            <X />
          </Button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(submit)}>
          <div>
            <label htmlFor="customer-name" className="text-sm font-medium text-foreground">
              Name
            </label>
            <input
              id="customer-name"
              type="text"
              autoFocus
              maxLength={100}
              {...register("name")}
              aria-invalid={Boolean(errors.name)}
              className="mt-2 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/20"
            />
            {errors.name ? (
              <p className="mt-1 text-sm text-destructive" role="alert">{errors.name.message}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="customer-whatsapp" className="text-sm font-medium text-foreground">
              WhatsApp number
            </label>
            <input
              id="customer-whatsapp"
              type="tel"
              maxLength={20}
              {...register("whatsappId")}
              aria-invalid={Boolean(errors.whatsappId)}
              className="mt-2 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/20"
            />
            {errors.whatsappId ? (
              <p className="mt-1 text-sm text-destructive" role="alert">
                {errors.whatsappId.message}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="customer-email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="customer-email"
              type="email"
              maxLength={254}
              {...register("email")}
              aria-invalid={Boolean(errors.email)}
              className="mt-2 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/20"
            />
            {errors.email ? (
              <p className="mt-1 text-sm text-destructive" role="alert">{errors.email.message}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="customer-address" className="text-sm font-medium text-foreground">
              Saved address
            </label>
            <textarea
              id="customer-address"
              rows={3}
              maxLength={500}
              {...register("address")}
              aria-invalid={Boolean(errors.address)}
              className="mt-2 w-full resize-y rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/20"
            />
            {errors.address ? (
              <p className="mt-1 text-sm text-destructive" role="alert">{errors.address.message}</p>
            ) : null}
          </div>

          {serverError ? (
            <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {serverError}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
