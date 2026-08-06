import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { customerService } from "../services/customer.service";
import type { Customer, CustomersListResult } from "../types";

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customerService.deleteCustomer(id),
    onSuccess: (_data, customerId) => {
      queryClient.removeQueries({
        queryKey: queryKeys.customers.detail(customerId),
        exact: true,
      });
      queryClient.removeQueries({
        queryKey: ["customers", "orders", customerId],
      });

      queryClient.setQueriesData<CustomersListResult>(
        { queryKey: [...queryKeys.customers.all, "list"] },
        (current) => {
          if (!current) {
            return current;
          }

          const customers = current.customers.filter(
            (customer: Customer) => customer.id !== customerId,
          );
          const wasPresent = customers.length !== current.customers.length;
          const total = Math.max(
            0,
            current.pagination.total - (wasPresent ? 1 : 0),
          );

          return {
            customers,
            pagination: {
              ...current.pagination,
              total,
              totalPages: Math.ceil(total / current.pagination.limit),
            },
          };
        },
      );

      void queryClient.invalidateQueries({
        queryKey: [...queryKeys.customers.all, "list"],
      });
    },
  });
}
