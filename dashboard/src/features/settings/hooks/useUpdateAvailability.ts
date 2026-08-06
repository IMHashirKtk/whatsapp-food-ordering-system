import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { settingsService } from "../services/settings.service";
import type { AvailabilityPayload } from "../types";

export function useUpdateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AvailabilityPayload) =>
      settingsService.updateAvailability(payload),
    onSuccess: async (settings) => {
      queryClient.setQueryData(queryKeys.settings.detail, settings);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.settings.detail,
      });
    },
  });
}
