import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { settingsService } from "../services/settings.service";
import type { MetaSettingsPayload } from "../types";

export function useUpdateMetaSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MetaSettingsPayload) =>
      settingsService.updateMeta(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.settings.detail,
      });
    },
  });
}
