import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { settingsService } from "../services/settings.service";
import type { ProfileSettingsPayload } from "../types";

export function useUpdateProfileSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProfileSettingsPayload) =>
      settingsService.updateProfile(payload),
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
