import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { settingsService } from "../services/settings.service";
import type { PaymentMethodsPayload } from "../types";

export function useUpdatePaymentMethods() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PaymentMethodsPayload) =>
      settingsService.updatePaymentMethods(payload),
    onSuccess: async (settings) => {
      queryClient.setQueryData(queryKeys.settings.detail, settings);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.settings.detail,
      });
    },
  });
}
