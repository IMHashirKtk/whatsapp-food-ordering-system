import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { menuService } from "../services/menu.service";
import type { MenuQueryOptions } from "../types";

export function useMenuItem(
  menuItemId: string | null | undefined,
  options?: MenuQueryOptions,
) {
  const enabled = Boolean(menuItemId) && (options?.enabled ?? true);

  return useQuery({
    queryKey: queryKeys.menu.items.detail(menuItemId ?? ""),
    queryFn: () => menuService.getMenuItem(menuItemId ?? ""),
    enabled,
  });
}
