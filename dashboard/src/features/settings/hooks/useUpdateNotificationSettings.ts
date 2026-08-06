import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { settingsService } from "../services/settings.service";
import type { NotificationSettingsPayload } from "../types";

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: NotificationSettingsPayload) =>
      settingsService.updateNotifications(payload),
    onSuccess: async (settings) => {
      queryClient.setQueryData(queryKeys.settings.detail, settings);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.settings.detail,
      });
    },
  });
}
