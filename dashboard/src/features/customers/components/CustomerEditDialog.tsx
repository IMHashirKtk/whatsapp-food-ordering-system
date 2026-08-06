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
        className="absolute inset-0 bg-slate-950/40"
        onClick={() => onOpenChange(false)}
        disabled={isSubmitting}
      />

      <section
        aria-labelledby="customer-edit-title"
        aria-modal="true"
        className="relative z-10 my-8 w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="customer-edit-title" className="text-lg font-semibold text-slate-900">
              Edit customer
            </h2>
            <p className="mt-1 text-sm text-slate-500">
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
            <label htmlFor="customer-name" className="text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              id="customer-name"
              type="text"
              autoFocus
              maxLength={100}
              {...register("name")}
              aria-invalid={Boolean(errors.name)}
              className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
            />
            {errors.name ? (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="customer-whatsapp" className="text-sm font-medium text-slate-700">
              WhatsApp number
            </label>
            <input
              id="customer-whatsapp"
              type="tel"
              maxLength={20}
              {...register("whatsappId")}
              aria-invalid={Boolean(errors.whatsappId)}
              className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
            />
            {errors.whatsappId ? (
              <p className="mt-1 text-sm text-red-600">
                {errors.whatsappId.message}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="customer-email" className="text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="customer-email"
              type="email"
              maxLength={254}
              {...register("email")}
              aria-invalid={Boolean(errors.email)}
              className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
            />
            {errors.email ? (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="customer-address" className="text-sm font-medium text-slate-700">
              Saved address
            </label>
            <textarea
              id="customer-address"
              rows={3}
              maxLength={500}
              {...register("address")}
              aria-invalid={Boolean(errors.address)}
              className="mt-2 w-full resize-y rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
            />
            {errors.address ? (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            ) : null}
          </div>

          {serverError ? (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
              {serverError}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
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
