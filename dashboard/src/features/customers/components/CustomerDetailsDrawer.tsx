"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { MapPin, Pencil, Phone, Trash2, X } from "lucide-react";

import ErrorState from "@/components/shared/ErrorState";
import Loading from "@/components/shared/Loading";
import { Button } from "@/components/ui/button";

import { useCustomer } from "../hooks/useCustomer";
import type { Customer } from "../types";
import {
  formatCustomerCurrency,
  formatCustomerDate,
} from "../utils/customerFormatters";
import { CustomerOrderHistory } from "./CustomerOrderHistory";
import { CustomerSummaryCards } from "./CustomerSummaryCards";

interface CustomerDetailsDrawerProps {
  customerId: string | null;
  open: boolean;
  canDelete: boolean;
  onOpenChange: (open: boolean) => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customer: Customer) => void;
  onOrderClick: (orderId: string) => void;
}

interface DetailRowProps {
  label: string;
  value: ReactNode;
}

const displayValue = (value: string | null) => value?.trim() || "Not provided";

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="grid gap-1 border-b border-border py-3 last:border-b-0 sm:grid-cols-[140px_1fr] sm:gap-4">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm text-foreground">{value}</dd>
    </div>
  );
}

export function CustomerDetailsDrawer({
  customerId,
  open,
  canDelete,
  onOpenChange,
  onEditCustomer,
  onDeleteCustomer,
  onOrderClick,
}: CustomerDetailsDrawerProps) {
  const { data, isError, isLoading } = useCustomer(customerId);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    closeButtonRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onOpenChange, open]);

  if (!open) {
    return null;
  }

  const customer = data?.customer;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close customer details"
        className="absolute inset-0 bg-black/60"
        onClick={() => onOpenChange(false)}
      />
      <aside
        aria-labelledby="customer-details-title"
        aria-modal="true"
        role="dialog"
        className="absolute right-0 top-0 flex h-full w-full max-w-3xl flex-col border-l border-border bg-card shadow-xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">Customer details</p>
            <h2
              id="customer-details-title"
              className="mt-1 break-words text-xl font-semibold text-foreground"
            >
              {customer?.name?.trim() || "Selected customer"}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {customer ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Edit customer"
                  title="Edit customer"
                  onClick={() => onEditCustomer(customer)}
                >
                  <Pencil />
                </Button>
                {canDelete ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete customer"
                    title="Delete customer"
                    className="text-destructive hover:text-destructive/80"
                    onClick={() => onDeleteCustomer(customer)}
                  >
                    <Trash2 />
                  </Button>
                ) : null}
              </>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              ref={closeButtonRef}
              aria-label="Close customer details"
              title="Close"
              onClick={() => onOpenChange(false)}
            >
              <X />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {isLoading ? <Loading /> : null}
          {isError ? (
            <ErrorState
              title="Unable to load customer"
              description="Please close the drawer and try again."
            />
          ) : null}
          {!isLoading && !isError && data && customer ? (
            <div className="space-y-7">
              <section aria-labelledby="customer-contact-title">
                <h3
                  id="customer-contact-title"
                  className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Contact and account
                </h3>
                <dl className="mt-3 rounded-lg border border-border p-4">
                  <DetailRow label="Name" value={displayValue(customer.name)} />
                  <DetailRow
                    label="WhatsApp number"
                    value={
                      <span className="inline-flex items-center gap-2 break-all">
                        <Phone className="size-4 shrink-0 text-muted-foreground" />
                        {customer.whatsappId}
                      </span>
                    }
                  />
                  <DetailRow label="Email" value={displayValue(customer.email)} />
                  <DetailRow
                    label="Saved address"
                    value={
                      <span className="inline-flex items-start gap-2">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <span>{displayValue(customer.address)}</span>
                      </span>
                    }
                  />
                  <DetailRow
                    label="Created"
                    value={formatCustomerDate(customer.createdAt)}
                  />
                  <DetailRow
                    label="Last order"
                    value={formatCustomerDate(customer.lastOrderAt)}
                  />
                  <DetailRow
                    label="Lifetime spend"
                    value={formatCustomerCurrency(customer.lifetimeSpend)}
                  />
                  <DetailRow label="Total orders" value={customer.totalOrders} />
                </dl>
              </section>

              <CustomerSummaryCards summary={data.summary} />

              <CustomerOrderHistory
                customerId={customer.id}
                onOrderClick={onOrderClick}
              />
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
