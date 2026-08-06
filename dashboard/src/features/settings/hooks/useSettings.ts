import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { settingsService } from "../services/settings.service";

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings.detail,
    queryFn: settingsService.getSettings,
  });
}
