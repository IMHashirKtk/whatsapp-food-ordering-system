import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { menuService } from "../services/menu.service";
import type { MenuQueryOptions } from "../types";

export function useOptions(
  optionGroupId: string | null | undefined,
  options?: MenuQueryOptions,
) {
  const enabled = Boolean(optionGroupId) && (options?.enabled ?? true);

  return useQuery({
    queryKey: queryKeys.menu.options.byGroup(optionGroupId ?? ""),
    queryFn: () => menuService.getOptionsByGroup(optionGroupId ?? ""),
    enabled,
  });
}
