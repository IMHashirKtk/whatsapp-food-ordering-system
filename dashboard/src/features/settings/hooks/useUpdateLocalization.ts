import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { settingsService } from "../services/settings.service";
import type { LocalizationPayload } from "../types";

export function useUpdateLocalization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LocalizationPayload) =>
      settingsService.updateLocalization(payload),
    onSuccess: async (settings) => {
      queryClient.setQueryData(queryKeys.settings.detail, settings);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.settings.detail,
      });
    },
  });
}
