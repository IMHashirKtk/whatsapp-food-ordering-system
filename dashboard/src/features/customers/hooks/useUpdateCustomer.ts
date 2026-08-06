import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { customerService } from "../services/customer.service";
import type { CustomerDetail, CustomerUpdatePayload } from "../types";

interface UpdateCustomerVariables {
  id: string;
  payload: CustomerUpdatePayload;
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateCustomerVariables) =>
      customerService.updateCustomer(id, payload),
    onSuccess: (customer) => {
      const existingDetail = queryClient.getQueryData<CustomerDetail>(
        queryKeys.customers.detail(customer.id),
      );

      if (existingDetail) {
        queryClient.setQueryData<CustomerDetail>(
          queryKeys.customers.detail(customer.id),
          { ...existingDetail, customer },
        );
      }

      void queryClient.invalidateQueries({
        queryKey: [...queryKeys.customers.all, "list"],
      });
    },
  });
}
