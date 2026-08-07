import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { settingsService } from "../services/settings.service";
import type { OrderConfigPayload } from "../types";

export function useUpdateOrderConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OrderConfigPayload) =>
      settingsService.updateOrderConfig(payload),
    onSuccess: async (settings) => {
      queryClient.setQueryData(queryKeys.settings.detail, settings);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.settings.detail,
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard,
        refetchType: "active",
      });
    },
  });
}
