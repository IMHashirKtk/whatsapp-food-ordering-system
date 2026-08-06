import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { settingsService } from "../services/settings.service";
import type { AISettingsPayload } from "../types";

export function useUpdateAISettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AISettingsPayload) => settingsService.updateAI(payload),
    onSuccess: async (settings) => {
      queryClient.setQueryData(queryKeys.settings.detail, settings);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.settings.detail,
      });
    },
  });
}
