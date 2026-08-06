"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import ConfirmDialog from "@/components/shared/ConfirmDialog";
import ErrorState from "@/components/shared/ErrorState";
import Loading from "@/components/shared/Loading";
import PageHeader from "@/components/shared/PageHeader";
import { useAuthStore } from "@/store/auth.store";

import { CustomerDetailsDrawer } from "@/features/customers/components/CustomerDetailsDrawer";
import { CustomerEditDialog } from "@/features/customers/components/CustomerEditDialog";
import { CustomerFilters } from "@/features/customers/components/CustomerFilters";
import { CustomersTable } from "@/features/customers/components/CustomersTable";
import { useCustomers } from "@/features/customers/hooks/useCustomers";
import { useDeleteCustomer } from "@/features/customers/hooks/useDeleteCustomer";
import { useUpdateCustomer } from "@/features/customers/hooks/useUpdateCustomer";
import {
  getCustomerErrorMessage,
} from "@/features/customers/services/customer.service";
import type { Customer } from "@/features/customers/types";
import type { CustomerFormPayload } from "@/features/customers/schemas/customer.schema";

const DEFAULT_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 400;

export default function CustomersPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CustomersPageContent />
    </Suspense>
  );
}

function CustomersPageContent() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const canDelete = user?.role === "OWNER";
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] =
    useState<Customer | null>(null);

  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchValue(searchValue.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [searchValue]);

  const params = useMemo(
    () => ({
      page,
      limit: DEFAULT_LIMIT,
      search: debouncedSearchValue || undefined,
    }),
    [debouncedSearchValue, page],
  );
  const customersQuery = useCustomers(params);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  useEffect(() => {
    if (!customersQuery.data) {
      return;
    }

    const totalPages = Math.max(customersQuery.data.pagination.totalPages, 1);

    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [customersQuery.data, page]);

  const handleEditCustomer = (customer: Customer) => {
    updateCustomer.reset();
    setCustomerToEdit(customer);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    deleteCustomer.reset();
    setCustomerToDelete(customer);
  };

  const handleUpdateCustomer = (payload: CustomerFormPayload) => {
    if (!customerToEdit) {
      return;
    }

    updateCustomer.mutate(
      { id: customerToEdit.id, payload },
      {
        onSuccess: () => {
          toast.success("Customer updated successfully.");
          setCustomerToEdit(null);
        },
        onError: (error) => {
          toast.error(
            getCustomerErrorMessage(error, "Unable to update customer."),
          );
        },
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!customerToDelete) {
      return;
    }

    deleteCustomer.mutate(customerToDelete.id, {
      onSuccess: () => {
        toast.success("Customer deleted successfully.");
        if (selectedCustomerId === customerToDelete.id) {
          setSelectedCustomerId(null);
        }
        setCustomerToDelete(null);
      },
      onError: (error) => {
        toast.error(
          getCustomerErrorMessage(error, "Unable to delete customer."),
        );
      },
    });
  };

  const handleOrderClick = (orderId: string) => {
    setSelectedCustomerId(null);
    router.push(`/dashboard/orders?orderId=${encodeURIComponent(orderId)}`);
  };

  if (customersQuery.isLoading) {
    return <Loading />;
  }

  if (customersQuery.isError || !customersQuery.data) {
    return (
      <ErrorState
        title="Unable to load customers"
        description="The customer list could not be loaded. Please refresh and try again."
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Customers"
        description="Review customer activity, saved details, and order history."
      />

      <CustomerFilters
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
      />

      <div className="mt-6">
        <CustomersTable
          customers={customersQuery.data.customers}
          pagination={customersQuery.data.pagination}
          searchActive={Boolean(debouncedSearchValue)}
          canDelete={canDelete}
          onCustomerClick={setSelectedCustomerId}
          onEditCustomer={handleEditCustomer}
          onDeleteCustomer={handleDeleteCustomer}
          onPageChange={setPage}
        />
      </div>

      <CustomerDetailsDrawer
        customerId={selectedCustomerId}
        open={Boolean(selectedCustomerId)}
        canDelete={canDelete}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCustomerId(null);
          }
        }}
        onEditCustomer={handleEditCustomer}
        onDeleteCustomer={handleDeleteCustomer}
        onOrderClick={handleOrderClick}
      />

      <CustomerEditDialog
        open={Boolean(customerToEdit)}
        customer={customerToEdit}
        isSubmitting={updateCustomer.isPending}
        serverError={
          updateCustomer.isError
            ? getCustomerErrorMessage(
                updateCustomer.error,
                "Unable to update customer.",
              )
            : null
        }
        onOpenChange={(open) => {
          if (!open) {
            setCustomerToEdit(null);
          }
        }}
        onSubmit={handleUpdateCustomer}
      />

      <ConfirmDialog
        open={Boolean(customerToDelete)}
        title="Delete customer?"
        description={`This permanently deletes ${customerToDelete?.name?.trim() || "this customer"} and cascades to related orders, messages, cart data, and conversation data. This action cannot be undone.`}
        confirmLabel="Delete customer"
        isConfirming={deleteCustomer.isPending}
        variant="destructive"
        onConfirm={handleConfirmDelete}
        onCancel={() => setCustomerToDelete(null)}
      />

    </>
  );
}
