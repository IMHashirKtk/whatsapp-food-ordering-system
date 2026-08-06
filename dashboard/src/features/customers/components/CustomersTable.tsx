"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";

import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";

import type { Customer, CustomerPagination } from "../types";
import {
  formatCustomerCurrency,
  formatCustomerDate,
} from "../utils/customerFormatters";

interface CustomersTableProps {
  customers: Customer[];
  pagination: CustomerPagination;
  searchActive: boolean;
  canDelete: boolean;
  onCustomerClick: (customerId: string) => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customer: Customer) => void;
  onPageChange: (page: number) => void;
}

const displayValue = (value: string | null) => value?.trim() || "Not provided";

function CustomerActions({
  customer,
  canDelete,
  onCustomerClick,
  onEditCustomer,
  onDeleteCustomer,
}: Omit<CustomersTableProps, "customers" | "pagination" | "searchActive" | "onPageChange"> & {
  customer: Customer;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`View ${customer.name ?? "customer"}`}
        title="View customer"
        onClick={() => onCustomerClick(customer.id)}
      >
        <Eye />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Edit ${customer.name ?? "customer"}`}
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
          aria-label={`Delete ${customer.name ?? "customer"}`}
          title="Delete customer"
          className="text-rose-600 hover:text-rose-700"
          onClick={() => onDeleteCustomer(customer)}
        >
          <Trash2 />
        </Button>
      ) : null}
    </div>
  );
}

function Pagination({
  pagination,
  onPageChange,
}: Pick<CustomersTableProps, "pagination" | "onPageChange">) {
  const currentPage = pagination.page;
  const totalPages = Math.max(pagination.totalPages, 1);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <span>
        Showing page {currentPage} of {totalPages} · {pagination.total} customers
      </span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export function CustomersTable({
  customers,
  pagination,
  searchActive,
  canDelete,
  onCustomerClick,
  onEditCustomer,
  onDeleteCustomer,
  onPageChange,
}: CustomersTableProps) {
  if (!customers.length) {
    return (
      <EmptyState
        title={searchActive ? "No matching customers" : "No customers yet"}
        description={
          searchActive
            ? "Try a different name, WhatsApp number, or email."
            : "Customers will appear here after they place an order."
        }
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-[920px] w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {[
                "Customer",
                "WhatsApp",
                "Email",
                "Orders",
                "Lifetime spend",
                "Last order",
                "Created",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="align-top transition hover:bg-slate-50"
              >
                <td className="max-w-[13rem] px-4 py-4 text-sm font-medium text-slate-900">
                  <button
                    type="button"
                    className="text-left hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    onClick={() => onCustomerClick(customer.id)}
                  >
                    <span className="block break-words">
                      {displayValue(customer.name)}
                    </span>
                  </button>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                  {customer.whatsappId}
                </td>
                <td className="max-w-[15rem] px-4 py-4 text-sm text-slate-700">
                  <span className="block break-words">
                    {displayValue(customer.email)}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-slate-700">
                  {customer.totalOrders}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-900">
                  {formatCustomerCurrency(customer.lifetimeSpend)}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                  {formatCustomerDate(customer.lastOrderAt)}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                  {formatCustomerDate(customer.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <CustomerActions
                    customer={customer}
                    canDelete={canDelete}
                    onCustomerClick={onCustomerClick}
                    onEditCustomer={onEditCustomer}
                    onDeleteCustomer={onDeleteCustomer}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-200 md:hidden">
        {customers.map((customer) => (
          <article key={customer.id} className="space-y-4 p-4">
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                className="min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                onClick={() => onCustomerClick(customer.id)}
              >
                <h2 className="break-words text-sm font-semibold text-slate-900">
                  {displayValue(customer.name)}
                </h2>
                <p className="mt-1 break-all text-sm text-slate-500">
                  {customer.whatsappId}
                </p>
              </button>
              <CustomerActions
                customer={customer}
                canDelete={canDelete}
                onCustomerClick={onCustomerClick}
                onEditCustomer={onEditCustomer}
                onDeleteCustomer={onDeleteCustomer}
              />
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div className="min-w-0">
                <dt className="text-slate-500">Email</dt>
                <dd className="mt-1 break-words text-slate-800">
                  {displayValue(customer.email)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Orders</dt>
                <dd className="mt-1 text-slate-800">{customer.totalOrders}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Lifetime spend</dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {formatCustomerCurrency(customer.lifetimeSpend)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Last order</dt>
                <dd className="mt-1 break-words text-slate-800">
                  {formatCustomerDate(customer.lastOrderAt)}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <Pagination pagination={pagination} onPageChange={onPageChange} />
    </div>
  );
}
