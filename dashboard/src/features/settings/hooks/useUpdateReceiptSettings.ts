import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { settingsService } from "../services/settings.service";
import type { ReceiptSettingsPayload } from "../types";

export function useUpdateReceiptSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReceiptSettingsPayload) =>
      settingsService.updateReceipt(payload),
    onSuccess: async (settings) => {
      queryClient.setQueryData(queryKeys.settings.detail, settings);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.settings.detail,
      });
    },
  });
}
