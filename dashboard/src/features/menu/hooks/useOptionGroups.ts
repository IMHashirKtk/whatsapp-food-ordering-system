import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { menuService } from "../services/menu.service";
import type { MenuQueryOptions } from "../types";

export function useOptionGroups(
  menuItemId: string | null | undefined,
  options?: MenuQueryOptions,
) {
  const enabled = Boolean(menuItemId) && (options?.enabled ?? true);

  return useQuery({
    queryKey: queryKeys.menu.optionGroups.byMenuItem(menuItemId ?? ""),
    queryFn: () => menuService.getOptionGroupsByMenuItem(menuItemId ?? ""),
    enabled,
  });
}
